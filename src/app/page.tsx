"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { FaUserGraduate, FaLaptopCode, FaAtom, FaChartLine, FaBolt, FaEllipsisH, FaVk, FaTelegramPlane, FaGlobe, FaBrain, FaChartBar, FaCommentDots, FaCertificate, FaBriefcase, FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import Header from "../components/Header";
import { useState, useEffect } from "react";

const features = [
  {
    heading: "🧠 Онлайн-викторина по твоей специализации",
    description: "Пройди тест из 10–15 вопросов, подобранных под выбранную тему. Никакой воды — только по существу.",
    icon: FaBrain
  },
  {
    heading: "📊 Мгновенный результат",
    description: "Узнай свой балл сразу после прохождения. Твоя заявка автоматически попадает HR-специалисту.",
    icon: FaChartBar
  },
  {
    heading: "💬 Обратная связь от РосАтом",
    description: "Лучшие участники получают персональное приглашение на собеседование и могут претендовать на стажировку или работу.",
    icon: FaCommentDots
  },
  {
    heading: "📜 Сертификат участника",
    description: "Все участники получают электронный сертификат, который можно добавить в портфолио или резюме.",
    icon: FaCertificate
  }
];

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Обработчик события для открытия мобильного меню
    const handleToggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    window.addEventListener('toggleMobileMenu', handleToggleMobileMenu);

    return () => {
      window.removeEventListener('toggleMobileMenu', handleToggleMobileMenu);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Закрываем мобильное меню при клике на ссылку
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={styles.page}>
      <Header />
      
      {/* Мобильное меню */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>Меню</span>
          <button onClick={toggleMobileMenu} className={styles.mobileMenuClose}>
            <FaTimes />
          </button>
        </div>
        <nav className={styles.mobileNav}>
          <a href="#goal" onClick={handleMobileLinkClick} className={styles.mobileNavLink}>Цель</a>
          <a href="#directions" onClick={handleMobileLinkClick} className={styles.mobileNavLink}>Направления</a>
          <a href="#features" onClick={handleMobileLinkClick} className={styles.mobileNavLink}>Возможности</a>
          <a href="#how-it-works" onClick={handleMobileLinkClick} className={styles.mobileNavLink}>Как это работает</a>
          <a href="#cta" onClick={handleMobileLinkClick} className={styles.mobileNavLink}>Квиз</a>
        </nav>
      </div>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <Image
            src="/logo-ros.png"
            alt="StartAtom Hero"
            width={300}
            height={300}
            priority
            style={{ borderRadius: '16px', maxWidth: '100%', height: 'auto' }}
          />
        </div>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>РосКвиз от РосАтом</h1>
          <p className={styles.heroSubtitle}>
            Проверь свои знания и получи шанс попасть в одну из самых технологичных компаний страны
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.primaryBtn}>🚀 Начать квиз</button>
            <button className={styles.secondaryBtn}>Узнать подробнее</button>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* Цель квиза — новый стиль с иконкой слева */}
      <section id="goal" className={styles.goalSection2}>
        <div className={styles.goalTitleRow2}>
          <div className={styles.goalIcon2}>
            <FaBriefcase />
          </div>
          <div>
            <h2 className={styles.goalTitle2}>
              💼 Цель <span className={styles.goalTitleAccent2}>квиза</span>
            </h2>
            <p className={styles.goalText2}>
              Квиз разработан для студентов, выпускников и молодых специалистов, которые хотят начать карьеру в РосАтом. Лучшие участники получат приглашение на собеседование!
            </p>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* Направления */}
      <section id="directions" className={styles.section}>
        <h2 className={styles.sectionTitle}>📌 Направления</h2>
        <p style={{ textAlign: 'center', marginBottom: '32px', color: '#b0b8d0' }}>
          Выбери направление, по которому ты хочешь пройти отбор и показать свои знания:
        </p>
        <div className={styles.directions}>
          <div className={styles.direction}>
            <FaUserGraduate />
            <span>Инженерия</span>
          </div>
          <div className={styles.direction}>
            <FaLaptopCode />
            <span>IT и программирование</span>
          </div>
          <div className={styles.direction}>
            <FaAtom />
            <span>Физика</span>
          </div>
          <div className={styles.direction}>
            <FaChartLine />
            <span>Экономика и финансы</span>
          </div>
          <div className={styles.direction}>
            <FaBolt />
            <span>Энергетика</span>
          </div>
          <div className={styles.direction}>
            <FaEllipsisH />
            <span>Другое & многое другое</span>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* Возможности платформы (новый блочный вид) */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          🧰 Возможности <span style={{ color: '#4E7AFF' }}>платформы</span>
        </div>
        <p className={styles.featuresSubtext}>
          Используй РосКвиз как первый шаг к будущей карьере. Вот что тебя ждет:
        </p>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureCardHeader}>
                <div className={styles.featureCardIcon}>
                  <feature.icon />
                </div>
                <h3 className={styles.featureCardTitle}>{feature.heading}</h3>
              </div>
              <p className={styles.featureCardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* Как это работает? — современный стиль */}
      <section id="how-it-works" className={styles.section}>
        <h2 className={styles.sectionTitle}>🛠 Как это работает?</h2>
        <div className={styles.stepsModern}>
          <div className={styles.stepModern}>
            <div className={styles.stepNumberModern}>1</div>
            <div className={styles.stepContentModern}>
              <h3 className={styles.stepTitleModern}>Заполни форму регистрации</h3>
              <p className={styles.stepDescModern}>Укажи имя, email, телефон и выбери направление.</p>
            </div>
          </div>
          <div className={styles.stepModern}>
            <div className={styles.stepNumberModern}>2</div>
            <div className={styles.stepContentModern}>
              <h3 className={styles.stepTitleModern}>Пройди квиз онлайн</h3>
              <p className={styles.stepDescModern}>10–15 вопросов по специальности. Всего 10 минут.</p>
            </div>
          </div>
          <div className={styles.stepModern}>
            <div className={styles.stepNumberModern}>3</div>
            <div className={styles.stepContentModern}>
              <h3 className={styles.stepTitleModern}>Получай результат и жди обратную связь</h3>
              <p className={styles.stepDescModern}>Если твои знания на высоте — мы свяжемся с тобой.</p>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* Финальный CTA */}
      <section id="cta" className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <div className={styles.ctaTitle}>
            🚀 Готов сделать первый шаг к будущей <span className={styles.ctaTitleAccent}>профессии?</span>
          </div>
          <p className={styles.ctaText}>
            Проверь свои знания, получи сертификат и, возможно, начни карьеру в РосАтом!
          </p>
          <button className={styles.ctaBtn}>Пройти квиз сейчас</button>
        </div>
      </section>

      {/* Футер */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <div>
              <h4>📞 Контакты</h4>
              <p>📧 hr@rosatom-career.ru</p>
              <p>☎ +7 (495) XXX-XX-XX</p>
            </div>
            <div>
              <h4>Помощь и поддержка</h4>
              <a href="#" className={styles.footerLink}>Сообщить о проблеме</a>
              <a href="#" className={styles.footerLink}>Политика конфиденциальности</a>
            </div>
          </div>
          <div className={styles.footerSocials}>
            <a href="#" className={styles.footerSocialIcon}>
              <FaVk />
            </a>
            <a href="#" className={styles.footerSocialIcon}>
              <FaTelegramPlane />
            </a>
            <a href="#" className={styles.footerSocialIcon}>
              <FaGlobe />
            </a>
          </div>
        </div>
        <div className={styles.footerCopyright}>
          © 2025 StartAtom. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
