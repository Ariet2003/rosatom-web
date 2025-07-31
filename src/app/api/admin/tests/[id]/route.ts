import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAdminAuth } from '@/lib/jwt';

// GET - получение теста по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getServerAdminAuth();
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const testId = parseInt(id);
    if (isNaN(testId)) {
      return NextResponse.json(
        { error: 'Неверный ID теста' },
        { status: 400 }
      );
    }

    // Получаем тест с вопросами и вариантами ответов
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            options: true
          },
          orderBy: {
            id: 'asc'
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

    return NextResponse.json({
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        createdAt: test.createdAt,
        questions: test.questions.map(question => ({
          id: question.id,
          text: question.text,
          type: question.type,
          score: question.score,
          options: question.options
        }))
      }
    });

  } catch (error) {
    console.error('Ошибка получения теста:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT - обновление теста
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getServerAdminAuth();
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const testId = parseInt(id);
    if (isNaN(testId)) {
      return NextResponse.json(
        { error: 'Неверный ID теста' },
        { status: 400 }
      );
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

    // Обновляем тест с вопросами в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем тест
      const updatedTest = await tx.test.update({
        where: { id: testId },
        data: {
          title: test.title,
          description: test.description || null
        }
      });

      // Получаем все существующие вопросы для этого теста
      const existingQuestions = await tx.question.findMany({
        where: { testId: testId },
        include: { 
          options: true,
          answers: {
            include: {
              aiFeedback: true
            }
          }
        }
      });

      // Удаляем все AI фидбеки для ответов
      for (const question of existingQuestions) {
        for (const answer of question.answers) {
          if (answer.aiFeedback) {
            await tx.aiFeedback.delete({
              where: { answerId: answer.id }
            });
          }
        }
      }

      // Удаляем все ответы для существующих вопросов
      for (const question of existingQuestions) {
        await tx.answer.deleteMany({
          where: { questionId: question.id }
        });
      }

      // Удаляем все варианты ответов для существующих вопросов
      for (const question of existingQuestions) {
        await tx.option.deleteMany({
          where: { questionId: question.id }
        });
      }

      // Удаляем все существующие вопросы
      await tx.question.deleteMany({
        where: { testId: testId }
      });

      // Создаем новые вопросы и варианты ответов
      for (const question of questions) {
        const newQuestion = await tx.question.create({
          data: {
            testId: testId,
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

      return updatedTest;
    });

    return NextResponse.json({
      message: 'Тест успешно обновлен',
      testId: result.id
    });

  } catch (error) {
    console.error('Ошибка обновления теста:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - удаление теста
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getServerAdminAuth();
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const testId = parseInt(id);
    if (isNaN(testId)) {
      return NextResponse.json(
        { error: 'Неверный ID теста' },
        { status: 400 }
      );
    }

    // Проверяем существование теста
    const test = await prisma.test.findUnique({
      where: { id: testId }
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Тест не найден' },
        { status: 404 }
      );
    }

    // Удаляем тест (каскадное удаление вопросов и вариантов настроено в схеме)
    await prisma.test.delete({
      where: { id: testId }
    });

    return NextResponse.json({
      message: 'Тест успешно удален'
    });

  } catch (error) {
    console.error('Ошибка удаления теста:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 