import TelegramBot from 'node-telegram-bot-api';

// Создаем экземпляр бота
const createBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('❌ TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены в .env.local');
    console.error('📖 Смотрите TELEGRAM_SETUP.md для инструкций');
    return null;
  }

  return new TelegramBot(token, { polling: false });
};

// Функция для отправки сообщения в Telegram
export const sendTelegramMessage = async (message: string): Promise<boolean> => {
  try {
    console.log('📱 Попытка отправки сообщения в Telegram...');
    
    const bot = createBot();
    if (!bot) {
      return false;
    }

    const chatId = process.env.TELEGRAM_CHAT_ID!;
    
    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    console.log('✅ Сообщение отправлено в Telegram');
    return true;
  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error);
    return false;
  }
};

// Функция для отправки кода подтверждения в Telegram
export const sendVerificationCodeToTelegram = async (code: string, email: string): Promise<boolean> => {
  const message = `
🔐 <b>Код подтверждения - StartAtom Admin</b>

📧 <b>Email:</b> ${email}
🔢 <b>Код подтверждения:</b> <code>${code}</code>

⏰ <b>Действителен:</b> 10 минут
🔄 <b>Попыток:</b> максимум 3

⚠️ <b>Безопасность:</b>
• Не передавайте код третьим лицам
• Если вы не запрашивали код, проигнорируйте это сообщение

📱 <b>Время отправки:</b> ${new Date().toLocaleString('ru-RU')}
  `;

  return await sendTelegramMessage(message);
};

// Функция для проверки настроек Telegram
export const checkTelegramSettings = (): boolean => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('❌ Telegram не настроен');
    console.error('📖 Смотрите TELEGRAM_SETUP.md для инструкций');
    return false;
  }

  console.log('✅ Telegram настроен');
  return true;
}; 