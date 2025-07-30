import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Получаем userId из query параметров или заголовков
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID пользователя обязателен' },
        { status: 400 }
      );
    }

    const sessions = await prisma.testSession.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        test: {
          select: {
            title: true,
          },
        },
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Ошибка получения результатов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, userId, answers, textAnswers } = body;

    if (!testId || !userId || (!answers && !textAnswers)) {
      return NextResponse.json(
        { error: 'Необходимы testId, userId и answers или textAnswers' },
        { status: 400 }
      );
    }

    // Получаем тест с вопросами и правильными ответами
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            options: {
              where: { isCorrect: true }
            }
          }
        }
      }
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Тест не найден' },
        { status: 404 }
      );
    }

    // Подсчитываем правильные ответы
    let correctAnswers = 0;
    const totalQuestions = test.questions.length;

    for (const question of test.questions) {
      if (question.type === 'MULTIPLE_CHOICE') {
        const userAnswer = answers?.[question.id];
        const correctOption = question.options[0]; // Предполагаем, что правильный ответ один

        if (userAnswer && correctOption && userAnswer === correctOption.id) {
          correctAnswers++;
        }
      } else if (question.type === 'OPEN') {
        const userTextAnswer = textAnswers?.[question.id];
        // Для открытых вопросов считаем ответ правильным, если он не пустой
        if (userTextAnswer && userTextAnswer.trim() !== '') {
          correctAnswers++;
        }
      }
    }

    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Создаем сессию теста
    const testSession = await prisma.testSession.create({
      data: {
        testId: testId,
        userId: userId,
        totalScore: correctAnswers,
        startedAt: new Date(),
        finishedAt: new Date(),
      }
    });

    // Сохраняем ответы пользователя
    for (const [questionId, optionId] of Object.entries(answers || {})) {
      await prisma.answer.create({
        data: {
          testSessionId: testSession.id,
          questionId: parseInt(questionId),
          selectedOptionId: optionId as number,
        }
      });
    }

    // Сохраняем текстовые ответы пользователя
    for (const [questionId, textAnswer] of Object.entries(textAnswers || {})) {
      await prisma.answer.create({
        data: {
          testSessionId: testSession.id,
          questionId: parseInt(questionId),
          openAnswer: textAnswer,
        }
      });
    }

    return NextResponse.json({
      correctAnswers,
      totalQuestions,
      percentage,
      sessionId: testSession.id
    });
  } catch (error) {
    console.error('Ошибка сохранения результатов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 