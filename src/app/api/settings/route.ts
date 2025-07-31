import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/settings - получить все настройки или конкретную настройку по ключу
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // Получить конкретную настройку по ключу
      const setting = await prisma.settings.findUnique({
        where: { key }
      });

      if (!setting) {
        return NextResponse.json(
          { error: 'Настройка не найдена' },
          { status: 404 }
        );
      }

      return NextResponse.json(setting);
    } else {
      // Получить все настройки
      const settings = await prisma.settings.findMany({
        orderBy: { key: 'asc' }
      });

      return NextResponse.json(settings);
    }
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST /api/settings - создать новую настройку
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Ключ и значение обязательны' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли уже настройка с таким ключом
    const existingSetting = await prisma.settings.findUnique({
      where: { key }
    });

    if (existingSetting) {
      return NextResponse.json(
        { error: 'Настройка с таким ключом уже существует' },
        { status: 409 }
      );
    }

    // Создаем новую настройку
    const setting = await prisma.settings.create({
      data: { key, value }
    });

    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании настройки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - обновить существующую настройку
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Ключ и значение обязательны' },
        { status: 400 }
      );
    }

    // Обновляем настройку
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Ошибка при обновлении настройки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE /api/settings - удалить настройку
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Ключ обязателен для удаления' },
        { status: 400 }
      );
    }

    // Удаляем настройку
    await prisma.settings.delete({
      where: { key }
    });

    return NextResponse.json({ message: 'Настройка успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении настройки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 