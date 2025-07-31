"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../results.module.css';

interface DetailedAnswer {
  id: number;
  questionId: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'OPEN';
  questionScore: number;
  selectedOption: {
    id: number;
    text: string;
    isCorrect: boolean;
  } | null;
  openAnswer: string | null;
  aiScore: number | null;
  aiFeedback: {
    feedback: string;
    score: number;
    evaluatedAt: string;
  } | null;
  correctOptions: {
    id: number;
    text: string;
  }[] | null;
  isCorrect: boolean;
}

interface DetailedResult {
  id: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    registeredAt: string;
  };
  test: {
    id: number;
    title: string;
    description: string | null;
    createdAt: string;
  };
  session: {
    startedAt: string;
    finishedAt: string | null;
    totalScore: number;
    duration: number | null;
  };
  statistics: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    openQuestions: number;
    multipleChoiceQuestions: number;
  };
  answers: DetailedAnswer[];
}

export default function ResultDetailPage() {
  const router = useRouter();
  const params = useParams();
  const resultId = params.id as string;
  
  const [result, setResult] = useState<DetailedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuthAndLoadResult();
  }, [resultId]);

  const checkAuthAndLoadResult = async () => {
    try {
      const authResponse = await fetch('/api/auth/check-admin', {
        method: 'GET',
        credentials: 'include'
      });

      if (authResponse.ok) {
        loadResult();
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

  const loadResult = async () => {
    try {
      const response = await fetch(`/api/admin/results/${resultId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
      } else {
        alert('Результат не найден');
        router.push('/admin/results');
      }
    } catch (error) {
      console.error('Ошибка загрузки результата:', error);
      alert('Ошибка загрузки результата');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return styles.highAccuracy;
    if (accuracy >= 60) return styles.mediumAccuracy;
    return styles.lowAccuracy;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={styles.loadingContainer}>
        <p>Результат не найден</p>
        <Link href="/admin/results" className={styles.backBtn}>
          Вернуться к списку результатов
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
            <h1>Детальный результат</h1>
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
                <Link href="/admin/results" className={`${styles.navLink} ${styles.active}`} onClick={closeSidebar}>
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
          <div className={styles.resultDetailHeader}>
            <Link href="/admin/results" className={styles.backBtn}>
              ← Назад к списку результатов
            </Link>
          </div>

          <div className={styles.resultDetailContainer}>
            {/* Основная информация */}
            <div className={styles.resultOverview}>
              <div className={styles.resultOverviewHeader}>
                <h2>{result.test.title}</h2>
                <div className={styles.resultStatus}>
                  {result.session.finishedAt ? (
                    <span className={styles.statusCompleted}>Завершен</span>
                  ) : (
                    <span className={styles.statusInProgress}>В процессе</span>
                  )}
                </div>
              </div>

              <div className={styles.resultOverviewGrid}>
                <div className={styles.overviewCard}>
                  <h3>Информация о пользователе</h3>
                  <div className={styles.overviewContent}>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewLabel}>Имя:</span>
                      <span className={styles.overviewValue}>{result.user.fullName}</span>
                    </div>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewLabel}>Email:</span>
                      <span className={styles.overviewValue}>{result.user.email}</span>
                    </div>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewLabel}>Зарегистрирован:</span>
                      <span className={styles.overviewValue}>{formatDate(result.user.registeredAt)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.overviewCard}>
                  <h3>Сессия тестирования</h3>
                  <div className={styles.overviewContent}>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewLabel}>Начало:</span>
                      <span className={styles.overviewValue}>{formatDate(result.session.startedAt)}</span>
                    </div>
                    {result.session.finishedAt && (
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Завершение:</span>
                        <span className={styles.overviewValue}>{formatDate(result.session.finishedAt)}</span>
                      </div>
                    )}
                    {result.session.duration && (
                      <div className={styles.overviewRow}>
                        <span className={styles.overviewLabel}>Длительность:</span>
                        <span className={styles.overviewValue}>{result.session.duration} мин.</span>
                      </div>
                    )}
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewLabel}>Общий балл:</span>
                      <span className={styles.overviewValue}>{result.session.totalScore}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.overviewCard}>
                  <h3>Статистика</h3>
                  <div className={styles.overviewContent}>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewLabel}>Всего вопросов:</span>
                      <span className={styles.overviewValue}>{result.statistics.totalQuestions}</span>
                    </div>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewLabel}>Правильных ответов:</span>
                      <span className={styles.overviewValue}>{result.statistics.correctAnswers}</span>
                    </div>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewLabel}>Неправильных ответов:</span>
                      <span className={styles.overviewValue}>{result.statistics.incorrectAnswers}</span>
                    </div>
                    <div className={styles.overviewRow}>
                      <span className={styles.overviewLabel}>Точность:</span>
                      <span className={`${styles.overviewValue} ${getAccuracyColor(result.statistics.accuracy)}`}>
                        {result.statistics.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Детальные ответы */}
            <div className={styles.answersSection}>
              <h3>Детальные ответы ({result.answers.length})</h3>
              
              <div className={styles.answersList}>
                {result.answers.map((answer, index) => (
                  <div key={answer.id} className={styles.answerCard}>
                    <div className={styles.answerHeader}>
                      <h4>Вопрос {index + 1}</h4>
                      <div className={styles.answerMeta}>
                        <span className={styles.questionType}>
                          {answer.questionType === 'MULTIPLE_CHOICE' ? 'С вариантами ответов' : 'Открытый вопрос'}
                        </span>
                        <span className={styles.questionScore}>
                          {answer.questionScore} {answer.questionScore === 1 ? 'балл' : answer.questionScore < 5 ? 'балла' : 'баллов'}
                        </span>
                        <span className={`${styles.answerStatus} ${answer.isCorrect ? styles.correct : styles.incorrect}`}>
                          {answer.isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.questionText}>
                      {answer.questionText}
                    </div>

                    {answer.questionType === 'MULTIPLE_CHOICE' ? (
                      <div className={styles.multipleChoiceAnswer}>
                        <div className={styles.selectedAnswer}>
                          <h5>Выбранный ответ:</h5>
                          <div className={`${styles.answerOption} ${answer.selectedOption?.isCorrect ? styles.correct : styles.incorrect}`}>
                            {answer.selectedOption?.text || 'Ответ не выбран'}
                          </div>
                        </div>
                        
                        {answer.correctOptions && answer.correctOptions.length > 0 && (
                          <div className={styles.correctAnswers}>
                            <h5>Правильные ответы:</h5>
                            {answer.correctOptions.map((option, optionIndex) => (
                              <div key={option.id} className={`${styles.answerOption} ${styles.correct}`}>
                                {option.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.openAnswer}>
                        <div className={styles.userAnswer}>
                          <h5>Ответ пользователя:</h5>
                          <div className={styles.answerText}>
                            {answer.openAnswer || 'Ответ не предоставлен'}
                          </div>
                        </div>
                        
                        {answer.aiFeedback && (
                          <div className={styles.aiFeedback}>
                            <h5>Оценка ИИ:</h5>
                            <div className={styles.feedbackContent}>
                              <div className={styles.feedbackScore}>
                                Балл: {answer.aiFeedback.score}
                              </div>
                              <div className={styles.feedbackText}>
                                {answer.aiFeedback.feedback}
                              </div>
                              <div className={styles.feedbackDate}>
                                Оценено: {formatDate(answer.aiFeedback.evaluatedAt)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 