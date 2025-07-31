import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAdminAuth } from '@/lib/jwt';

// GET - получение списка тестов
export async function GET(request: NextRequest) {
  try {
    const auth = await getServerAdminAuth();
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tests = await prisma.test.findMany({
      include: {
        _count: {
          select: {
            questions: true
          }
        },
        createdBy: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedTests = tests.map(test => ({
      id: test.id,
      title: test.title,
      description: test.description,
      createdAt: test.createdAt.toISOString(),
      questionsCount: test._count.questions,
      createdBy: test.createdBy.fullName
    }));

    return NextResponse.json({ tests: formattedTests });

  } catch (error) {
    console.error('Ошибка получения тестов:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - создание нового теста
export async function POST(request: NextRequest) {
  try {
    const auth = await getServerAdminAuth();
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { test, questions } = body;

    if (!test || !test.title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Необходимо указать название теста и добавить вопросы' },
        { status: 400 }
      );
    }

    // Валидация вопросов
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text || !question.text.trim()) {
        return NextResponse.json(
          { error: `Вопрос ${i + 1}: текст вопроса обязателен` },
          { status: 400 }
        );
      }

      if (question.type === 'MULTIPLE_CHOICE') {
        if (!question.options || question.options.length === 0) {
          return NextResponse.json(
            { error: `Вопрос ${i + 1}: для вопросов с вариантами ответов необходимо добавить варианты` },
            { status: 400 }
          );
        }

        const hasCorrectOption = question.options.some((opt: any) => opt.isCorrect);
        if (!hasCorrectOption) {
          return NextResponse.json(
            { error: `Вопрос ${i + 1}: выберите правильный ответ` },
            { status: 400 }
          );
        }
      }
    }

    // Создаем тест с вопросами в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Создаем тест
      const newTest = await tx.test.create({
        data: {
          title: test.title,
          description: test.description || null,
          createdById: 1 // Всегда используем ID 1 для админа
        }
      });

      // Создаем вопросы и варианты ответов
      for (const question of questions) {
        const newQuestion = await tx.question.create({
          data: {
            testId: newTest.id,
            text: question.text,
            type: question.type,
            score: question.score || 1
          }
        });

        // Если это вопрос с вариантами ответов, создаем варианты
        if (question.type === 'MULTIPLE_CHOICE' && question.options) {
          for (const option of question.options) {
            await tx.option.create({
              data: {
                questionId: newQuestion.id,
                text: option.text,
                isCorrect: option.isCorrect
              }
            });
          }
        }
      }

      return newTest;
    });

    return NextResponse.json({
      message: 'Тест успешно создан',
      testId: result.id
    });

  } catch (error) {
    console.error('Ошибка создания теста:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 