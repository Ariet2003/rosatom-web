"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './results.module.css';

interface Result {
  id: number;
  userId: number;
  testId: number;
  userName: string;
  userEmail: string;
  testTitle: string;
  startedAt: string;
  finishedAt: string | null;
  totalScore: number;
  questionsCount: number;
  isCompleted: boolean;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkAuthAndLoadResults();
  }, [currentPage]);

  useEffect(() => {
    // Debounce поиска
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadResults(1, searchQuery);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  const checkAuthAndLoadResults = async () => {
    try {
      const authResponse = await fetch('/api/auth/check-admin', {
        method: 'GET',
        credentials: 'include'
      });

      if (authResponse.ok) {
        loadResults(currentPage, searchQuery);
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

  const loadResults = async (page: number, search: string = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/results?${params}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setPagination(data.pagination);
      } else {
        console.error('Ошибка загрузки результатов');
      }
    } catch (error) {
      console.error('Ошибка загрузки результатов:', error);
    }
  };

  const viewResult = (resultId: number) => {
    router.push(`/admin/results/${resultId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isCompleted: boolean) => {
    return isCompleted ? (
      <span className={styles.statusCompleted}>Завершен</span>
    ) : (
      <span className={styles.statusInProgress}>В процессе</span>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Загрузка...</p>
      </div>
    );
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
            <h1>Результаты тестов</h1>
          </div>
          <div className={styles.headerUserInfo}>
            <span className={styles.userName}>Администратор</span>
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
                <Link href="/admin/dashboard" className={styles.navLink} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Дашборд
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
                <Link href="/admin/results" className={`${styles.navLink} ${styles.active}`} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                  </svg>
                  Результаты
                </Link>
              </li>
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
            </ul>
          </nav>
        </div>

        <div className={`${styles.content} ${sidebarOpen ? styles.contentShifted : ''}`}>
          <div className={styles.resultsHeader}>
            <h2>Список результатов</h2>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Поиск по имени пользователя или названию теста..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {pagination && (
            <div className={styles.resultsInfo}>
              <p>
                Показано {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} из {pagination.totalCount} результатов
              </p>
            </div>
          )}

          {results.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Результаты не найдены</p>
            </div>
          ) : (
            <div className={styles.resultsGrid}>
              {results.map((result) => (
                <div 
                  key={result.id} 
                  className={styles.resultCard}
                  onClick={() => viewResult(result.id)}
                >
                  <div className={styles.resultHeader}>
                    <h3>{result.testTitle}</h3>
                    {getStatusBadge(result.isCompleted)}
                  </div>
                  
                  <div className={styles.resultInfo}>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{result.userName}</span>
                      <span className={styles.userEmail}>{result.userEmail}</span>
                    </div>
                    
                    <div className={styles.testInfo}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Начало:</span>
                        <span className={styles.infoValue}>{formatDate(result.startedAt)}</span>
                      </div>
                      {result.finishedAt && (
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Завершение:</span>
                          <span className={styles.infoValue}>{formatDate(result.finishedAt)}</span>
                        </div>
                      )}
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Вопросов:</span>
                        <span className={styles.infoValue}>{result.questionsCount}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Баллов:</span>
                        <span className={styles.infoValue}>{result.totalScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.paginationBtn} ${!pagination.hasPrevPage ? styles.disabled : ''}`}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                ← Предыдущая
              </button>
              
              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`${styles.pageBtn} ${pageNum === pagination.currentPage ? styles.active : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                className={`${styles.paginationBtn} ${!pagination.hasNextPage ? styles.disabled : ''}`}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Следующая →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 