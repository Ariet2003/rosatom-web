import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Файл и ID пользователя обязательны' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Файл должен быть изображением' },
        { status: 400 }
      );
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Размер файла не должен превышать 5MB' },
        { status: 400 }
      );
    }

    // Конвертируем файл в base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Загружаем на ImgBB
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return NextResponse.json(
        { error: 'API ключ ImgBB не настроен' },
        { status: 500 }
      );
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append('image', base64Image);
    imgbbFormData.append('key', imgbbApiKey);

    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData,
    });

    if (!imgbbResponse.ok) {
      return NextResponse.json(
        { error: 'Ошибка загрузки изображения на ImgBB' },
        { status: 500 }
      );
    }

    const imgbbData = await imgbbResponse.json();
    const imageUrl = imgbbData.data.url;

    // Сохраняем URL в базу данных
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { profileImageUrl: imageUrl },
      include: {
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        profileImageUrl: updatedUser.profileImageUrl,
        roleName: updatedUser.role.name,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 