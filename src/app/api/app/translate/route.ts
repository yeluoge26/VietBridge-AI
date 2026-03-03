import { NextRequest, NextResponse } from 'next/server';
import { quotaMiddleware, getUserIdFromRequest } from '@/lib/quota-middleware';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function translateHandler(
  request: NextRequest,
  userId: string
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { text, targetLanguage = 'vi' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // 调用 OpenAI API 进行翻译
    const message = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `请将以下文本翻译成${targetLanguage === 'vi' ? '越南语' : '中文'}，只返回翻译结果，不要有其他说明：\n\n${text}`,
        },
      ],
    });

    const translatedText = message.choices[0].message.content || '';

    return NextResponse.json(
      {
        original: text,
        translated: translatedText,
        targetLanguage,
        userId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/app/translate
 * 翻译文本（支持配额检查）
 */
export async function POST(request: NextRequest) {
  return quotaMiddleware(request, translateHandler);
}
