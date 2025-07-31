import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Получаем настройки админа из таблицы Settings
    const adminSettings = await prisma.settings.findUnique({
      where: {
        key: 'admin_login'
      }
    });

    if (!adminSettings) {
      return NextResponse.json(
        { message: 'Настройки администратора не найдены' },
        { status: 404 }
      );
    }

    // Парсим JSON из поля value
    let adminCredentials;
    try {
      adminCredentials = JSON.parse(adminSettings.value);
    } catch (error) {
      return NextResponse.json(
        { message: 'Ошибка в настройках администратора' },
        { status: 500 }
      );
    }

    // Проверяем email
    if (adminCredentials.login !== email) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, adminCredentials.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Создаем объект пользователя для админа
    const adminUser = {
      id: 0, // Специальный ID для админа
      email: adminCredentials.login,
      fullName: 'Администратор',
      roleId: 0,
      roleName: 'admin',
      createdAt: new Date().toISOString()
    };

    // Устанавливаем cookie для аутентификации
    const response = NextResponse.json({
      message: 'Успешный вход',
      user: adminUser
    });

    // Устанавливаем httpOnly cookie
    response.cookies.set('auth-token', 'admin-authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    });

    return response;

  } catch (error) {
    console.error('Ошибка входа администратора:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 