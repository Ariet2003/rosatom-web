import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAdminToken, setAdminTokenCookie } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email и код подтверждения обязательны' },
        { status: 400 }
      );
    }

    // Получаем сохраненный код из настроек
    const verificationSettings = await prisma.settings.findUnique({
      where: {
        key: 'admin_verification_code'
      }
    });

    if (!verificationSettings) {
      return NextResponse.json(
        { message: 'Код подтверждения не найден. Запросите новый код.' },
        { status: 404 }
      );
    }

    // Парсим данные кода
    let codeData;
    try {
      codeData = JSON.parse(verificationSettings.value);
    } catch (error) {
      return NextResponse.json(
        { message: 'Ошибка в данных кода подтверждения' },
        { status: 500 }
      );
    }

    // Проверяем email
    if (codeData.email !== email) {
      return NextResponse.json(
        { message: 'Неверный email' },
        { status: 401 }
      );
    }

    // Проверяем срок действия кода
    const now = new Date();
    const expiresAt = new Date(codeData.expiresAt);
    
    if (now > expiresAt) {
      // Удаляем истекший код
      await prisma.settings.delete({
        where: { key: 'admin_verification_code' }
      });
      
      return NextResponse.json(
        { message: 'Код подтверждения истек. Запросите новый код.' },
        { status: 401 }
      );
    }

    // Проверяем количество попыток
    if (codeData.attempts >= 3) {
      // Удаляем код после превышения лимита попыток
      await prisma.settings.delete({
        where: { key: 'admin_verification_code' }
      });
      
      return NextResponse.json(
        { message: 'Превышено количество попыток. Запросите новый код.' },
        { status: 401 }
      );
    }

    // Проверяем код
    if (codeData.code !== code) {
      // Увеличиваем счетчик попыток
      codeData.attempts += 1;
      await prisma.settings.update({
        where: { key: 'admin_verification_code' },
        data: { value: JSON.stringify(codeData) }
      });
      
      return NextResponse.json(
        { message: 'Неверный код подтверждения' },
        { status: 401 }
      );
    }

    // Код верный - удаляем его из базы
    await prisma.settings.delete({
      where: { key: 'admin_verification_code' }
    });

    // Создаем объект пользователя для админа
    const adminUser = {
      id: 0, // Специальный ID для админа
      email: email,
      fullName: 'Администратор',
      roleName: 'admin'
    };

    // Создаем JWT токен
    const token = createAdminToken(adminUser);

    // Устанавливаем cookie для аутентификации
    const response = NextResponse.json({
      message: 'Успешная аутентификация',
      user: {
        ...adminUser,
        isAdmin: true,
        createdAt: new Date().toISOString()
      }
    });

    // Устанавливаем httpOnly cookie с JWT токеном
    await setAdminTokenCookie(token);

    return response;

  } catch (error) {
    console.error('Ошибка проверки кода подтверждения:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 