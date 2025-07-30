import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Ошибка получения ролей:', error);
    return NextResponse.json(
      { error: 'Ошибка получения ролей из базы данных' },
      { status: 500 }
    );
  }
} 