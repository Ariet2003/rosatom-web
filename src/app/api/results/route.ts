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

    // Создаем сессию теста
    const testSession = await prisma.testSession.create({
      data: {
        testId: testId,
        userId: userId,
        totalScore: 0, // Временно 0, обновим после сохранения ответов
        startedAt: new Date(),
        finishedAt: new Date(),
      }
    });

    // Сохраняем ответы пользователя с баллами
    let totalScore = 0;
    let correctAnswers = 0;

    for (const question of test.questions) {
      let aiScore = 0;
      let aiFeedback = null;
      
      if (question.type === 'MULTIPLE_CHOICE') {
        const userAnswer = answers?.[question.id];
        const correctOption = question.options[0];
        
        if (userAnswer && correctOption && userAnswer === correctOption.id) {
          aiScore = question.score; // Полный балл за правильный ответ
          correctAnswers++;
        }
        
        const answer = await prisma.answer.create({
          data: {
            testSessionId: testSession.id,
            questionId: question.id,
            selectedOptionId: userAnswer || null,
            aiScore: aiScore,
          }
        });
      } else if (question.type === 'OPEN') {
        const userTextAnswer = textAnswers?.[question.id];
        
        if (userTextAnswer && userTextAnswer.trim() !== '') {
          correctAnswers++;
          
          // Оцениваем ответ через ИИ
          try {
            const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai-evaluate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                questionText: question.text,
                userAnswer: userTextAnswer,
                maxScore: question.score
              }),
            });

            if (aiResponse.ok) {
              const aiResult = await aiResponse.json();
              aiScore = aiResult.score;
              aiFeedback = aiResult.feedback;
            } else {
              // Если ИИ недоступен, даем полный балл за любой ответ
              aiScore = question.score;
            }
          } catch (error) {
            console.error('Ошибка оценки ИИ:', error);
            // Если ИИ недоступен, даем полный балл за любой ответ
            aiScore = question.score;
          }
        }
        
        const answer = await prisma.answer.create({
          data: {
            testSessionId: testSession.id,
            questionId: question.id,
            openAnswer: userTextAnswer || null,
            aiScore: aiScore,
          }
        });

        // Создаем запись в AiFeedback если есть обратная связь
        if (aiFeedback) {
          await prisma.aiFeedback.create({
            data: {
              answerId: answer.id,
              feedback: aiFeedback,
              score: aiScore,
            }
          });
        }
      }
      
      totalScore += aiScore;
    }

    // Обновляем общий балл в сессии
    await prisma.testSession.update({
      where: { id: testSession.id },
      data: { totalScore: totalScore }
    });

    const totalQuestions = test.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Сохраняем ответы пользователя с баллами
    for (const question of test.questions) {
      let aiScore = 0;
      let aiFeedback = null;
      
      if (question.type === 'MULTIPLE_CHOICE') {
        const userAnswer = answers?.[question.id];
        const correctOption = question.options[0];
        
        if (userAnswer && correctOption && userAnswer === correctOption.id) {
          aiScore = question.score; // Полный балл за правильный ответ
        }
        
        const answer = await prisma.answer.create({
          data: {
            testSessionId: testSession.id,
            questionId: question.id,
            selectedOptionId: userAnswer || null,
            aiScore: aiScore,
          }
        });
      } else if (question.type === 'OPEN') {
        const userTextAnswer = textAnswers?.[question.id];
        
        if (userTextAnswer && userTextAnswer.trim() !== '') {
          // Оцениваем ответ через ИИ
          try {
            const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai-evaluate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                questionText: question.text,
                userAnswer: userTextAnswer,
                maxScore: question.score
              }),
            });

            if (aiResponse.ok) {
              const aiResult = await aiResponse.json();
              aiScore = aiResult.score;
              aiFeedback = aiResult.feedback;
            } else {
              // Если ИИ недоступен, даем полный балл за любой ответ
              aiScore = question.score;
            }
          } catch (error) {
            console.error('Ошибка оценки ИИ:', error);
            // Если ИИ недоступен, даем полный балл за любой ответ
            aiScore = question.score;
          }
        }
        
        const answer = await prisma.answer.create({
          data: {
            testSessionId: testSession.id,
            questionId: question.id,
            openAnswer: userTextAnswer || null,
            aiScore: aiScore,
          }
        });

        // Создаем запись в AiFeedback если есть обратная связь
        if (aiFeedback) {
          await prisma.aiFeedback.create({
            data: {
              answerId: answer.id,
              feedback: aiFeedback,
              score: aiScore,
            }
          });
        }
      }
    }

    return NextResponse.json({
      correctAnswers,
      totalQuestions,
      percentage,
      totalScore,
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