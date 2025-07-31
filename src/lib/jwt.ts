import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  roleName: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

// Секретный ключ для JWT
const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'your-secret-key-change-in-production';
};

// Создание JWT токена для админа
export const createAdminToken = (adminData: {
  id: number;
  email: string;
  fullName: string;
  roleName: string;
}): string => {
  const payload = {
    ...adminData,
    isAdmin: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 дней
  };

  return jwt.sign(payload, getJwtSecret(), { algorithm: 'HS256' });
};

// Верификация JWT токена
export const verifyAdminToken = (token: string): AdminUser | null => {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AdminUser;
    return decoded;
  } catch (error) {
    console.error('Ошибка верификации JWT токена:', error);
    return null;
  }
};

// Получение админ токена из cookies
export const getAdminTokenFromCookies = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    return token?.value || null;
  } catch (error) {
    console.error('Ошибка получения токена из cookies:', error);
    return null;
  }
};

// Проверка аутентификации админа на сервере
export const getServerAdminAuth = async (): Promise<{ isAuthenticated: boolean; user: AdminUser | null }> => {
  try {
    const token = await getAdminTokenFromCookies();
    
    if (!token) {
      return { isAuthenticated: false, user: null };
    }

    const decoded = verifyAdminToken(token);
    
    if (!decoded || !decoded.isAdmin) {
      return { isAuthenticated: false, user: null };
    }

    // Проверяем срок действия токена
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return { isAuthenticated: false, user: null };
    }

    return { isAuthenticated: true, user: decoded };
  } catch (error) {
    console.error('Ошибка проверки админ аутентификации:', error);
    return { isAuthenticated: false, user: null };
  }
};

// Установка админ токена в cookies
export const setAdminTokenCookie = async (token: string): Promise<void> => {
  try {
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 дней
    });
  } catch (error) {
    console.error('Ошибка установки админ токена в cookies:', error);
  }
};

// Удаление админ токена из cookies
export const clearAdminTokenCookie = async (): Promise<void> => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
  } catch (error) {
    console.error('Ошибка удаления админ токена из cookies:', error);
  }
}; 