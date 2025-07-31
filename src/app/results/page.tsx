"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './results.module.css';

interface TestSession {
  id: number;
  test: {
    title: string;
  };
  startedAt: string;
  finishedAt: string | null;
  totalScore: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TestSession[]>([]);
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
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/results?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        console.error('Ошибка загрузки результатов');
      }
    } catch (error) {
      console.error('Ошибка загрузки результатов:', error);
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка результатов...</div>
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
          
          <nav className={styles.desktopNav}>
            <Link href="/dashboard" className={styles.navLink}>
              Профиль
            </Link>
            <Link href="/quizzes" className={styles.navLink}>
              Квизы
            </Link>
            <Link href="/results" className={`${styles.navLink} ${styles.active}`}>
              Результаты
            </Link>
          </nav>

          <div className={styles.desktopUserSection}>
            <span className={styles.userName}>{user?.fullName}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </div>

          {/* Бургер меню для мобильных устройств */}
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

          {/* Мобильная навигация */}
          <div
            ref={mobileMenuRef}
            className={`${styles.mobileNavigation} ${mobileMenuOpen ? styles.open : ''}`}
          >
            <div className={styles.mobileNavContent}>
              <div className={styles.mobileNavBtn}>
                <Link href="/dashboard" className={styles.mobileNavIcon}>
                  👤 Профиль
                </Link>
              </div>
              <div className={styles.mobileNavBtn}>
                <Link href="/quizzes" className={styles.mobileNavIcon}>
                  📝 Квизы
                </Link>
              </div>
              <div className={styles.mobileNavBtn}>
                <Link href="/results" className={styles.mobileNavIcon}>
                  📊 Результаты
                </Link>
              </div>
              <div className={styles.mobileLogoutBtn}>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Мои результаты</h1>
          <p className={styles.pageDescription}>
            История прохождения квизов и ваши достижения
          </p>
        </div>

        <div className={styles.resultsGrid}>
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className={styles.resultCard}
              onClick={() => router.push(`/results/${session.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.resultHeader}>
                <h3 className={styles.resultTitle}>{session.test.title}</h3>
                <div className={styles.resultScore}>
                  <span className={styles.scoreValue}>{session.totalScore}</span>
                  <span className={styles.scoreLabel}>баллов</span>
                </div>
              </div>
              
              <div className={styles.resultMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Начало:</span>
                  <span className={styles.metaValue}>
                    {new Date(session.startedAt).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                {session.finishedAt && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Завершение:</span>
                    <span className={styles.metaValue}>
                      {new Date(session.finishedAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Статус:</span>
                  <span className={`${styles.statusBadge} ${session.finishedAt ? styles.completed : styles.inProgress}`}>
                    {session.finishedAt ? 'Завершен' : 'В процессе'}
                  </span>
                </div>
              </div>
              
              <div className={styles.viewDetails}>
                <span className={styles.viewDetailsText}>Нажмите для просмотра деталей</span>
              </div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <h3 className={styles.emptyTitle}>Результатов пока нет</h3>
            <p className={styles.emptyDescription}>
              Пройдите свой первый квиз, чтобы увидеть результаты здесь.
            </p>
            <button 
              onClick={() => router.push('/quizzes')}
              className={styles.startQuizBtn}
            >
              Начать квиз
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 