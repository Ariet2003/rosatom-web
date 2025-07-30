"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import styles from "../app/page.module.css";

interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  roleName?: string;
  createdAt: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверяем аутентификацию при загрузке компонента
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    if (isAuthenticated === 'true' && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(user);
      } catch (error) {
        console.error('Ошибка парсинга данных пользователя:', error);
      }
    }
  }, []);

  const links = [
    { name: "Цель", href: "#goal" },
    { name: "Направления", href: "#directions" },
    { name: "Возможности", href: "#features" },
    { name: "Как это работает", href: "#how-it-works" },
    { name: "Квиз", href: "#cta" },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Вызываем API для очистки куки на сервере
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Очищаем локальные данные
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      setIsAuthenticated(false);
      setUser(null);
      
      // Перенаправляем на главную
      router.push('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.headerLogo} prefetch={false}>
        <img src="/logo-ros.png" alt="StartAtom logo" style={{ height: 38 }} />
        <span className={styles.headerBrand}>StartAtom</span>
      </Link>
      <nav className={styles.headerNav}>
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            className={styles.headerNavLink}
            onClick={e => handleSmoothScroll(e, link.href)}
          >
            {link.name}
            <span className={styles.headerNavLinkUnderline}></span>
          </a>
        ))}
      </nav>
      <div className={styles.headerActions}>
        {isAuthenticated ? (
          <>
            <span className={styles.userGreeting}>
              Привет, {user?.fullName}!
            </span>
            <Link href="/dashboard" className={styles.headerBtn}>
              Дашборд
            </Link>
            <button onClick={handleLogout} className={styles.headerBtn + ' ' + styles.headerBtnLogout}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/signin" className={styles.headerBtn}>
              Войти
            </Link>
            <Link href="/auth/signup" className={styles.headerBtn + ' ' + styles.headerBtnPrimary}>
              Регистрация
            </Link>
          </>
        )}
      </div>
    </header>
  );
}