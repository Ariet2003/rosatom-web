import { NextRequest, NextResponse } from 'next/server';
import { getServerAdminAuth } from '@/lib/jwt';

export async function GET() {
  try {
    const { isAuthenticated, user } = await getServerAdminAuth();

    if (!isAuthenticated || !user || !user.isAdmin) {
      return NextResponse.json(
        { message: 'Не авторизован как администратор' },
        { status: 401 }
      );
    }

    // Возвращаем данные админа (без чувствительной информации)
    const adminData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleName: user.roleName,
      isAdmin: user.isAdmin,
      createdAt: new Date(user.iat * 1000).toISOString()
    };

    return NextResponse.json({
      message: 'Админ аутентифицирован',
      user: adminData
    });

  } catch (error) {
    console.error('Ошибка проверки админ аутентификации:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 