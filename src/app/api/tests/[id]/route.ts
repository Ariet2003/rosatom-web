import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const testId = parseInt(id);

    if (isNaN(testId)) {
      return NextResponse.json(
        { error: 'Неверный ID теста' },
        { status: 400 }
      );
    }

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
        },
        createdBy: {
          select: {
            fullName: true
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

    return NextResponse.json(test);
  } catch (error) {
    console.error('Ошибка получения теста:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 