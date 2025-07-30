"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './result-detail.module.css';

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN';
  score: number;
  options: Option[];
}

interface Answer {
  id: number;
  questionId: number;
  selectedOptionId: number | null;
  openAnswer: string | null;
  aiScore: number | null;
  question: Question;
  selectedOption: Option | null;
  aiFeedback: {
    id: number;
    feedback: string;
    score: number;
  } | null;
}

interface TestSession {
  id: number;
  test: {
    title: string;
    description: string | null;
    questions: Question[];
  };
  startedAt: string;
  finishedAt: string | null;
  totalScore: number;
  answers: Answer[];
}

export default function ResultDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
    if (user && sessionId) {
      fetchSessionDetails();
    }
  }, [user, sessionId]);

  const fetchSessionDetails = async () => {
    try {
      const response = await fetch(`/api/results/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      } else {
        console.error('Ошибка загрузки деталей сессии');
        router.push('/results');
      }
    } catch (error) {
      console.error('Ошибка загрузки деталей сессии:', error);
      router.push('/results');
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

  const getCorrectOption = (question: Question) => {
    return question.options.find(option => option.isCorrect);
  };

  const isAnswerCorrect = (answer: Answer) => {
    if (answer.question.type === 'MULTIPLE_CHOICE') {
      return answer.selectedOption?.isCorrect || false;
    } else {
      return answer.aiScore !== null && answer.aiScore > 0;
    }
  };

  const getAnswerStatus = (answer: Answer) => {
    if (answer.question.type === 'MULTIPLE_CHOICE') {
      return answer.selectedOption?.isCorrect ? 'correct' : 'incorrect';
    } else {
      if (answer.aiScore === null || answer.aiScore === 0) {
        return 'no-answer';
      }
      return answer.aiScore >= answer.question.score * 0.7 ? 'good' : 'needs-improvement';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка деталей результата...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Сессия не найдена</div>
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
          
          <nav className={styles.navigation}>
            <Link href="/dashboard" className={styles.navLink}>
              Профиль
            </Link>
            <Link href="/quizzes" className={styles.navLink}>
              Квизы
            </Link>
            <Link href="/results" className={styles.navLink}>
              Результаты
            </Link>
          </nav>

          <div className={styles.userSection}>
            <span className={styles.userName}>{user?.fullName}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div className={styles.backButton}>
            <button onClick={() => router.push('/results')} className={styles.backBtn}>
              ← Назад к результатам
            </button>
          </div>
          
          <div className={styles.testInfo}>
            <h1 className={styles.testTitle}>{session.test.title}</h1>
            {session.test.description && (
              <p className={styles.testDescription}>{session.test.description}</p>
            )}
            
            <div className={styles.testStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Общий балл:</span>
                <span className={styles.statValue}>{session.totalScore}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Вопросов:</span>
                <span className={styles.statValue}>{session.test.questions.length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Дата:</span>
                <span className={styles.statValue}>
                  {new Date(session.startedAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.questionsList}>
          {session.test.questions.map((question, index) => {
            const answer = session.answers.find(a => a.questionId === question.id);
            const status = answer ? getAnswerStatus(answer) : 'no-answer';
            
            return (
              <div key={question.id} className={`${styles.questionCard} ${styles[status]}`}>
                <div className={styles.questionHeader}>
                  <h3 className={styles.questionNumber}>Вопрос {index + 1}</h3>
                  <div className={styles.questionScore}>
                    <span className={styles.scoreValue}>
                      {answer?.aiScore || 0}
                    </span>
                    <span className={styles.scoreMax}>/ {question.score}</span>
                  </div>
                </div>
                
                <div className={styles.questionContent}>
                  <p className={styles.questionText}>{question.text}</p>
                  
                  {question.type === 'MULTIPLE_CHOICE' ? (
                    <div className={styles.optionsList}>
                      {question.options.map((option) => (
                        <div 
                          key={option.id} 
                          className={`${styles.optionItem} ${
                            answer?.selectedOptionId === option.id ? styles.selected : ''
                          } ${option.isCorrect ? styles.correct : ''} ${
                            answer?.selectedOptionId === option.id && !option.isCorrect ? styles.incorrect : ''
                          }`}
                        >
                          <span className={styles.optionText}>{option.text}</span>
                          {option.isCorrect && (
                            <span className={styles.correctBadge}>✓ Правильный</span>
                          )}
                          {answer?.selectedOptionId === option.id && !option.isCorrect && (
                            <span className={styles.incorrectBadge}>✗ Ваш ответ</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.openAnswerSection}>
                      <div className={styles.userAnswer}>
                        <h4 className={styles.answerLabel}>Ваш ответ:</h4>
                        <p className={styles.answerText}>
                          {answer?.openAnswer || 'Ответ не предоставлен'}
                        </p>
                      </div>
                      
                      {answer?.aiFeedback && (
                        <div className={styles.aiFeedback}>
                          <h4 className={styles.feedbackLabel}>Оценка ИИ:</h4>
                          <div className={styles.feedbackContent}>
                            <p className={styles.feedbackText}>{answer.aiFeedback.feedback}</p>
                            <div className={styles.feedbackScore}>
                              <span className={styles.feedbackScoreValue}>
                                {answer.aiFeedback.score}
                              </span>
                              <span className={styles.feedbackScoreMax}>/ {question.score}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
} 