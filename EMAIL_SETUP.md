# Настройка Email для отправки кодов подтверждения

## Шаг 1: Создание Gmail App Password

1. Войдите в свой Gmail аккаунт
2. Перейдите в настройки безопасности: https://myaccount.google.com/security
3. Включите двухфакторную аутентификацию (если не включена)
4. Создайте пароль приложения:
   - Нажмите "Пароли приложений"
   - Выберите "Другое (пользовательское имя)"
   - Введите название: "StartAtom Admin"
   - Скопируйте сгенерированный 16-значный пароль

## Шаг 2: Создание файла .env.local

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password

# Database (уже должно быть настроено)
DATABASE_URL="postgresql://postgres:password@localhost:5432/rosatom_web"
```

## Шаг 3: Замена значений

Замените в файле `.env.local`:
- `your-email@gmail.com` на ваш реальный Gmail адрес
- `your-16-digit-app-password` на пароль приложения из шага 1

## Шаг 4: Перезапуск сервера

После создания файла `.env.local` перезапустите сервер разработки:

```bash
npm run dev
```

## Пример файла .env.local

```env
EMAIL_USER=admin@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
DATABASE_URL="postgresql://postgres:password@localhost:5432/rosatom_web"
```

## Альтернативные SMTP провайдеры

Если не хотите использовать Gmail, можете настроить другие провайдеры:

### Yandex
```env
EMAIL_USER=your-email@yandex.ru
EMAIL_PASS=your-app-password
```

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
```

### SendGrid
```env
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

## Безопасность

- Никогда не коммитьте файл `.env.local` в git
- Используйте только пароли приложений, не обычные пароли
- Регулярно обновляйте пароли приложений 