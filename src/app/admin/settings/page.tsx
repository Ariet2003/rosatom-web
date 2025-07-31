"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin-settings.module.css';

interface Setting {
  id: number;
  key: string;
  value: string;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: '', value: '' });
  const [message, setMessage] = useState('');
  const [editingSetting, setEditingSetting] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Проверяем аутентификацию и права администратора
    const checkAdminAuthAndLoadData = async () => {
      try {
        const authResponse = await fetch('/api/auth/check-admin', {
          method: 'GET',
          credentials: 'include'
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          setUser(authData.user);
          loadSettings();
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

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const handleAddSetting = async () => {
    if (!newSetting.key || !newSetting.value) {
      setMessage('Заполните все поля');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSetting),
      });

      if (response.ok) {
        setNewSetting({ key: '', value: '' });
        setMessage('Настройка успешно добавлена');
        loadSettings();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Ошибка при добавлении настройки');
      }
    } catch (error) {
      setMessage('Ошибка сети');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту настройку?')) {
      return;
    }

    try {
      const response = await fetch(`/api/settings?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Настройка успешно удалена');
        loadSettings();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Ошибка при удалении настройки');
      }
    } catch (error) {
      setMessage('Ошибка сети');
    }
  };

  const handleEditSetting = (setting: Setting) => {
    setEditingSetting(setting.id);
    setEditValue(setting.value);
  };

  const handleCancelEdit = () => {
    setEditingSetting(null);
    setEditValue('');
  };

  const handleUpdateSetting = async (setting: Setting) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: setting.key,
          value: editValue
        }),
      });

      if (response.ok) {
        setMessage('Настройка успешно обновлена');
        setTimeout(() => setMessage(''), 3000);
        setEditingSetting(null);
        loadSettings();
      } else {
        setMessage('Ошибка при обновлении настройки');
      }
    } catch (error) {
      setMessage('Ошибка сети');
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Загрузка настроек...</p>
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
            <h1>Настройки системы</h1>
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
                <Link href="/admin/dashboard" className={styles.navLink} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Главная
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
                <Link href="/admin/results" className={styles.navLink} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                  </svg>
                  Результаты
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className={`${styles.navLink} ${styles.active}`} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Настройки
                </Link>
              </li>
              <li>
                <Link href="/admin/credentials" className={styles.navLink} onClick={closeSidebar}>
                  <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3"></path>
                    <path d="M10 17l4-4-4-4"></path>
                    <path d="M14 13h-8"></path>
                  </svg>
                  Учетные данные
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={`${styles.content} ${sidebarOpen ? styles.contentShifted : ''}`}>
          <div className={styles.section}>
            <h2>➕ Добавить новую настройку</h2>
            <div className={styles.addForm}>
              <div className={styles.formGroup}>
                <label>🔑 Ключ:</label>
                <input
                  type="text"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                  placeholder="Введите ключ настройки"
                />
              </div>
              <div className={styles.formGroup}>
                <label>💾 Значение:</label>
                <input
                  type="text"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                  placeholder="Введите значение"
                />
              </div>
              <button 
                onClick={handleAddSetting} 
                className={styles.addBtn}
                disabled={saving}
              >
                {saving ? '⏳ Добавление...' : '➕ Добавить'}
              </button>
            </div>
          </div>

          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          <div className={styles.section}>
            <h2>📋 Текущие настройки</h2>
            <div className={styles.settingsList}>
              {settings.length === 0 ? (
                <p className={styles.emptyMessage}>🔍 Настройки не найдены</p>
              ) : (
                settings.map((setting) => (
                  <div key={setting.id} className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <strong>🔑 {setting.key}</strong>
                      {editingSetting === setting.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className={styles.formGroup}
                          style={{
                            padding: '0.5rem',
                            border: '2px solid rgba(78, 122, 255, 0.3)',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            fontSize: '0.9rem',
                            marginTop: '0.5rem'
                          }}
                        />
                      ) : (
                        <span>💾 {setting.value}</span>
                      )}
                    </div>
                    <div className={styles.settingActions}>
                      {editingSetting === setting.id ? (
                        <>
                          <button 
                            onClick={() => handleUpdateSetting(setting)}
                            className={styles.saveBtn}
                            disabled={saving}
                          >
                            ✅ Сохранить
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className={styles.deleteBtn}
                            disabled={saving}
                          >
                            ❌ Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEditSetting(setting)}
                            className={styles.saveBtn}
                            disabled={saving}
                          >
                            ✏️ Редактировать
                          </button>
                          <button 
                            onClick={() => handleDeleteSetting(setting.key)}
                            className={styles.deleteBtn}
                            disabled={saving}
                          >
                            🗑️ Удалить
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 