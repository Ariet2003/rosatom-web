import Image from "next/image";
import styles from "./page.module.css";
import { FaUserGraduate, FaLaptopCode, FaAtom, FaChartLine, FaBolt, FaEllipsisH, FaVk, FaTelegramPlane, FaGlobe, FaBrain, FaChartBar, FaCommentDots, FaCertificate, FaBriefcase } from "react-icons/fa";
import Link from "next/link";
import Header from "../components/Header";

const features = [
  {
    heading: "Онлайн-викторина по специализации",
    description: "Пройди тест из 10–15 вопросов, подобранных под выбранную тему. Никакой воды — только по существу.",
    icon: <FaBrain size={28} color="#4E7AFF" />
  },
  {
    heading: "Мгновенный результат",
    description: "Узнай свой балл сразу после прохождения. Твоя заявка автоматически попадает HR-специалисту.",
    icon: <FaChartBar size={28} color="#4E7AFF" />
  },
  {
    heading: "Обратная связь от РосАтом",
    description: "Лучшие участники получают персональное приглашение на собеседование и могут претендовать на стажировку или работу.",
    icon: <FaCommentDots size={28} color="#4E7AFF" />
  },
  {
    heading: "Сертификат участника",
    description: "Все участники получают электронный сертификат, который можно добавить в портфолио или резюме.",
    icon: <FaCertificate size={28} color="#4E7AFF" />
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
        <div className={styles.heroImage}>
          <Image src="/logo-ros.png" alt="Научно-технологичный герой" width={300} height={300} priority />
        </div>
          <h1 className={styles.heroTitle}>РосКвиз от РосАтом</h1>
          <div className={styles.heroSubtitle}>
            Проверь свои знания и получи шанс попасть в одну из самых технологичных компаний страны 🚀
          </div>
          <div className={styles.heroButtons}>
            <button className={styles.primaryBtn}>Начать квиз</button>
            <button className={styles.secondaryBtn}>Узнать подробнее</button>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* Цель квиза — новый стиль с иконкой слева */}
      <section id="goal" className={styles.goalSection2}>
        <div className={styles.goalTitleRow2}>
          <span className={styles.goalTitle2}>
            Цель <span className={styles.goalTitleAccent2}>квиза</span>
          </span>
        </div>
        <div className={styles.goalText2}>
          Квиз разработан для студентов, выпускников и молодых специалистов, которые хотят начать карьеру в РосАтом. Лучшие участники получат приглашение на собеседование!
        </div>
      </section>


      {/* Направления */}
      <section id="directions" className={styles.section}>
        <div className={styles.sectionTitle}>📌 Направления</div>
        <div>Выбери направление, по которому ты хочешь пройти отбор и показать свои знания:</div>
        <div className={styles.directions}>
          <span className={styles.direction}><FaUserGraduate /> Инженерия</span>
          <span className={styles.direction}><FaLaptopCode /> IT и программирование</span>
          <span className={styles.direction}><FaAtom /> Физика</span>
          <span className={styles.direction}><FaChartLine /> Экономика и финансы</span>
          <span className={styles.direction}><FaBolt /> Энергетика</span>
          <span className={styles.direction}><FaEllipsisH /> Другое</span>
        </div>
        <div>& многое другое</div>
      </section>

      <div className={styles.sectionDivider} />

      {/* Возможности платформы (новый блочный вид) */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <span className={styles.sectionTitle}>Возможности <span style={{color: '#4E7AFF'}}>платформы</span></span>
          <div className={styles.featuresSubtext}>
            Используй РосКвиз как первый шаг к будущей карьере. Вот что тебя ждет:
          </div>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div className={styles.featureCard} key={idx}>
              <div className={styles.featureCardHeader}>
                <div className={styles.featureCardIcon}>
                  {feature.icon}
                </div>
                <div className={styles.featureCardTitle}>{feature.heading}</div>
              </div>
              <div className={styles.featureCardDesc}>{feature.description}</div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* Как это работает? — современный стиль */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.sectionTitle}>🛠 Как это работает?</div>
        <div className={styles.stepsModern}>
          <div className={styles.stepModern}>
            <div className={styles.stepNumberModern}>1</div>
            <div className={styles.stepContentModern}>
              <div className={styles.stepTitleModern}>Заполни форму регистрации</div>
              <div className={styles.stepDescModern}>Укажи имя, email, телефон и выбери направление.</div>
            </div>
          </div>
          <div className={styles.stepModern}>
            <div className={styles.stepNumberModern}>2</div>
            <div className={styles.stepContentModern}>
              <div className={styles.stepTitleModern}>Пройди квиз онлайн</div>
              <div className={styles.stepDescModern}>10–15 вопросов по специальности. Всего 10 минут.</div>
            </div>
          </div>
          <div className={styles.stepModern}>
            <div className={styles.stepNumberModern}>3</div>
            <div className={styles.stepContentModern}>
              <div className={styles.stepTitleModern}>Получай результат и жди обратную связь</div>
              <div className={styles.stepDescModern}>Если твои знания на высоте — мы свяжемся с тобой.</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.sectionDivider} />

      {/* Финальный CTA */}
      <section id="cta" className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <div className={styles.ctaTitle}>
            Готов сделать первый шаг к будущей <span className={styles.ctaTitleAccent}>профессии?</span>
          </div>
          <div className={styles.ctaText}>
            Проверь свои знания, получи сертификат и, возможно, начни карьеру в РосАтом!
          </div>
          <button className={styles.ctaBtn}>Пройти квиз сейчас</button>
        </div>
      </section>

      {/* Футер */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <a href="mailto:hr@rosatom-career.ru" className={styles.footerLink}>hr@rosatom-career.ru</a>
            <span className={styles.footerLink}>Москва, ул. Большая Ордынка, 24</span>
            <a href="#" className={styles.footerLink}>Помощь и поддержка</a>
            <a href="#" className={styles.footerLink}>Сообщить о проблеме</a>
            <a href="#" className={styles.footerLink}>Политика конфиденциальности</a>
          </div>
          <div className={styles.footerSocials}>
            <a href="#" className={styles.footerSocialIcon} title="VK"><FaVk /></a>
            <a href="#" className={styles.footerSocialIcon} title="Telegram"><FaTelegramPlane /></a>
            <a href="#" className={styles.footerSocialIcon} title="RosAtom.ru"><FaGlobe /></a>
          </div>
          <div className={styles.footerCopyright}>
            © 2025 StartAtom. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
