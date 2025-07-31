import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAdminAuth } from '@/lib/jwt';

// GET - получение списка результатов с пагинацией
export async function GET(request: NextRequest) {
  try {
    // Проверяем аутентификацию админа
    const auth = await getServerAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    // Вычисляем offset для пагинации
    const offset = (page - 1) * limit;

    // Формируем условия поиска
    const whereClause: Record<string, unknown> = {};
    if (search) {
      whereClause.OR = [
        {
          user: {
            fullName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          test: {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Получаем результаты с пагинацией
    const [results, totalCount] = await Promise.all([
      prisma.testSession.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          test: {
            select: {
              id: true,
              title: true
            }
          },
          answers: {
            include: {
              question: true,
              selectedOption: true
            }
          }
        },
        orderBy: {
          startedAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.testSession.count({
        where: whereClause
      })
    ]);

    // Вычисляем общее количество страниц
    const totalPages = Math.ceil(totalCount / limit);

    // Формируем данные для ответа
    const resultsData = results.map(session => ({
      id: session.id,
      userId: session.userId,
      testId: session.testId,
      userName: session.user.fullName,
      userEmail: session.user.email,
      testTitle: session.test.title,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      totalScore: session.totalScore,
      questionsCount: session.answers.length,
      isCompleted: !!session.finishedAt
    }));

    return NextResponse.json({
      results: resultsData,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Ошибка получения результатов:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 