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

  useEffect(() => {
    // Проверяем аутентификацию и права администратора
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const isAdmin = localStorage.getItem('isAdmin');
    const userData = localStorage.getItem('user');

    if (!isAuthenticated || !isAdmin || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const userObj: User = JSON.parse(userData);
      setUser(userObj);
      loadSettings();
    } catch (error) {
      console.error('Ошибка парсинга данных пользователя:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
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

  const handleSaveSetting = async (setting: Setting) => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: setting.key,
          value: setting.value
        }),
      });

      if (response.ok) {
        setMessage('Настройка успешно обновлена');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Ошибка при обновлении настройки');
      }
    } catch (error) {
      setMessage('Ошибка сети');
    } finally {
      setSaving(false);
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
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
          <h1>Настройки системы</h1>
          <div className={styles.userInfo}>
            <span>Администратор: {user.fullName}</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <nav className={styles.nav}>
            <h3>Управление</h3>
            <ul>
              <li>
                <Link href="/admin/dashboard" className={styles.navLink}>
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className={styles.navLink}>
                  Пользователи
                </Link>
              </li>
              <li>
                <Link href="/admin/tests" className={styles.navLink}>
                  Тесты
                </Link>
              </li>
              <li>
                <Link href="/admin/results" className={styles.navLink}>
                  Результаты
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" className={`${styles.navLink} ${styles.active}`}>
                  Настройки
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h2>Добавить новую настройку</h2>
            <div className={styles.addForm}>
              <div className={styles.formGroup}>
                <label>Ключ:</label>
                <input
                  type="text"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                  placeholder="Введите ключ настройки"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Значение:</label>
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
                {saving ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </div>

          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          <div className={styles.section}>
            <h2>Текущие настройки</h2>
            <div className={styles.settingsList}>
              {settings.length === 0 ? (
                <p className={styles.emptyMessage}>Настройки не найдены</p>
              ) : (
                settings.map((setting) => (
                  <div key={setting.id} className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <strong>{setting.key}</strong>
                      <span>{setting.value}</span>
                    </div>
                    <div className={styles.settingActions}>
                      <button 
                        onClick={() => handleSaveSetting(setting)}
                        className={styles.saveBtn}
                        disabled={saving}
                      >
                        Сохранить
                      </button>
                      <button 
                        onClick={() => handleDeleteSetting(setting.key)}
                        className={styles.deleteBtn}
                        disabled={saving}
                      >
                        Удалить
                      </button>
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