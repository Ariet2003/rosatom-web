import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Создаем роли, если их нет
    const roles = [
      { name: 'Студент' },
      { name: 'Выпускник' },
      { name: 'Молодой специалист' },
      { name: 'Опытный специалист' },
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: { name: role.name },
      });
    }

    const createdRoles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({
      message: 'База данных заполнена ролями',
      roles: createdRoles,
    });
  } catch (error) {
    console.error('Ошибка заполнения БД:', error);
    return NextResponse.json(
      { error: 'Ошибка заполнения базы данных' },
      { status: 500 }
    );
  }
} 