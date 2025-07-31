'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './users.module.css';

interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  _count: {
    testSessions: number;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingUser, setEditingUser] = useState<{ id: number; fullName: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: number; userName: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('error', 'Ошибка при загрузке пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchUsers(1, search);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [search]);

  const handlePageChange = (page: number) => {
    fetchUsers(page, search);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/admin-logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ id: user.id, fullName: user.fullName });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingUser.id,
          fullName: editingUser.fullName,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to update user');
      }

      showNotification('success', 'Пользователь успешно обновлен');
      setEditingUser(null);
      fetchUsers(pagination?.currentPage || 1, search);
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('error', 'Ошибка при обновлении пользователя');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleDeleteClick = (user: User) => {
    setDeleteConfirm({ userId: user.id, userName: user.fullName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/admin/users?id=${deleteConfirm.userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to delete user');
      }

      showNotification('success', 'Пользователь успешно удален');
      setDeleteConfirm(null);
      fetchUsers(pagination?.currentPage || 1, search);
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('error', 'Ошибка при удалении пользователя');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button className={styles.burgerMenu} onClick={toggleSidebar}>
              <span></span>
              <span></span>
              <span></span>
            </button>
            <h1>Пользователи</h1>
          </div>
          <div className={styles.headerUserInfo}>
            <span className={styles.userName}>Администратор</span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3>Меню</h3>
          <button className={styles.closeSidebar} onClick={closeSidebar}>
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
                  <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
                Результаты
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className={`${styles.navLink} ${styles.active}`} onClick={closeSidebar}>
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

      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={closeSidebar}></div>}

      <main className={`${styles.main} ${sidebarOpen ? styles.contentShifted : ''}`}>
        <div className={styles.content}>
          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Таблица для десктопа */}
          <div className={styles.tableContainer}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>ФИО</th>
                  <th>Email</th>
                  <th>Дата регистрации</th>
                  <th>Тестов пройдено</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      {editingUser?.id === user.id ? (
                        <input
                          type="text"
                          value={editingUser.fullName}
                          onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                          className={styles.editInput}
                        />
                      ) : (
                        user.fullName
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{user._count.testSessions}</td>
                    <td className={styles.actions}>
                      {editingUser?.id === user.id ? (
                        <>
                          <button onClick={handleSaveEdit} className={styles.saveBtn}>
                            Сохранить
                          </button>
                          <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                            Отмена
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditUser(user)} className={styles.editBtn}>
                            Редактировать
                          </button>
                          <button onClick={() => handleDeleteClick(user)} className={styles.deleteBtn}>
                            Удалить
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Карточки для мобильных устройств */}
          <div className={styles.usersCards}>
            {users.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userCardHeader}>
                  <div className={styles.userCardId}>ID: {user.id}</div>
                </div>
                
                {editingUser?.id === user.id ? (
                  <input
                    type="text"
                    value={editingUser.fullName}
                    onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    className={styles.userCardEditInput}
                    placeholder="Введите ФИО"
                  />
                ) : (
                  <div className={styles.userCardName}>{user.fullName}</div>
                )}
                
                <div className={styles.userCardEmail}>{user.email}</div>
                <div className={styles.userCardDate}>{formatDate(user.createdAt)}</div>
                
                <div className={styles.userCardStats}>
                  <span>Тестов пройдено:</span>
                  <span className={styles.userCardTests}>{user._count.testSessions}</span>
                </div>
                
                <div className={styles.userCardActions}>
                  {editingUser?.id === user.id ? (
                    <>
                      <button onClick={handleSaveEdit} className={styles.saveBtn}>
                        Сохранить
                      </button>
                      <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                        Отмена
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditUser(user)} className={styles.editBtn}>
                        Редактировать
                      </button>
                      <button onClick={() => handleDeleteClick(user)} className={styles.deleteBtn}>
                        Удалить
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

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

          {pagination && (
            <div className={styles.paginationInfo}>
              Показано {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} из {pagination.totalCount} пользователей
            </div>
          )}
        </div>
      </main>

      {/* Уведомления */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirm && (
        <div className={styles.confirmModalOverlay}>
          <div className={styles.confirmModal}>
            <h3>Подтверждение удаления</h3>
            <p>
              Вы уверены, что хотите удалить пользователя <strong>{deleteConfirm.userName}</strong>?
            </p>
            <p>Это действие нельзя отменить.</p>
            <div className={styles.confirmModalActions}>
              <button onClick={handleConfirmDelete} className={styles.confirmDeleteBtn}>
                Удалить
              </button>
              <button onClick={() => setDeleteConfirm(null)} className={styles.cancelDeleteBtn}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 