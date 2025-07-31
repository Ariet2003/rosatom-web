import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newLogin, newPassword } = await request.json();

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Текущий пароль обязателен' },
        { status: 400 }
      );
    }

    // Получаем текущие настройки админа
    const adminSettings = await prisma.settings.findUnique({
      where: {
        key: 'admin_login'
      }
    });

    if (!adminSettings) {
      return NextResponse.json(
        { error: 'Настройки администратора не найдены' },
        { status: 404 }
      );
    }

    // Парсим JSON из поля value
    let adminCredentials;
    try {
      adminCredentials = JSON.parse(adminSettings.value);
    } catch (error) {
      return NextResponse.json(
        { error: 'Ошибка в настройках администратора' },
        { status: 500 }
      );
    }

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminCredentials.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный текущий пароль' },
        { status: 401 }
      );
    }

    // Подготавливаем новые данные
    const updatedCredentials = {
      login: newLogin || adminCredentials.login,
      password: adminCredentials.password // Пока оставляем старый пароль
    };

    // Если указан новый пароль, хешируем его
    if (newPassword) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      updatedCredentials.password = hashedPassword;
    }

    // Обновляем настройки в базе данных
    await prisma.settings.update({
      where: {
        key: 'admin_login'
      },
      data: {
        value: JSON.stringify(updatedCredentials)
      }
    });

    // Если изменился логин, обновляем email пользователя в таблице User
    if (newLogin && newLogin !== adminCredentials.login) {
      await prisma.user.updateMany({
        where: {
          email: adminCredentials.login
        },
        data: {
          email: newLogin
        }
      });
    }

    return NextResponse.json({
      message: 'Учетные данные успешно обновлены',
      updatedLogin: updatedCredentials.login
    });

  } catch (error) {
    console.error('Ошибка обновления учетных данных админа:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 