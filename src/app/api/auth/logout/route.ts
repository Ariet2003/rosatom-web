import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Очищаем куки аутентификации
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

    return NextResponse.json(
      { message: 'Выход выполнен успешно' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка выхода:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при выходе' },
      { status: 500 }
    );
  }
} 