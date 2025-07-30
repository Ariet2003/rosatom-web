"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.css';

interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем аутентификацию
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');

    if (!isAuthenticated || !userData) {
      router.push('/auth/signin');
      return;
    }

    try {
      const user = JSON.parse(userData);
      setUser(user);
    } catch (error) {
      console.error('Ошибка парсинга данных пользователя:', error);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      // Вызываем API для очистки куки на сервере
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Очищаем локальные данные
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      // Перенаправляем на главную
      router.push('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>StartAtom</h1>
          <div className={styles.userInfo}>
            <span>Добро пожаловать, {user.fullName}!</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.welcomeSection}>
          <h2>Добро пожаловать в StartAtom!</h2>
          <p>Ваш аккаунт успешно создан и готов к использованию.</p>
        </div>

        <div className={styles.userCard}>
          <h3>Информация о пользователе</h3>
          <div className={styles.userDetails}>
            <div className={styles.detail}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user.email}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.label}>ФИО:</span>
              <span className={styles.value}>{user.fullName}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.label}>Роль:</span>
              <span className={styles.value}>{user.roleName || 'Не указана'}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.label}>ID пользователя:</span>
              <span className={styles.value}>{user.id}</span>
            </div>
            <div className={styles.detail}>
              <span className={styles.label}>Дата регистрации:</span>
              <span className={styles.value}>
                {new Date(user.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/" className={styles.actionBtn}>
            Вернуться на главную
          </Link>
          <button className={styles.actionBtn}>
            Начать квиз
          </button>
        </div>
      </main>
    </div>
  );
} 