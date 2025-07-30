import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const tests = await prisma.test.findMany({
      include: {
        createdBy: {
          select: {
            fullName: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
        },
        _count: {
          select: {
            questions: true,
            testSessions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Ошибка получения тестов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 