"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import Image from 'next/image';
import styles from './dashboard.module.css';

interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName?: string;
  profileImageUrl?: string;
  createdAt: string;
}

interface Role {
  id: number;
  name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    show: boolean;
  }>({ type: 'success', message: '', show: false });
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Состояние формы редактирования
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    roleId: 0,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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
      // Инициализируем форму данными пользователя
      setEditForm({
        fullName: user.fullName,
        email: user.email,
        roleId: user.roleId,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Ошибка парсинга данных пользователя:', error);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Загружаем роли
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/roles');
        if (response.ok) {
          const data = await response.json();
          setRoles(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки ролей:', error);
      }
    };
    fetchRoles();
  }, []);

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



  // Функция для показа уведомлений
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification({ type: 'success', message: '', show: false });
    }, 5000);
  };

  const handleLogout = async () => {
    try {
      // Вызываем API для очистки куки на сервере
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Очищаем локальные данные
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      // Перенаправляем на главную
      router.push('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleSectionChange = (section: string) => {
    if (section === 'quizzes') {
      router.push('/quizzes');
      return;
    }
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openEditModal = () => {
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    // Сбрасываем ошибки
    setUploadError('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', user.id.toString());

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Обновляем данные пользователя в localStorage и состоянии
        const updatedUser = { ...user, profileImageUrl: data.imageUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showNotification('success', 'Фото профиля успешно обновлено');
      } else {
        setUploadError(data.error || 'Ошибка загрузки изображения');
        showNotification('error', data.error || 'Ошибка загрузки изображения');
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      setUploadError('Ошибка загрузки изображения');
      showNotification('error', 'Ошибка загрузки изображения');
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFormChange = (field: string, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация паролей
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      showNotification('error', 'Новые пароли не совпадают');
      return;
    }

    if (editForm.newPassword && !editForm.currentPassword) {
      showNotification('error', 'Для изменения пароля необходимо ввести текущий пароль');
      return;
    }

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...editForm
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Обновляем данные пользователя
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        closeEditModal();
        showNotification('success', 'Профиль успешно обновлен');
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Ошибка обновления профиля');
      }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      showNotification('error', 'Ошибка обновления профиля');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.profileContainer}>
              <div className={styles.profileHeader}>
                <div className={styles.profileImageSection}>
                  <div className={styles.profileImageContainer}>
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Фото профиля" 
                        className={styles.profileImage}
                      />
                    ) : (
                      <div className={styles.profileImagePlaceholder}>
                        <span>Фото</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>{user?.fullName}</h2>
                <p className={styles.profileRole}>{user?.roleName}</p>
                
                <div className={styles.profileDetails}>
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>📧</div>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Email</span>
                      <span className={styles.detailValue}>{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}>📅</div>
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>Дата регистрации</span>
                      <span className={styles.detailValue}>
                        {user ? new Date(user.createdAt).toLocaleDateString('ru-RU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.profileActions}>
                  <button className={styles.actionBtn} onClick={openEditModal}>
                    Редактировать
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'quizzes':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.quizzesOverview}>
              <h2>Квизы</h2>
              <p className={styles.quizzesDescription}>
                Проверьте свои знания в области атомной энергетики и маломощных модульных реакторов
              </p>
              <div className={styles.quizzesPreview}>
                <div className={styles.quizPreviewCard}>
                  <h3>🧩 Основы маломощных реакторов</h3>
                  <p>Базовый тест по пониманию ММР</p>
                </div>
                <div className={styles.quizPreviewCard}>
                  <h3>🚀 Применение ММР</h3>
                  <p>Оценка знаний о применениях маломощных реакторов</p>
                </div>
                <div className={styles.quizPreviewCard}>
                  <h3>🛡️ Безопасность ММР</h3>
                  <p>Проверка знаний по вопросам безопасности ММР</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/quizzes')}
                className={styles.viewAllQuizzesBtn}
              >
                Посмотреть все квизы
              </button>
            </div>
          </div>
        );
      case 'results':
        return (
          <div className={styles.sectionContent}>
            <h2>Результаты</h2>
            <div className={styles.resultsList}>
              <div className={styles.resultCard}>
                <h3>Основы атомной энергетики</h3>
                <div className={styles.resultDetails}>
                  <span>Результат: 85%</span>
                  <span>Дата: 15.01.2024</span>
                </div>
              </div>
              <div className={styles.resultCard}>
                <h3>Безопасность на АЭС</h3>
                <div className={styles.resultDetails}>
                  <span>Результат: 92%</span>
                  <span>Дата: 20.01.2024</span>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
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
            <button 
              className={`${styles.navLink} ${activeSection === 'profile' ? styles.active : ''}`}
              onClick={() => handleSectionChange('profile')}
            >
              Профиль
            </button>
            <button 
              className={`${styles.navLink} ${activeSection === 'quizzes' ? styles.active : ''}`}
              onClick={() => handleSectionChange('quizzes')}
            >
              Квизы
            </button>
            <button 
              className={`${styles.navLink} ${activeSection === 'results' ? styles.active : ''}`}
              onClick={() => handleSectionChange('results')}
            >
              Результаты
            </button>
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
            <button 
              className={`${styles.mobileNavBtn} ${activeSection === 'profile' ? styles.active : ''}`}
              onClick={() => handleSectionChange('profile')}
            >
              <span className={styles.mobileNavIcon}>👤</span>
              Профиль
            </button>
            <button 
              className={`${styles.mobileNavBtn} ${activeSection === 'quizzes' ? styles.active : ''}`}
              onClick={() => handleSectionChange('quizzes')}
            >
              <span className={styles.mobileNavIcon}>📝</span>
              Квизы
            </button>
            <button 
              className={`${styles.mobileNavBtn} ${activeSection === 'results' ? styles.active : ''}`}
              onClick={() => handleSectionChange('results')}
            >
              <span className={styles.mobileNavIcon}>📊</span>
              Результаты
            </button>
            <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
              <span className={styles.mobileNavIcon}>🚪</span>
              Выйти
            </button>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        {renderSection()}
      </main>

      {/* Модальное окно редактирования профиля */}
      {editModalOpen && (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Редактировать профиль</h2>
              <button className={styles.modalClose} onClick={closeEditModal}>
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.editForm}>
              {/* Фото профиля */}
              <div className={styles.formSection}>
                <h3>Фото профиля</h3>
                <div className={styles.imageUploadSection}>
                  <div className={styles.currentImage}>
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Текущее фото" 
                        className={styles.uploadPreview}
                      />
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <span>Нет фото</span>
                      </div>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    className={styles.uploadBtn}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Загрузка...' : 'Изменить фото'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  {uploadError && (
                    <div className={styles.uploadError}>{uploadError}</div>
                  )}
                </div>
              </div>

              {/* Основная информация */}
              <div className={styles.formSection}>
                <h3>Основная информация</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">ФИО</label>
                  <input
                    type="text"
                    id="fullName"
                    value={editForm.fullName}
                    onChange={(e) => handleFormChange('fullName', e.target.value)}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="role">Роль</label>
                  <select
                    id="role"
                    value={editForm.roleId}
                    onChange={(e) => handleFormChange('roleId', parseInt(e.target.value))}
                    required
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Изменение пароля */}
              <div className={styles.formSection}>
                <h3>Изменить пароль</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="currentPassword">Текущий пароль</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={editForm.currentPassword}
                    onChange={(e) => handleFormChange('currentPassword', e.target.value)}
                    placeholder="Введите текущий пароль"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">Новый пароль</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={editForm.newPassword}
                    onChange={(e) => handleFormChange('newPassword', e.target.value)}
                    placeholder="Введите новый пароль"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={editForm.confirmPassword}
                    onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                    placeholder="Повторите новый пароль"
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeEditModal} className={styles.cancelBtn}>
                  Отмена
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Уведомления */}
      {notification.show && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <div className={styles.notificationContent}>
            <span className={styles.notificationIcon}>
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span className={styles.notificationMessage}>{notification.message}</span>
          </div>
          <button 
            className={styles.notificationClose}
            onClick={() => setNotification({ type: 'success', message: '', show: false })}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}