import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAdminToken } from '@/lib/jwt';

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

    // Получаем пользователя-админа из базы данных
    const adminUser = await prisma.user.findUnique({
      where: { email: adminCredentials.login },
      include: { role: true }
    });

    if (!adminUser) {
      return NextResponse.json(
        { message: 'Пользователь-администратор не найден' },
        { status: 404 }
      );
    }

    // Создаем объект пользователя для админа
    const adminUserData = {
      id: adminUser.id,
      email: adminUser.email,
      fullName: adminUser.fullName,
      roleId: adminUser.roleId,
      roleName: adminUser.role.name,
      createdAt: adminUser.createdAt.toISOString()
    };

    // Устанавливаем cookie для аутентификации
    const response = NextResponse.json({
      message: 'Успешный вход',
      user: adminUserData
    });

    // Устанавливаем httpOnly cookie с JWT токеном
    const token = createAdminToken({
      id: adminUser.id,
      email: adminUser.email,
      fullName: adminUser.fullName,
      roleName: adminUser.role.name
    });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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