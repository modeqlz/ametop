import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramWebAppData } from '@/lib/telegram';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    // Dev режим - обход авторизации
    if (process.env.DEV_BYPASS_AUTH === 'true') {
      const devUserJson = process.env.DEV_TELEGRAM_USER_JSON;
      if (devUserJson) {
        const devUser = JSON.parse(devUserJson);
        return NextResponse.json({
          success: true,
          user: {
            id: devUser.id,
            telegram_id: devUser.id,
            username: devUser.username,
            first_name: devUser.first_name,
            last_name: devUser.last_name || null,
            language_code: devUser.language_code || 'en',
            photo_url: devUser.photo_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
      }
    }

    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { error: 'initData is required' },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Проверяем HMAC подпись
    const verification = verifyTelegramWebAppData(initData, botToken);
    
    if (!verification.isValid || !verification.data?.user) {
      return NextResponse.json(
        { error: 'Invalid Telegram data' },
        { status: 401 }
      );
    }

    const { user } = verification.data;

    // Проверяем, что данные не слишком старые (максимум 1 час)
    const authDate = verification.data.auth_date * 1000; // конвертируем в миллисекунды
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 час

    if (now - authDate > maxAge) {
      return NextResponse.json(
        { error: 'Auth data is too old' },
        { status: 401 }
      );
    }

    // Создаем или обновляем профиль пользователя в Supabase
    const { data: profile, error } = await supabaseServer
      .from('profiles')
      .upsert(
        {
          telegram_id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          photo_url: user.photo_url,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'telegram_id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Возвращаем успешный ответ с профилем пользователя
    return NextResponse.json({
      success: true,
      profile,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.photo_url,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}