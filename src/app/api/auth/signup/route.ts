import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, roleId, password } = body;

    // Валидация
    if (!email || !fullName || !roleId || !password) {
      return NextResponse.json(
        { message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем, что email не занят
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Проверяем, что роль существует
    const role = await prisma.role.findUnique({
      where: { id: parseInt(roleId) },
    });

    if (!role) {
      return NextResponse.json(
        { message: 'Указанная роль не существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        roleId: parseInt(roleId),
      },
      include: {
        role: true,
      },
    });

    // Подготавливаем данные пользователя для ответа
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: user.role.name,
      createdAt: user.createdAt,
    };

    // Устанавливаем куки аутентификации
    const cookieStore = await cookies();
    cookieStore.set('auth_token', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
    });

    console.log('Пользователь успешно зарегистрирован:', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
    });

    return NextResponse.json(
      { 
        message: 'Пользователь успешно зарегистрирован',
        user: userData
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
} 