"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin-credentials.module.css';

interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  createdAt: string;
}

interface AdminCredentials {
  login: string;
  password: string;
}

export default function AdminCredentialsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [currentCredentials, setCurrentCredentials] = useState<AdminCredentials | null>(null);

  useEffect(() => {
    // Проверяем аутентификацию и права администратора
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const isAdmin = localStorage.getItem('isAdmin');
    const userData = localStorage.getItem('user');

    if (!isAuthenticated || !isAdmin || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const userObj: User = JSON.parse(userData);
      setUser(userObj);
      loadCurrentCredentials();
    } catch (error) {
      console.error('Ошибка парсинга данных пользователя:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadCurrentCredentials = useCallback(async () => {
    try {
      const response = await fetch('/api/settings?key=admin_login');
      if (response.ok) {
        const setting = await response.json();
        const credentials = JSON.parse(setting.value);
        setCurrentCredentials(credentials);
        setNewLogin(credentials.login);
      }
    } catch (error) {
      console.error('Ошибка загрузки учетных данных:', error);
      showMessage('Ошибка загрузки текущих учетных данных', 'error');
    }
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showMessage('Введите текущий пароль', 'error');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showMessage('Новые пароли не совпадают', 'error');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showMessage('Новый пароль должен содержать минимум 6 символов', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newLogin: newLogin || undefined,
          newPassword: newPassword || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Учетные данные успешно обновлены', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        loadCurrentCredentials(); // Обновляем отображение
      } else {
        showMessage(data.error || 'Ошибка при обновлении учетных данных', 'error');
      }
    } catch (error) {
      showMessage('Ошибка сети', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Загрузка...</p>
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
          <h1>Изменение учетных данных администратора</h1>
          <div className={styles.userInfo}>
            <span>Администратор: {user.fullName}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <nav className={styles.nav}>
            <h3>Управление</h3>
            <ul>
              <li>
                <Link href="/admin/dashboard" className={styles.navLink}>
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className={styles.navLink}>
                  Пользователи
                </Link>
              </li>
              <li>
                <Link href="/admin/tests" className={styles.navLink}>
                  Тесты
                </Link>
              </li>
              <li>
                <Link href="/admin/results" className={styles.navLink}>
                  Результаты
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h2>Изменение логина и пароля</h2>
            <p className={styles.description}>
              Для изменения учетных данных необходимо ввести текущий пароль.
              Оставьте поля пустыми, если не хотите изменять соответствующие данные.
            </p>

            {message && (
              <div className={`${styles.message} ${styles[messageType]}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="currentPassword">Текущий пароль *</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newLogin">Новый логин (email)</label>
                <input
                  id="newLogin"
                  type="email"
                  value={newLogin}
                  onChange={(e) => setNewLogin(e.target.value)}
                  placeholder="Введите новый email"
                />
                {currentCredentials && (
                  <small className={styles.helpText}>
                    Текущий логин: {currentCredentials.login}
                  </small>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword">Новый пароль</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Введите новый пароль (минимум 6 символов)"
                  minLength={6}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                />
              </div>

              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={saving}
                >
                  {saving ? 'Обновление...' : 'Обновить учетные данные'}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    loadCurrentCredentials();
                  }}
                  disabled={saving}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 