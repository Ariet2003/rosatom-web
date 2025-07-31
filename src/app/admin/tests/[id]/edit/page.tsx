"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../tests.module.css';

interface Question {
  id?: number;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN';
  score: number;
  options: Option[];
}

interface Option {
  id?: number;
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

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Форма редактирования теста
  const [testForm, setTestForm] = useState({
    title: '',
    description: ''
  });
  
  // Вопросы для редактирования
  const [questions, setQuestions] = useState<Question[]>([]);

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
        const testData = data.test;
        setTest(testData);
        setTestForm({
          title: testData.title,
          description: testData.description || ''
        });
        setQuestions(testData.questions.map((q: Question) => ({
          ...q,
          options: q.options || []
        })));
      } else {
        alert('Тест не найден');
        router.push('/admin/tests');
      }
    } catch (error) {
      console.error('Ошибка загрузки теста:', error);
      alert('Ошибка загрузки теста');
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      text: '',
      type: 'MULTIPLE_CHOICE',
      score: 1,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof Option, value: string | boolean) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmitTest = async () => {
    if (!testForm.title.trim()) {
      showNotification('error', 'Введите название теста');
      return;
    }

    if (questions.length === 0) {
      showNotification('error', 'Добавьте хотя бы один вопрос');
      return;
    }

    // Валидация вопросов
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.text.trim()) {
        showNotification('error', `Вопрос ${i + 1}: введите текст вопроса`);
        return;
      }

      if (question.type === 'MULTIPLE_CHOICE') {
        const hasCorrectOption = question.options.some(opt => opt.isCorrect);
        if (!hasCorrectOption) {
          showNotification('error', `Вопрос ${i + 1}: выберите правильный ответ`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          test: testForm,
          questions: questions
        })
      });

      if (response.ok) {
        showNotification('success', 'Тест успешно обновлен!');
        setTimeout(() => {
          router.push('/admin/tests');
        }, 1500);
      } else {
        const error = await response.json();
        showNotification('error', `Ошибка: ${error.message}`);
      }
    } catch (error) {
      console.error('Ошибка обновления теста:', error);
      showNotification('error', 'Ошибка обновления теста');
    } finally {
      setSaving(false);
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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
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
            <h1>Редактирование теста</h1>
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
          <div className={styles.formHeader}>
            <Link href="/admin/tests" className={styles.backBtn}>
              ← Назад к списку тестов
            </Link>
            <button 
              onClick={handleSubmitTest} 
              className={styles.submitBtn}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>

          <div className={styles.createForm}>
            <div className={styles.testForm}>
              <div className={styles.formGroup}>
                <label>Название теста *</label>
                <input
                  type="text"
                  value={testForm.title}
                  onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                  placeholder="Введите название теста"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Описание</label>
                <textarea
                  value={testForm.description}
                  onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                  placeholder="Введите описание теста"
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.questionsSection}>
              <div className={styles.questionsHeader}>
                <h3>Вопросы ({questions.length})</h3>
              </div>

              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className={styles.questionCard}>
                  <div className={styles.questionHeader}>
                    <h4>Вопрос {questionIndex + 1}</h4>
                    <button 
                      onClick={() => removeQuestion(questionIndex)}
                      className={styles.removeQuestionBtn}
                    >
                      Удалить
                    </button>
                  </div>

                  <div className={styles.questionForm}>
                    <div className={styles.formGroup}>
                      <label>Текст вопроса *</label>
                      <textarea
                        value={question.text}
                        onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                        placeholder="Введите текст вопроса"
                        className={styles.textarea}
                        rows={2}
                      />
                    </div>

                    <div className={styles.questionSettings}>
                      <div className={styles.formGroup}>
                        <label>Тип вопроса</label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                          className={styles.select}
                        >
                          <option value="MULTIPLE_CHOICE">С вариантами ответов</option>
                          <option value="OPEN">Открытый вопрос</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Баллы</label>
                        <input
                          type="number"
                          value={question.score}
                          onChange={(e) => updateQuestion(questionIndex, 'score', parseInt(e.target.value) || 1)}
                          min="1"
                          className={styles.input}
                        />
                      </div>
                    </div>

                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className={styles.optionsSection}>
                        <label>Варианты ответов</label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className={styles.optionRow}>
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={option.isCorrect}
                              onChange={() => {
                                // Сбрасываем все варианты
                                question.options.forEach((_, i) => {
                                  updateOption(questionIndex, i, 'isCorrect', false);
                                });
                                // Устанавливаем текущий как правильный
                                updateOption(questionIndex, optionIndex, 'isCorrect', true);
                              }}
                              className={styles.radio}
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                              placeholder={`Вариант ${optionIndex + 1}`}
                              className={styles.optionInput}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className={styles.addQuestionSection}>
                <button onClick={addQuestion} className={styles.addQuestionBtn}>
                  + Добавить вопрос
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Уведомления */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <div className={styles.notificationContent}>
            <span className={styles.notificationIcon}>
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span className={styles.notificationMessage}>
              {notification.message}
            </span>
          </div>
          <button 
            className={styles.notificationClose}
            onClick={() => setNotification(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
} 