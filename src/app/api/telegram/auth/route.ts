// src/app/api/telegram/auth/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

type TgUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  language_code?: string;
  is_premium?: boolean;
};

// HMAC-проверка initData по официальной схеме
function verifyInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash') || '';
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secret = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  const a = Buffer.from(hmac, 'hex');
  const b = Buffer.from(hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    // DEV-байпас: записываем профиль в БД, чтобы dev-режим был полноценным
    if (process.env.DEV_BYPASS_AUTH === 'true') {
      const raw = process.env.DEV_TELEGRAM_USER_JSON || '{}';
      const mock = JSON.parse(raw) as Partial<TgUser>;

      if (!mock.id) {
        return NextResponse.json(
          { ok: false, error: 'DEV_TELEGRAM_USER_JSON must contain "id"' },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin.from('profiles').upsert({
        id: mock.id, // ВАЖНО: колонка id (bigint)
        username: mock.username ?? null,
        first_name: mock.first_name ?? null,
        last_name: mock.last_name ?? null,
        photo_url: mock.photo_url ?? null,
        language_code: mock.language_code ?? null,
        is_premium: !!mock.is_premium,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      return NextResponse.json({ ok: true, dev: true });
    }

    const body = (await req.json().catch(() => ({}))) as { initData?: string };
    const initData = body?.initData;
    if (!initData) {
      return NextResponse.json({ ok: false, error: 'initData is required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json(
        { ok: false, error: 'Server misconfigured: TELEGRAM_BOT_TOKEN is missing' },
        { status: 500 }
      );
    }

    // Проверяем подпись
    if (!verifyInitData(initData, botToken)) {
      return NextResponse.json({ ok: false, error: 'Invalid Telegram data' }, { status: 401 });
    }

    // Парсим поля из initData
    const p = new URLSearchParams(initData);
    const user = JSON.parse(p.get('user') || '{}') as TgUser;
    const authDateMs = Number(p.get('auth_date') || '0') * 1000;

    // Доп. проверка «свежести» (<= 1 часа)
    if (Date.now() - authDateMs > 60 * 60 * 1000) {
      return NextResponse.json({ ok: false, error: 'Auth data is too old' }, { status: 401 });
    }

    // Записываем/обновляем профиль (именно колонка id!)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: user.id, // ключ
          username: user.username ?? null,
          first_name: user.first_name ?? null,
          last_name: user.last_name ?? null,
          photo_url: user.photo_url ?? null,
          language_code: user.language_code ?? null,
          is_premium: !!user.is_premium,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, profile: data });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
