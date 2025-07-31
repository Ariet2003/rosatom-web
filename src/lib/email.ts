import nodemailer from 'nodemailer';

// Создаем транспортер для отправки email
// Поддерживаем разные SMTP провайдеры
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error('❌ EMAIL_USER и EMAIL_PASS не настроены в .env.local');
    console.error('📖 Смотрите EMAIL_SETUP.md для инструкций');
    return null;
  }

  // Определяем провайдера по email
  const isGmail = emailUser.includes('@gmail.com');
  const isYandex = emailUser.includes('@yandex.ru');
  const isOutlook = emailUser.includes('@outlook.com') || emailUser.includes('@hotmail.com');
  const isSendGrid = emailUser === 'apikey';

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
  } else if (isYandex) {
    return nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
  } else if (isOutlook) {
    return nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
  } else if (isSendGrid) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: { user: 'apikey', pass: emailPass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
  } else {
    // Универсальный SMTP
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: emailUser, pass: emailPass },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
  }
};

// Функция для отправки email
export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> => {
  try {
    console.log('📧 Попытка отправки email на:', to);
    console.log('🔧 Используемый email:', process.env.EMAIL_USER);
    
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('❌ Не удалось создать транспортер для email');
      return false;
    }

    // Проверяем соединение перед отправкой
    console.log('🔍 Проверка соединения с SMTP сервером...');
    await transporter.verify();
    console.log('✅ Соединение с SMTP сервером установлено');

    const info = await transporter.sendMail({
      from: `"StartAtom Admin" <${process.env.EMAIL_USER || 'noreply@startatom.com'}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email отправлен успешно');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 To:', to);

    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки email:', error);
    
    // Дополнительная диагностика
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ECONNRESET') {
        console.error('🔧 Возможные причины ECONNRESET:');
        console.error('   - Неправильный пароль приложения');
        console.error('   - Блокировка SMTP провайдером');
        console.error('   - Проблемы с сетевым соединением');
        console.error('   - Неправильные настройки безопасности Gmail');
      }
      
      if (error.code === 'EAUTH') {
        console.error('🔧 Ошибка аутентификации:');
        console.error('   - Проверьте правильность email и пароля');
        console.error('   - Убедитесь, что используется пароль приложения');
        console.error('   - Проверьте, что двухфакторная аутентификация включена');
      }
    }

    return false;
  }
};

// Резервная функция для тестовой отправки (если основной способ не работает)
export const sendTestEmail = async (code: string, email: string): Promise<boolean> => {
  try {
    console.log('🧪 Использование резервного метода отправки...');
    
    // Создаем тестовый аккаунт Ethereal
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"StartAtom Admin" <noreply@startatom.com>',
      to: email,
      subject: '🔐 Код подтверждения - StartAtom Admin (Тест)',
      html: generateVerificationEmailHtml(code, email),
    });

    console.log('✅ Тестовый email отправлен успешно');
    console.log('📧 Message ID:', info.messageId);
    console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('🔐 Код подтверждения:', code);

    return true;
  } catch (error) {
    console.error('❌ Ошибка тестовой отправки email:', error);
    return false;
  }
};

// Генерация HTML для email с кодом подтверждения
export const generateVerificationEmailHtml = (code: string, email: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Код подтверждения - StartAtom Admin</title>
        <style>
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                background: linear-gradient(135deg, #020817 0%, #1a1a2e 100%);
                margin: 0;
                padding: 20px;
                color: #fff;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                padding: 40px;
                border: 2px solid #4e7aff;
                backdrop-filter: blur(10px);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #4e7aff;
                font-size: 2rem;
                margin-bottom: 10px;
            }
            .code-container {
                background: rgba(78, 122, 255, 0.1);
                border: 2px solid #4e7aff;
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
            }
            .verification-code {
                font-size: 3rem;
                font-weight: bold;
                color: #86efac;
                letter-spacing: 10px;
                margin: 20px 0;
                font-family: 'Courier New', monospace;
            }
            .info {
                background: rgba(34, 197, 94, 0.1);
                border: 1px solid rgba(34, 197, 94, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }
            .warning {
                background: rgba(220, 38, 38, 0.1);
                border: 1px solid rgba(220, 38, 38, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(78, 122, 255, 0.2);
                color: #b0b8d0;
                font-size: 0.9rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 StartAtom Admin</h1>
                <p>Код подтверждения для входа в админ панель</p>
            </div>
            
            <div class="code-container">
                <h2>Ваш код подтверждения:</h2>
                <div class="verification-code">${code}</div>
                <p>Введите этот код на странице входа для завершения аутентификации</p>
            </div>
            
            <div class="info">
                <h3>ℹ️ Информация:</h3>
                <ul>
                    <li>Код действителен в течение 10 минут</li>
                    <li>У вас есть максимум 3 попытки ввода кода</li>
                    <li>Если код не пришел, проверьте папку "Спам"</li>
                </ul>
            </div>
            
            <div class="warning">
                <h3>⚠️ Безопасность:</h3>
                <p>Не передавайте этот код третьим лицам. Если вы не запрашивали код, проигнорируйте это письмо.</p>
            </div>
            
            <div class="footer">
                <p>Это автоматическое сообщение от системы StartAtom Admin</p>
                <p>Email: ${email}</p>
                <p>Время отправки: ${new Date().toLocaleString('ru-RU')}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}; 