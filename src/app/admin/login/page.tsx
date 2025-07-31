"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './admin-login.module.css';

interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  roleName: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'verification'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    verificationCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true); // Новое состояние для проверки аутентификации
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Проверяем аутентификацию при загрузке страницы
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check-admin', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          // Если уже авторизован как админ, перенаправляем в дашборд
          router.push('/admin/dashboard');
        }
      } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        // В случае ошибки продолжаем показывать страницу входа
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Код подтверждения отправлен на ваш email. Проверьте почту и введите код.');
        setStep('verification');
      } else {
        setError(data.message || 'Ошибка входа');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: formData.verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData: AdminUser = data.user;

        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('isAdmin', 'true');
        
        // Перенаправляем на админ панель
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Ошибка проверки кода');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Новый код подтверждения отправлен на ваш email.');
      } else {
        setError(data.message || 'Ошибка отправки кода');
      }
    } catch {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const goBackToLogin = () => {
    setStep('login');
    setError('');
    setSuccessMessage('');
    setFormData({
      ...formData,
      verificationCode: ''
    });
  };

  // Показываем индикатор загрузки во время проверки аутентификации
  if (authChecking) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1>Админ панель</h1>
            <p>Проверка аутентификации...</p>
          </div>
          <div className={styles.loadingContainer}>
            <div className={styles.loader}></div>
            <p>Проверяем ваш статус...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1>Админ панель</h1>
          <p>{step === 'login' ? 'Вход в систему управления StartAtom' : 'Подтверждение входа'}</p>
        </div>

        {step === 'login' ? (
          <form onSubmit={handleLoginSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email администратора</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Введите email администратора"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Введите пароль"
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Отправка кода...' : 'Отправить код подтверждения'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="verificationCode">Код подтверждения</label>
              <input
                type="text"
                id="verificationCode"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                required
                placeholder="Введите 6-значный код"
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>

            {successMessage && <div className={styles.success}>{successMessage}</div>}
            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Проверка...' : 'Подтвердить код'}
            </button>

            <div className={styles.verificationActions}>
              <button 
                type="button" 
                onClick={handleResendCode} 
                className={styles.resendBtn}
                disabled={loading}
              >
                Отправить код повторно
              </button>
              <button 
                type="button" 
                onClick={goBackToLogin} 
                className={styles.backBtn}
                disabled={loading}
              >
                Назад к входу
              </button>
            </div>
          </form>
        )}

        <div className={styles.footer}>
          <p>
            <Link href="/auth/signin">Вернуться к обычному входу</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 