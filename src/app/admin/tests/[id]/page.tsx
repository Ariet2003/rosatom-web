"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../tests.module.css';

interface Question {
  id: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN';
  score: number;
  options?: Option[];
}

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Test {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  questions: Question[];
}

export default function TestViewPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuthAndLoadTest();
  }, [testId]);

  const checkAuthAndLoadTest = async () => {
    try {
      const authResponse = await fetch('/api/auth/check-admin', {
        method: 'GET',
        credentials: 'include'
      });

      if (authResponse.ok) {
        loadTest();
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

  const loadTest = async () => {
    try {
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setTest(data.test);
      } else {
        alert('Тест не найден');
        router.push('/admin/tests');
      }
    } catch (error) {
      console.error('Ошибка загрузки теста:', error);
      alert('Ошибка загрузки теста');
    }
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className={styles.loadingContainer}>
        <p>Тест не найден</p>
        <Link href="/admin/tests" className={styles.backBtn}>
          Вернуться к списку тестов
        </Link>
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
            <h1>Просмотр теста</h1>
          </div>
          <div className={styles.userInfo}>
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
                <Link href="/admin/results" className={styles.navLink} onClick={closeSidebar}>
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
          <div className={styles.testViewHeader}>
            <Link href="/admin/tests" className={styles.backBtn}>
              ← Назад к списку тестов
            </Link>
          </div>

          <div className={styles.testView}>
            <div className={styles.testInfo}>
              <h2>{test.title}</h2>
              {test.description && <p className={styles.testDescription}>{test.description}</p>}
              <div className={styles.testMeta}>
                <span>Вопросов: {test.questions.length}</span>
                <span>Создан: {new Date(test.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>

            <div className={styles.questionsList}>
              <h3>Вопросы теста</h3>
              {test.questions.map((question, index) => (
                <div key={question.id} className={styles.questionViewCard}>
                  <div className={styles.questionHeader}>
                    <h4>Вопрос {index + 1}</h4>
                    <span className={styles.questionType}>
                      {question.type === 'MULTIPLE_CHOICE' ? 'С вариантами ответов' : 'Открытый вопрос'}
                    </span>
                    <span className={styles.questionScore}>
                      {question.score} {question.score === 1 ? 'балл' : question.score < 5 ? 'балла' : 'баллов'}
                    </span>
                  </div>
                  
                  <div className={styles.questionText}>
                    {question.text}
                  </div>

                  {question.type === 'MULTIPLE_CHOICE' && question.options && (
                    <div className={styles.optionsList}>
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={option.id} 
                          className={`${styles.optionItem} ${option.isCorrect ? styles.correctOption : ''}`}
                        >
                          <span className={styles.optionNumber}>{optionIndex + 1}.</span>
                          <span className={styles.optionText}>{option.text}</span>
                          {option.isCorrect && (
                            <span className={styles.correctBadge}>✓ Правильный ответ</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 