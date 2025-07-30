"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './quiz.module.css';

interface Question {
  id: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN';
  options: {
    id: number;
    text: string;
  }[];
}

interface Test {
  id: number;
  title: string;
  description: string | null;
  questions: Question[];
}

interface User {
  id: number;
  fullName: string;
  email: string;
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [test, setTest] = useState<Test | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [textAnswers, setTextAnswers] = useState<{ [key: number]: string }>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<{
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
  } | null>(null);
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

    // Загружаем тест
    fetchTest();
  }, [router, testId]);

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

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}`);
      if (response.ok) {
        const data = await response.json();
        setTest(data);
      } else {
        console.error('Ошибка загрузки теста');
        router.push('/quizzes');
      }
    } catch (error) {
      console.error('Ошибка загрузки теста:', error);
      router.push('/quizzes');
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const selectAnswer = (questionId: number, optionId: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleTextAnswer = (questionId: number, text: string) => {
    setTextAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    if (!test) return;

    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId: test.id,
          userId: user?.id,
          answers: selectedAnswers,
          textAnswers: textAnswers
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setResults(result);
        setQuizCompleted(true);
      } else {
        console.error('Ошибка отправки результатов');
      }
    } catch (error) {
      console.error('Ошибка отправки результатов:', error);
    }
  };

  const goToResults = () => {
    router.push('/results');
  };

  const goToQuizzes = () => {
    router.push('/quizzes');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка квиза...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Квиз не найден</div>
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
            <Link href="/quizzes" className={styles.navLink}>
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
            <Link href="/quizzes" className={styles.mobileNavBtn}>
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
        {!quizStarted ? (
          <div className={styles.quizIntro}>
            <div className={styles.quizHeader}>
              <h1 className={styles.quizTitle}>{test.title}</h1>
              {test.description && (
                <p className={styles.quizDescription}>{test.description}</p>
              )}
              <div className={styles.quizStats}>
                <span className={styles.statItem}>
                  📝 {test.questions.length} вопросов
                </span>
                <span className={styles.statItem}>
                  ⏱️ Примерное время: {Math.ceil(test.questions.length * 1.5)} мин
                </span>
              </div>
            </div>
            
                         <div className={styles.quizInstructions}>
               <h3>Инструкции:</h3>
               <ul>
                 <li>Внимательно прочитайте каждый вопрос</li>
                 <li>Для вопросов с вариантами выберите один правильный ответ</li>
                 <li>Для открытых вопросов введите свой ответ в текстовом поле</li>
                 <li>Можно вернуться к предыдущим вопросам</li>
                 <li>После завершения результаты будут сохранены</li>
               </ul>
             </div>
            
            <div className={styles.quizActions}>
              <button onClick={startQuiz} className={styles.startQuizBtn}>
                Начать квиз
              </button>
              <button onClick={goToQuizzes} className={styles.backBtn}>
                Вернуться к квизам
              </button>
            </div>
          </div>
        ) : quizCompleted ? (
          <div className={styles.quizResults}>
            <div className={styles.resultsHeader}>
              <h1>Результаты квиза</h1>
              <h2>{test.title}</h2>
            </div>
            
            <div className={styles.resultsContent}>
              <div className={styles.resultCard}>
                <div className={styles.resultScore}>
                  <span className={styles.scoreNumber}>{results?.correctAnswers}</span>
                  <span className={styles.scoreTotal}>из {results?.totalQuestions}</span>
                </div>
                <div className={styles.resultPercentage}>
                  {results?.percentage}%
                </div>
                <div className={styles.resultMessage}>
                  {results && results.percentage >= 80 ? 'Отлично!' : 
                   results && results.percentage >= 60 ? 'Хорошо!' : 
                   results && results.percentage >= 40 ? 'Удовлетворительно' : 'Попробуйте еще раз'}
                </div>
              </div>
            </div>
            
            <div className={styles.resultsActions}>
              <button onClick={goToResults} className={styles.viewResultsBtn}>
                Посмотреть все результаты
              </button>
              <button onClick={goToQuizzes} className={styles.backBtn}>
                К другим квизам
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.quizContent}>
            <div className={styles.quizProgress}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
                ></div>
              </div>
              <div className={styles.progressText}>
                Вопрос {currentQuestionIndex + 1} из {test.questions.length}
              </div>
            </div>

                         <div className={styles.questionContainer}>
               <h2 className={styles.questionText}>
                 {test.questions[currentQuestionIndex].text}
               </h2>
               
               {test.questions[currentQuestionIndex].type === 'MULTIPLE_CHOICE' ? (
                 <div className={styles.optionsContainer}>
                   {test.questions[currentQuestionIndex].options.map((option) => (
                     <button
                       key={option.id}
                       className={`${styles.optionBtn} ${
                         selectedAnswers[test.questions[currentQuestionIndex].id] === option.id 
                           ? styles.selected 
                           : ''
                       }`}
                       onClick={() => selectAnswer(test.questions[currentQuestionIndex].id, option.id)}
                     >
                       <span className={styles.optionText}>{option.text}</span>
                     </button>
                   ))}
                 </div>
               ) : (
                 <div className={styles.textAnswerContainer}>
                   <textarea
                     className={styles.textAnswerInput}
                     placeholder="Введите ваш ответ..."
                     value={textAnswers[test.questions[currentQuestionIndex].id] || ''}
                     onChange={(e) => handleTextAnswer(test.questions[currentQuestionIndex].id, e.target.value)}
                     rows={4}
                   />
                 </div>
               )}
             </div>

            <div className={styles.quizNavigation}>
              <button 
                onClick={prevQuestion}
                className={styles.navBtn}
                disabled={currentQuestionIndex === 0}
              >
                ← Назад
              </button>
              
              {currentQuestionIndex === test.questions.length - 1 ? (
                                 <button 
                   onClick={submitQuiz}
                   className={styles.submitBtn}
                   disabled={
                     !test.questions.every(question => {
                       if (question.type === 'MULTIPLE_CHOICE') {
                         return selectedAnswers[question.id] !== undefined;
                       } else {
                         return textAnswers[question.id] && textAnswers[question.id].trim() !== '';
                       }
                     })
                   }
                 >
                  Завершить квиз
                </button>
              ) : (
                <button 
                  onClick={nextQuestion}
                  className={styles.navBtn}
                >
                  Далее →
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 