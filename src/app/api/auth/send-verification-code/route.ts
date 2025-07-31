import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail, sendTestEmail, generateVerificationEmailHtml } from '@/lib/email';
import { sendVerificationCodeToTelegram, checkTelegramSettings } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Получаем настройки админа из таблицы Settings
    const adminSettings = await prisma.settings.findUnique({
      where: {
        key: 'admin_login'
      }
    });

    if (!adminSettings) {
      return NextResponse.json(
        { message: 'Настройки администратора не найдены' },
        { status: 404 }
      );
    }

    // Парсим JSON из поля value
    let adminCredentials;
    try {
      adminCredentials = JSON.parse(adminSettings.value);
    } catch (error) {
      return NextResponse.json(
        { message: 'Ошибка в настройках администратора' },
        { status: 500 }
      );
    }

    // Проверяем email
    if (adminCredentials.login !== email) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, adminCredentials.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Генерируем 6-значный код
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Сохраняем код в настройках с временной меткой
    const codeData = {
      code: verificationCode,
      email: email,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 минут
      attempts: 0
    };

    await prisma.settings.upsert({
      where: { key: 'admin_verification_code' },
      update: { value: JSON.stringify(codeData) },
      create: {
        key: 'admin_verification_code',
        value: JSON.stringify(codeData)
      }
    });

    // Выводим код в консоль для тестирования
    console.log('🔐 Код подтверждения для входа в админ панель:');
    console.log('📧 Email:', email);
    console.log('🔢 Код:', verificationCode);
    console.log('⏰ Действителен до:', new Date(Date.now() + 10 * 60 * 1000).toLocaleString('ru-RU'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Пытаемся отправить в Telegram (приоритет 1)
    let codeSent = false;
    if (checkTelegramSettings()) {
      console.log('📱 Попытка отправки в Telegram...');
      codeSent = await sendVerificationCodeToTelegram(verificationCode, email);
      if (codeSent) {
        console.log('✅ Код отправлен в Telegram');
      }
    }

    // Если Telegram не работает, пытаемся отправить email (приоритет 2)
    if (!codeSent) {
      console.log('📧 Попытка отправки email...');
      const emailHtml = generateVerificationEmailHtml(verificationCode, email);
      let emailSent = await sendEmail({
        to: email,
        subject: '🔐 Код подтверждения - StartAtom Admin',
        html: emailHtml
      });

      // Если основной email не работает, используем резервный
      if (!emailSent) {
        console.log('🔄 Попытка резервной отправки email...');
        emailSent = await sendTestEmail(verificationCode, email);
      }

      if (emailSent) {
        codeSent = true;
        console.log('✅ Код отправлен по email');
      }
    }

    // Если ничего не работает, код все равно доступен в консоли
    if (!codeSent) {
      console.log('⚠️ Не удалось отправить код, но он доступен в консоли выше');
    }

    return NextResponse.json({
      message: 'Код подтверждения сгенерирован. Проверьте Telegram, email или консоль сервера.',
      email: email,
      note: 'Код также выведен в консоль сервера для тестирования'
    });

  } catch (error) {
    console.error('Ошибка отправки кода подтверждения:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 