# Настройка Telegram для отправки кодов подтверждения

## Шаг 1: Создание Telegram бота

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Введите название бота (например: "StartAtom Admin")
4. Введите username бота (например: "startatom_admin_bot")
5. Скопируйте полученный токен бота (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Шаг 2: Получение Chat ID

### Способ 1: Через @userinfobot
1. Найдите @userinfobot в Telegram
2. Отправьте любое сообщение боту
3. Скопируйте ваш Chat ID (число, например: `123456789`)

### Способ 2: Через @getidsbot
1. Найдите @getidsbot в Telegram
2. Отправьте любое сообщение боту
3. Скопируйте ваш Chat ID

### Способ 3: Через API (если знаете токен бота)
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```

## Шаг 3: Создание файла .env.local

Добавьте в файл `.env.local` следующие строки:

```env
# Telegram Configuration
TELEGRAM_BOT_TOKEN=your-bot-token-here
TELEGRAM_CHAT_ID=your-chat-id-here

# Email Configuration (опционально)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/rosatom_web"
```

## Шаг 4: Замена значений

Замените в файле `.env.local`:
- `your-bot-token-here` на токен бота из шага 1
- `your-chat-id-here` на ваш Chat ID из шага 2

## Шаг 5: Тестирование

1. Перезапустите сервер разработки:
```bash
npm run dev
```

2. Попробуйте войти в админ панель
3. Код подтверждения должен прийти в Telegram

## Пример файла .env.local

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=987654321
EMAIL_USER=admin@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
DATABASE_URL="postgresql://postgres:password@localhost:5432/rosatom_web"
```

## Приоритет отправки

Система будет пытаться отправить код в следующем порядке:
1. **Telegram** (если настроен)
2. **Email** (если настроен)
3. **Консоль сервера** (всегда доступен)

## Безопасность

- Никогда не коммитьте файл `.env.local` в git
- Храните токен бота в безопасном месте
- Регулярно обновляйте токен бота
- Используйте приватные боты для продакшена

## Устранение неполадок

### Бот не отвечает
- Проверьте правильность токена
- Убедитесь, что бот не заблокирован
- Проверьте Chat ID

### Сообщения не приходят
- Проверьте, что вы отправили боту хотя бы одно сообщение
- Убедитесь, что бот не заблокирован
- Проверьте настройки приватности

### Ошибка "Forbidden"
- Бот заблокирован пользователем
- Неправильный Chat ID
- Бот не имеет прав на отправку сообщений 