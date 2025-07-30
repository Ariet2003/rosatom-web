import { PrismaClient, QuestionType } from '@prisma/client';

const prisma = new PrismaClient();

const tests = [
  {
    title: 'Основы маломощных реакторов',
    description: 'Базовый тест по пониманию ММР',
    questions: {
      multiple: [
        {
          text: 'Что такое маломощный модульный реактор (ММР)?',
          options: [
            { text: 'Мобильный реактор для производства водорода', isCorrect: false },
            { text: 'Компактный ядерный реактор с низкой мощностью', isCorrect: true },
            { text: 'Термоядерная установка', isCorrect: false },
            { text: 'Установка для исследования материалов', isCorrect: false },
          ],
        },
        {
          text: 'Какой основной тип топлива используется в ММР?',
          options: [
            { text: 'Уголь', isCorrect: false },
            { text: 'Уран-235', isCorrect: true },
            { text: 'Плутоний-239', isCorrect: false },
            { text: 'Газ', isCorrect: false },
          ],
        },
        {
          text: 'Какая страна является лидером в разработке ММР?',
          options: [
            { text: 'Канада', isCorrect: false },
            { text: 'Россия', isCorrect: true },
            { text: 'Франция', isCorrect: false },
            { text: 'Индия', isCorrect: false },
          ],
        },
        {
          text: 'Каков приблизительный диапазон мощности ММР?',
          options: [
            { text: '10–50 МВт', isCorrect: true },
            { text: '500–1000 МВт', isCorrect: false },
            { text: '> 1500 МВт', isCorrect: false },
            { text: '1–5 МВт', isCorrect: false },
          ],
        },
        {
          text: 'Какая из характеристик применима к ММР?',
          options: [
            { text: 'Большой масштаб и централизованность', isCorrect: false },
            { text: 'Модульность и компактность', isCorrect: true },
            { text: 'Невозможность транспортировки', isCorrect: false },
            { text: 'Высокая стоимость', isCorrect: false },
          ],
        },
        {
          text: 'Какой тип охлаждения наиболее часто используется в ММР?',
          options: [
            { text: 'Вода под давлением', isCorrect: true },
            { text: 'Газ под давлением', isCorrect: false },
            { text: 'Жидкий металл', isCorrect: false },
            { text: 'Нефть', isCorrect: false },
          ],
        },
        {
          text: 'Какое основное преимущество модульности ММР?',
          options: [
            { text: 'Лёгкость в транспортировке и установке', isCorrect: true },
            { text: 'Большой размер реактора', isCorrect: false },
            { text: 'Сложность в эксплуатации', isCorrect: false },
            { text: 'Отсутствие автоматизации', isCorrect: false },
          ],
        },
      ],
      open: [
        { text: 'Объясните принцип работы маломощного модульного реактора.' },
        { text: 'В чём заключается отличие ММР от традиционных АЭС?' },
        { text: 'Какие основные компоненты входят в конструкцию ММР?' },
      ],
    },
  },
  {
    title: 'Применение ММР',
    description: 'Оценка знаний о применениях маломощных реакторов',
    questions: {
      multiple: [
        {
          text: 'Где ММР наиболее целесообразно использовать?',
          options: [
            { text: 'В мегаполисах', isCorrect: false },
            { text: 'В отдалённых и труднодоступных регионах', isCorrect: true },
            { text: 'Вблизи крупных ГЭС', isCorrect: false },
            { text: 'Только в военных базах', isCorrect: false },
          ],
        },
        {
          text: 'Какие отрасли выигрывают от внедрения ММР?',
          options: [
            { text: 'Сельское хозяйство', isCorrect: false },
            { text: 'Промышленность и энергетика', isCorrect: true },
            { text: 'Ювелирное дело', isCorrect: false },
            { text: 'Медицина', isCorrect: false },
          ],
        },
        {
          text: 'Могут ли ММР использоваться для опреснения воды?',
          options: [
            { text: 'Нет', isCorrect: false },
            { text: 'Да', isCorrect: true },
            { text: 'Только с доработкой', isCorrect: false },
            { text: 'Неизвестно', isCorrect: false },
          ],
        },
        {
          text: 'В какой среде ММР особенно полезны?',
          options: [
            { text: 'Урбанизированные зоны', isCorrect: false },
            { text: 'Северные и изолированные территории', isCorrect: true },
            { text: 'Острова с АЭС', isCorrect: false },
            { text: 'Только в Европе', isCorrect: false },
          ],
        },
        {
          text: 'Какова продолжительность автономной работы ММР?',
          options: [
            { text: '1–2 года', isCorrect: false },
            { text: '10–15 лет', isCorrect: true },
            { text: '30 лет', isCorrect: false },
            { text: 'До 1 месяца', isCorrect: false },
          ],
        },
        {
          text: 'Какой фактор повышает привлекательность ММР для военных?',
          options: [
            { text: 'Наличие вооружения', isCorrect: false },
            { text: 'Автономность и мобильность', isCorrect: true },
            { text: 'Стоимость', isCorrect: false },
            { text: 'Высокая сложность', isCorrect: false },
          ],
        },
        {
          text: 'Какая страна первой установила ММР на плавучей платформе?',
          options: [
            { text: 'Россия', isCorrect: true },
            { text: 'США', isCorrect: false },
            { text: 'Китай', isCorrect: false },
            { text: 'Швеция', isCorrect: false },
          ],
        },
      ],
      open: [
        { text: 'Опишите возможные применения ММР в отдалённых регионах.' },
        { text: 'Как ММР могут повлиять на развитие энергетики в развивающихся странах?' },
        { text: 'Приведите примеры внедрения ММР в промышленности.' },
      ],
    },
  },
  {
    title: 'Безопасность ММР',
    description: 'Проверка знаний по вопросам безопасности ММР',
    questions: {
      multiple: [
        {
          text: 'Какой принцип обеспечивает безопасность ММР?',
          options: [
            { text: 'Принцип активного вмешательства оператора', isCorrect: false },
            { text: 'Принцип пассивной безопасности', isCorrect: true },
            { text: 'Ручное охлаждение реактора', isCorrect: false },
            { text: 'Высокое давление', isCorrect: false },
          ],
        },
        {
          text: 'Что делает ММР менее подверженным авариям?',
          options: [
            { text: 'Малый объём и компактность', isCorrect: true },
            { text: 'Большие размеры корпуса', isCorrect: false },
            { text: 'Сложность конструкции', isCorrect: false },
            { text: 'Высокая температура топлива', isCorrect: false },
          ],
        },
        {
          text: 'Как осуществляется защита от перегрева?',
          options: [
            { text: 'Системы аварийного охлаждения', isCorrect: true },
            { text: 'Сброс давления в окружающую среду', isCorrect: false },
            { text: 'Только ручное охлаждение', isCorrect: false },
            { text: 'Пожарные насосы', isCorrect: false },
          ],
        },
        {
          text: 'Какая система аварийной защиты используется в ММР?',
          options: [
            { text: 'Автоматические пассивные стержни', isCorrect: true },
            { text: 'Охлаждающая жидкость под высоким давлением', isCorrect: false },
            { text: 'Только вручную', isCorrect: false },
            { text: 'Никакая', isCorrect: false },
          ],
        },
        {
          text: 'Чем ММР отличается по уровню радиоактивности от обычных АЭС?',
          options: [
            { text: 'ММР имеют более высокую радиоактивность', isCorrect: false },
            { text: 'ММР имеют ниже объём радиоактивных отходов', isCorrect: true },
            { text: 'Равнозначны', isCorrect: false },
            { text: 'Зависит от страны', isCorrect: false },
          ],
        },
        {
          text: 'Насколько уязвим ММР к внешним угрозам?',
          options: [
            { text: 'Высоко уязвимы', isCorrect: false },
            { text: 'Малочувствительны из-за защищённой конструкции', isCorrect: true },
            { text: 'Не защищены вовсе', isCorrect: false },
            { text: 'Только от ураганов', isCorrect: false },
          ],
        },
        {
          text: 'Может ли ММР быть безопасным при транспортировке?',
          options: [
            { text: 'Да, благодаря модульности и защите', isCorrect: true },
            { text: 'Нет, это слишком опасно', isCorrect: false },
            { text: 'Только по воздуху', isCorrect: false },
            { text: 'Нельзя транспортировать ММР', isCorrect: false },
          ],
        },
      ],
      open: [
        { text: 'Опишите пассивные системы безопасности ММР.' },
        { text: 'Как предотвращается утечка радиации в ММР?' },
        { text: 'Какие материалы используются для защиты в конструкции ММР?' },
      ],
    },
  },
];

async function main() {
  for (const test of tests) {
    const createdTest = await prisma.test.create({
      data: {
        title: test.title,
        description: test.description,
        createdById: 1,
        questions: {
          create: [
            ...test.questions.multiple.map((q) => ({
              text: q.text,
              type: QuestionType.MULTIPLE_CHOICE,
              score: 1,
              options: {
                create: q.options,
              },
            })),
            ...test.questions.open.map((q) => ({
              text: q.text,
              type: QuestionType.OPEN,
              score: 2,
            })),
          ],
        },
      },
    });

    console.log(`✅ Created test: ${createdTest.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
