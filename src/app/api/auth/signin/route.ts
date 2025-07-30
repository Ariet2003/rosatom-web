import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны для входа' },
        { status: 400 }
      );
    }

    // Ищем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Возвращаем данные пользователя (без пароля)
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: user.role.name,
      profileImageUrl: user.profileImageUrl,
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

    console.log('Успешный вход пользователя:', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    return NextResponse.json(
      { 
        message: 'Вход выполнен успешно',
        user: userData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Ошибка входа:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при входе' },
      { status: 500 }
    );
  }
} 