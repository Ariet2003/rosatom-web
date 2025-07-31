import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAdminAuth } from '@/lib/jwt';

export async function GET() {
  try {
    // Проверяем аутентификацию админа
    const auth = await getServerAdminAuth();
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем статистику из базы данных
    const [
      usersCount,
      testsCount,
      completedTestsCount,
      recentTestSessions,
      monthlyStats
    ] = await Promise.all([
      // Количество пользователей
      prisma.user.count(),
      
      // Количество тестов
      prisma.test.count(),
      
      // Количество завершенных тестов
      prisma.testSession.count({
        where: {
          finishedAt: { not: null }
        }
      }),
      
      // Последние 10 завершенных тестов для диаграммы
      prisma.testSession.findMany({
        where: {
          finishedAt: { not: null }
        },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          },
          test: {
            select: {
              title: true
            }
          }
        },
        orderBy: {
          finishedAt: 'desc'
        },
        take: 10
      }),
      
      // Статистика по месяцам за последние 6 месяцев
      prisma.testSession.groupBy({
        by: ['finishedAt'],
        where: {
          finishedAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        },
        _count: {
          id: true
        }
      })
    ]);

    // Группируем данные по месяцам для диаграммы
    const monthlyData = monthlyStats.reduce((acc, session) => {
      if (session.finishedAt) {
        const month = session.finishedAt.toISOString().slice(0, 7); // YYYY-MM
        acc[month] = (acc[month] || 0) + session._count.id;
      }
      return acc;
    }, {} as Record<string, number>);

    // Заполняем недостающие месяцы нулями
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().slice(0, 7);
      last6Months.push({
        month: month,
        count: monthlyData[month] || 0
      });
    }

    return NextResponse.json({
      stats: {
        users: usersCount,
        tests: testsCount,
        completedTests: completedTestsCount,
        systemStatus: 'OK'
      },
      recentSessions: recentTestSessions.map(session => ({
        id: session.id,
        userName: session.user.fullName,
        userEmail: session.user.email,
        testTitle: session.test.title,
        score: session.totalScore,
        finishedAt: session.finishedAt
      })),
      monthlyChart: last6Months
    });

  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 