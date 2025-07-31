import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerAdminAuth } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const admin = await getServerAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              testSessions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getServerAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('id') || '0');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Проверяем, что пользователь не является админом
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role?.name === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin user' }, { status: 400 });
    }

    // Удаляем пользователя и все связанные данные
    await prisma.$transaction(async (tx) => {
      // Удаляем все AI фидбеки для ответов пользователя
      const userSessions = await tx.testSession.findMany({
        where: { userId },
        include: {
          answers: {
            include: {
              aiFeedback: true
            }
          }
        }
      });

      for (const session of userSessions) {
        for (const answer of session.answers) {
          if (answer.aiFeedback) {
            await tx.aiFeedback.delete({
              where: { answerId: answer.id }
            });
          }
        }
      }

      // Удаляем все ответы пользователя
      await tx.answer.deleteMany({
        where: {
          testSession: {
            userId
          }
        }
      });

      // Удаляем все сессии тестов пользователя
      await tx.testSession.deleteMany({
        where: { userId }
      });

      // Удаляем пользователя
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getServerAdminAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, fullName } = body;

    if (!id || !fullName) {
      return NextResponse.json({ error: 'User ID and full name are required' }, { status: 400 });
    }

    const userId = parseInt(id);

    // Проверяем, что пользователь существует
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Обновляем ФИО пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true
      }
    });

    return NextResponse.json({ user: updatedUser, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 