"use client";

import Link from "next/link";
import styles from "../app/page.module.css";

export default function Header() {
  const links = [
    { name: "Цель", href: "#goal" },
    { name: "Направления", href: "#directions" },
    { name: "Возможности", href: "#features" },
    { name: "Как это работает", href: "#how-it-works" },
    { name: "Квиз", href: "#cta" },
  ];

  const handleSmoothScroll = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
        <button className={styles.headerBtn}>Войти</button>
        <button className={styles.headerBtn + ' ' + styles.headerBtnPrimary}>Регистрация</button>
      </div>
    </header>
  );
}