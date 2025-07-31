import { cookies } from 'next/headers';

export interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName?: string;
  createdAt: string;
}

// Функция для установки куки аутентификации
export async function setAuthCookies(user: User) {
  // Устанавливаем куки на стороне сервера
  const cookieStore = await cookies();
  cookieStore.set('auth_token', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 дней
  });

  // Также сохраняем в localStorage для клиентской стороны
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
  }
}

// Функция для получения данных аутентификации
export function getAuthCookies(): { isAuthenticated: boolean; user: User | null } {
  // Проверяем localStorage на клиентской стороне
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (isAuthenticated === 'true' && userData) {
      try {
        const user = JSON.parse(userData);
        return { isAuthenticated: true, user };
      } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
      }
    }
  }

  return { isAuthenticated: false, user: null };
}

// Функция для очистки данных аутентификации
export async function clearAuthCookies() {
  // Очищаем localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }

  // Очищаем куки на стороне сервера
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

// Функция для проверки аутентификации на сервере
export async function getServerAuth(): Promise<{ isAuthenticated: boolean; user: User | null }> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token');
    
    if (authToken) {
      const user = JSON.parse(authToken.value);
      return { isAuthenticated: true, user };
    }
  } catch (error) {
    console.error('Ошибка получения серверной аутентификации:', error);
  }

  return { isAuthenticated: false, user: null };
} 