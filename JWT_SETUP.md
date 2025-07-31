# Настройка JWT для админ аутентификации

## Добавление JWT_SECRET в .env.local

Добавьте в файл `.env.local` секретный ключ для JWT:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your-bot-token-here
TELEGRAM_CHAT_ID=your-chat-id-here

# Email Configuration (опционально)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/rosatom_web"
```

## Генерация безопасного JWT_SECRET

Для продакшена используйте криптографически стойкий ключ:

```bash
# Генерация 64-символьного ключа
openssl rand -base64 64

# Или используйте онлайн генератор
# https://generate-secret.vercel.app/64
```

## Безопасность JWT

- ✅ **HttpOnly cookies** - токен недоступен через JavaScript
- ✅ **Secure flag** - передача только по HTTPS в продакшене
- ✅ **SameSite: lax** - защита от CSRF атак
- ✅ **7 дней срок действия** - автоматическое истечение
- ✅ **HS256 алгоритм** - криптографически стойкий

## Структура JWT токена

```json
{
  "id": 0,
  "email": "admin@gmail.com",
  "fullName": "Администратор",
  "roleName": "admin",
  "isAdmin": true,
  "iat": 1704067200,
  "exp": 1704672000
}
```

## API эндпоинты

- `POST /api/auth/send-verification-code` - отправка кода
- `POST /api/auth/verify-code` - верификация кода + JWT
- `GET /api/auth/check-admin` - проверка аутентификации
- `POST /api/auth/admin-logout` - выход + очистка токена 