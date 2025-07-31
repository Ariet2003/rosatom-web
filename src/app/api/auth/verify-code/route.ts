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

    // Находим или создаем пользователя-админа
    let adminUser = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!adminUser) {
      // Находим роль админа
      const adminRole = await prisma.role.findUnique({
        where: { name: 'admin' }
      });

      if (!adminRole) {
        return NextResponse.json(
          { message: 'Ошибка: роль администратора не найдена' },
          { status: 500 }
        );
      }

      // Создаем нового пользователя-админа
      adminUser = await prisma.user.create({
        data: {
          email: email,
          fullName: 'Администратор',
          password: '', // Пустой пароль для админа
          roleId: adminRole.id
        }
      });
    }

    // Создаем JWT токен
    const token = createAdminToken({
      id: adminUser.id,
      email: adminUser.email,
      fullName: adminUser.fullName,
      roleName: 'admin'
    });

    // Устанавливаем cookie для аутентификации
    const response = NextResponse.json({
      message: 'Успешная аутентификация',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        roleName: 'admin',
        isAdmin: true,
        createdAt: adminUser.createdAt.toISOString()
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