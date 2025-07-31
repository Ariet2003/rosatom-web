import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAdminAuth } from '@/lib/jwt';

// GET - получение детального результата
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем аутентификацию админа
    const auth = await getServerAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // Получаем детальную информацию о результате
    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true
          }
        },
        test: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true
          }
        },
        answers: {
          include: {
            question: {
              include: {
                options: true
              }
            },
            selectedOption: true,
            aiFeedback: true
          },
          orderBy: {
            question: {
              id: 'asc'
            }
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Вычисляем статистику
    const totalQuestions = session.answers.length;
    const correctAnswers = session.answers.filter(answer => {
      if (answer.question.type === 'MULTIPLE_CHOICE') {
        return answer.selectedOption?.isCorrect;
      }
      return answer.aiScore && answer.aiScore > 0;
    }).length;

    const openQuestions = session.answers.filter(answer => 
      answer.question.type === 'OPEN'
    ).length;

    const multipleChoiceQuestions = session.answers.filter(answer => 
      answer.question.type === 'MULTIPLE_CHOICE'
    ).length;

    // Формируем детальные данные ответов
    const detailedAnswers = session.answers.map(answer => ({
      id: answer.id,
      questionId: answer.questionId,
      questionText: answer.question.text,
      questionType: answer.question.type,
      questionScore: answer.question.score,
      selectedOption: answer.selectedOption ? {
        id: answer.selectedOption.id,
        text: answer.selectedOption.text,
        isCorrect: answer.selectedOption.isCorrect
      } : null,
      openAnswer: answer.openAnswer,
      aiScore: answer.aiScore,
      aiFeedback: answer.aiFeedback ? {
        feedback: answer.aiFeedback.feedback,
        score: answer.aiFeedback.score,
        evaluatedAt: answer.aiFeedback.evaluatedAt
      } : null,
      correctOptions: answer.question.type === 'MULTIPLE_CHOICE' ? 
        answer.question.options.filter(opt => opt.isCorrect).map(opt => ({
          id: opt.id,
          text: opt.text
        })) : null,
      isCorrect: answer.question.type === 'MULTIPLE_CHOICE' ? 
        answer.selectedOption?.isCorrect : 
        (answer.aiScore && answer.aiScore > 0)
    }));

    const result = {
      id: session.id,
      user: {
        id: session.user.id,
        fullName: session.user.fullName,
        email: session.user.email,
        registeredAt: session.user.createdAt
      },
      test: {
        id: session.test.id,
        title: session.test.title,
        description: session.test.description,
        createdAt: session.test.createdAt
      },
      session: {
        startedAt: session.startedAt,
        finishedAt: session.finishedAt,
        totalScore: session.totalScore,
        duration: session.finishedAt ? 
          Math.round((session.finishedAt.getTime() - session.startedAt.getTime()) / 1000 / 60) : null // в минутах
      },
      statistics: {
        totalQuestions,
        correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        openQuestions,
        multipleChoiceQuestions
      },
      answers: detailedAnswers
    };

    return NextResponse.json({ result });

  } catch (error) {
    console.error('Ошибка получения детального результата:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 