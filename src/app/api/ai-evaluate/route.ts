import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';



// Инициализация OpenAI клиента
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionText, userAnswer, maxScore } = body;

    console.log('🤖 ИИ ОЦЕНКА - Начало обработки');
    console.log('📝 Вопрос:', questionText);
    console.log('💬 Ответ пользователя:', userAnswer);
    console.log('🎯 Максимальный балл:', maxScore);

    if (!questionText || !userAnswer || maxScore === undefined) {
      console.error('❌ Ошибка: отсутствуют обязательные параметры');
      return NextResponse.json(
        { error: 'Необходимы questionText, userAnswer и maxScore' },
        { status: 400 }
      );
    }

    // Оцениваем ответ через ИИ
    const aiResult = await evaluateWithAI(questionText, userAnswer, maxScore);

    console.log('✅ ИИ ОЦЕНКА - Результат:', {
      score: aiResult.score,
      feedback: aiResult.feedback
    });

    return NextResponse.json({
      score: aiResult.score,
      feedback: aiResult.feedback
    });

  } catch (error) {
    console.error('❌ Ошибка оценки ИИ:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Реальная оценка через ChatGPT API
async function evaluateWithAI(questionText: string, userAnswer: string, maxScore: number): Promise<{score: number, feedback: string}> {
  try {
    console.log('🔍 ИИ ОЦЕНКА - Проверка API ключа...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️ OPENAI_API_KEY не настроен, используем заглушку');
      const randomScore = Math.floor(Math.random() * (maxScore + 1));
      console.log('🎲 Заглушка - случайная оценка:', randomScore);
      return {
        score: randomScore,
        feedback: generateFallbackFeedback(randomScore, maxScore)
      };
    }

    console.log('✅ API ключ найден, отправляем запрос к ChatGPT...');

    // Промпт для оценки
    const scorePrompt = `Ты строгий эксперт для проверки тестов в сфере маломощного реактора.

Вот вопрос: ${questionText}
Вот ответ пользователя: ${userAnswer}

КРИТЕРИИ ОЦЕНКИ:
- 0 баллов: ответ неверный, не по теме или пустой
- 1-2 балла: очень слабый ответ, минимальное понимание
- 3-4 балла: слабый ответ, есть серьезные ошибки
- 5-6 баллов: удовлетворительный ответ, есть неточности
- 7-8 баллов: хороший ответ, основные моменты раскрыты
- 9-10 баллов: отличный ответ, полное понимание темы

Максимальный балл: ${maxScore}
Оцени строго и объективно. Дай только целое число от 0 до ${maxScore}.`;

    // Промпт для фидбека
    const feedbackPrompt = `Ты эксперт для проверки тестов в сфере маломощного реактора.

Вот вопрос: ${questionText}
Вот ответ пользователя: ${userAnswer}

Дай краткий, но полезный фидбек на русском языке. 
Оцени качество ответа, укажи на ошибки если есть, и дай рекомендации для улучшения.
Фидбек должен быть конструктивным и мотивирующим.`;

    // Получаем оценку
    const scoreCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ты строгий эксперт по оценке ответов на тесты. Твоя задача - дать только целое число от 0 до максимального балла. Будь объективным и не завышай оценки. Не добавляй никакого текста, только число."
        },
        {
          role: "user",
          content: scorePrompt
        }
      ],
      temperature: 0.1, // Уменьшаем temperature для более консистентных оценок
      max_tokens: 10,
    });

    // Получаем фидбек
    const feedbackCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ты эксперт по оценке ответов на тесты. Дай краткий, конструктивный фидбек на русском языке."
        },
        {
          role: "user",
          content: feedbackPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const scoreResponse = scoreCompletion.choices[0]?.message?.content?.trim();
    const feedbackResponse = feedbackCompletion.choices[0]?.message?.content?.trim();
    
    console.log('📊 ИИ ОЦЕНКА - Ответы от ChatGPT:');
    console.log('   Оценка (сырой ответ):', scoreResponse);
    console.log('   Фидбек (сырой ответ):', feedbackResponse);
    
    let score = 0;
    if (scoreResponse) {
      const parsedScore = parseInt(scoreResponse);
      console.log('   Парсинг оценки:', parsedScore, 'isNaN:', isNaN(parsedScore));
      if (!isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= maxScore) {
        score = parsedScore;
        console.log('   ✅ Оценка валидна:', score);
      } else {
        console.log('   ❌ Оценка невалидна, используем 0');
      }
    } else {
      console.log('   ❌ Пустой ответ от ИИ для оценки');
    }
    
    const feedback = feedbackResponse || generateFallbackFeedback(score, maxScore);
    console.log('   📝 Финальный фидбек:', feedback);
    
    console.log('🎯 ИИ ОЦЕНКА - Финальный результат:', { score, feedback });
    
    return { score, feedback };
    
  } catch (error) {
    console.error('❌ Ошибка при вызове OpenAI API:', error);
    console.log('🔄 Используем fallback из-за ошибки...');
    // В случае ошибки возвращаем случайную оценку и фидбек
    const randomScore = Math.floor(Math.random() * (maxScore + 1));
    console.log('🎲 Fallback - случайная оценка:', randomScore);
    return {
      score: randomScore,
      feedback: generateFallbackFeedback(randomScore, maxScore)
    };
  }
}

// Генерация fallback обратной связи на основе оценки
function generateFallbackFeedback(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) {
    return "Отличный ответ! Полностью раскрыта тема вопроса. Продолжайте в том же духе!";
  } else if (percentage >= 70) {
    return "Хороший ответ. Основные моменты освещены. Есть небольшие возможности для улучшения.";
  } else if (percentage >= 50) {
    return "Удовлетворительный ответ. Есть неточности, но общее понимание темы присутствует.";
  } else if (percentage >= 30) {
    return "Слабый ответ. Требует доработки. Рекомендуется повторить материал.";
  } else {
    return "Неудовлетворительный ответ. Не раскрыта тема. Необходимо изучить материал более внимательно.";
  }
} 