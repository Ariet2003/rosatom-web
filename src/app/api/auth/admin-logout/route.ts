import { NextRequest, NextResponse } from 'next/server';
import { clearAdminTokenCookie } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    // Очищаем админ токен из cookies
    await clearAdminTokenCookie();

    return NextResponse.json({
      message: 'Выход выполнен успешно'
    });

  } catch (error) {
    console.error('Ошибка выхода админа:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 