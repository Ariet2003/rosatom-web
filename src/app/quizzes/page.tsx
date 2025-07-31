"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './quizzes.module.css';

interface Test {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  createdBy: {
    fullName: string;
  };
  _count: {
    questions: number;
    testSessions: number;
  };
}

export default function QuizzesPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: number; fullName: string; email: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

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
      return;
    }

    // Загружаем тесты
    fetchTests();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data);
      } else {
        console.error('Ошибка загрузки тестов');
      }
    } catch (error) {
      console.error('Ошибка загрузки тестов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      router.push('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const startTest = (testId: number) => {
    router.push(`/quizzes/${testId}`);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка квизов...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <Image
              src="/logo-ros.png"
              alt="StartAtom Logo"
              width={40}
              height={40}
              priority
              style={{ borderRadius: '8px' }}
            />
            <h1 className={styles.logo}>StartAtom</h1>
          </div>
          
          {/* Бургер-меню для мобильных */}
          <button 
            ref={burgerRef}
            className={styles.burgerMenu}
            onClick={toggleMobileMenu}
            aria-label="Открыть меню"
          >
            <span className={`${styles.burgerLine} ${mobileMenuOpen ? styles.active : ''}`}></span>
            <span className={`${styles.burgerLine} ${mobileMenuOpen ? styles.active : ''}`}></span>
            <span className={`${styles.burgerLine} ${mobileMenuOpen ? styles.active : ''}`}></span>
          </button>

          {/* Десктопная навигация */}
          <nav className={`${styles.navigation} ${styles.desktopNav}`}>
            <Link href="/dashboard" className={styles.navLink}>
              Профиль
            </Link>
            <Link href="/quizzes" className={`${styles.navLink} ${styles.active}`}>
              Квизы
            </Link>
            <Link href="/results" className={styles.navLink}>
              Результаты
            </Link>
          </nav>

          {/* Десктопная секция пользователя */}
          <div className={`${styles.userSection} ${styles.desktopUserSection}`}>
            <span className={styles.userName}>{user?.fullName}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </div>
        </div>

        {/* Мобильная навигация */}
        <nav 
          ref={mobileMenuRef}
          className={`${styles.mobileNavigation} ${mobileMenuOpen ? styles.open : ''}`}
        >
          <div className={styles.mobileNavContent}>
            <Link href="/dashboard" className={styles.mobileNavBtn}>
              <span className={styles.mobileNavIcon}>👤</span>
              Профиль
            </Link>
            <Link href="/quizzes" className={`${styles.mobileNavBtn} ${styles.active}`}>
              <span className={styles.mobileNavIcon}>📝</span>
              Квизы
            </Link>
            <Link href="/results" className={styles.mobileNavBtn}>
              <span className={styles.mobileNavIcon}>📊</span>
              Результаты
            </Link>
            <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
              <span className={styles.mobileNavIcon}>🚪</span>
              Выйти
            </button>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Доступные квизы</h1>
          <p className={styles.pageDescription}>
            Выберите квиз для проверки ваших знаний в области атомной энергетики
          </p>
        </div>

        <div className={styles.testsGrid}>
          {tests.map((test) => (
            <div key={test.id} className={styles.testCard}>
              <div className={styles.testHeader}>
                <h3 className={styles.testTitle}>{test.title}</h3>
                <div className={styles.testStats}>
                  <span className={styles.statItem}>
                    📝 {test._count.questions} вопросов
                  </span>
                  <span className={styles.statItem}>
                    👥 {test._count.testSessions} попыток
                  </span>
                </div>
              </div>
              
              {test.description && (
                <p className={styles.testDescription}>{test.description}</p>
              )}
              
              <div className={styles.testMeta}>
                <span className={styles.testAuthor}>
                  Автор: {test.createdBy.fullName}
                </span>
                <span className={styles.testDate}>
                  {new Date(test.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              
              <button 
                onClick={() => startTest(test.id)}
                className={styles.startTestBtn}
              >
                Начать квиз
              </button>
            </div>
          ))}
        </div>

        {tests.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3 className={styles.emptyTitle}>Квизы пока не созданы</h3>
            <p className={styles.emptyDescription}>
              В данный момент нет доступных квизов. Попробуйте позже.
            </p>
          </div>
        )}
      </main>
    </div>
  );
} 