"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import styles from './admin-dashboard.module.css';

interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  roleName: string;
  isAdmin: boolean;
  createdAt: string;
}

interface DashboardStats {
  users: number;
  tests: number;
  completedTests: number;
  systemStatus: string;
}

interface RecentSession {
  id: number;
  userName: string;
  userEmail: string;
  testTitle: string;
  score: number;
  finishedAt: string;
}

interface MonthlyData {
  month: string;
  count: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentSessions: RecentSession[];
  monthlyChart: MonthlyData[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Проверяем аутентификацию админа и загружаем данные
    const checkAdminAuthAndLoadData = async () => {
      try {
        const authResponse = await fetch('/api/auth/check-admin', {
          method: 'GET',
          credentials: 'include'
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          setUser(authData.user);

          // Загружаем статистику
          const statsResponse = await fetch('/api/admin/stats', {
            method: 'GET',
            credentials: 'include'
          });

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setDashboardData(statsData);
          } else {
            console.error('Ошибка загрузки статистики');
          }
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuthAndLoadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin-logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      router.push('/admin/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Загрузка админ панели...</p>
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
          <div className={styles.headerLeft}>
            <button 
              className={styles.burgerMenu} 
              onClick={toggleSidebar}
              aria-label="Открыть меню"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1>Админ панель StartAtom</h1>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Администратор: {user.fullName}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Overlay для мобильного меню */}
        {sidebarOpen && (
          <div className={styles.sidebarOverlay} onClick={closeSidebar}></div>
        )}
        
        <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3>Управление</h3>
            <button 
              className={styles.closeSidebar} 
              onClick={closeSidebar}
              aria-label="Закрыть меню"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <nav className={styles.nav}>
            <ul>
              <li>
                <Link href="/admin/users" className={styles.navLink} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Пользователи
                </Link>
              </li>
              <li>
                <Link href="/admin/tests" className={styles.navLink} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                  Тесты
                </Link>
              </li>
              <li>
                <Link href="/admin/results" className={styles.navLink} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                  </svg>
                  Результаты
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className={styles.navLink} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Настройки
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={`${styles.content} ${sidebarOpen ? styles.contentShifted : ''}`}>
          <div className={styles.welcomeSection}>
            <h2>Добро пожаловать в админ панель!</h2>
            <p>Выберите раздел для управления системой StartAtom</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Пользователи</h3>
              <p className={styles.statNumber}>{dashboardData?.stats.users || 0}</p>
              <p>Зарегистрированных</p>
            </div>
            <div className={styles.statCard}>
              <h3>Тесты</h3>
              <p className={styles.statNumber}>{dashboardData?.stats.tests || 0}</p>
              <p>Активных тестов</p>
            </div>
            <div className={styles.statCard}>
              <h3>Результаты</h3>
              <p className={styles.statNumber}>{dashboardData?.stats.completedTests || 0}</p>
              <p>Сделанных тестов</p>
            </div>
            <div className={styles.statCard}>
              <h3>Система</h3>
              <p className={styles.statNumber}>{dashboardData?.stats.systemStatus || 'OK'}</p>
              <p>Статус системы</p>
            </div>
          </div>

          {/* Диаграмма активности */}
          {dashboardData && (
            <div className={styles.chartSection}>
              <h3>Активность за последние 6 месяцев</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#b0b8d0"
                      tick={{ fill: '#b0b8d0', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#b0b8d0"
                      tick={{ fill: '#b0b8d0', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(2, 8, 23, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#4e7aff"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Последние результаты */}
          {dashboardData && dashboardData.recentSessions.length > 0 && (
            <div className={styles.recentResults}>
              <h3>Последние результаты тестов</h3>
              <div className={styles.resultsTable}>
                <div className={styles.tableHeader}>
                  <span data-label="Пользователь">Пользователь</span>
                  <span data-label="Тест">Тест</span>
                  <span data-label="Баллы">Баллы</span>
                  <span data-label="Дата">Дата</span>
                </div>
                {dashboardData.recentSessions.map((session) => (
                  <div key={session.id} className={styles.tableRow}>
                    <span data-label="Пользователь">{session.userName}</span>
                    <span data-label="Тест">{session.testTitle}</span>
                    <span data-label="Баллы" className={styles.score}>{session.score}</span>
                    <span data-label="Дата">{new Date(session.finishedAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 