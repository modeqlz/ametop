import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    photo_url?: string;
  };
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

/**
 * Проверяет HMAC подпись Telegram WebApp initData
 */
export function verifyTelegramWebAppData(
  initData: string,
  botToken: string
): { isValid: boolean; data?: TelegramWebAppInitData } {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return { isValid: false };
    }

    // Удаляем hash из параметров для проверки
    urlParams.delete('hash');
    
    // Сортируем параметры по ключу
    const sortedParams = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем HMAC
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');

    const isValid = calculatedHash === hash;

    if (isValid) {
      // Парсим данные пользователя
      const userData = urlParams.get('user');
      const authDate = parseInt(urlParams.get('auth_date') || '0');
      
      let user: TelegramUser | undefined;
      if (userData) {
        user = JSON.parse(decodeURIComponent(userData));
      }

      return {
        isValid: true,
        data: {
          query_id: urlParams.get('query_id') || undefined,
          user,
          auth_date,
          hash,
        },
      };
    }

    return { isValid: false };
  } catch (error) {
    console.error('Error verifying Telegram WebApp data:', error);
    return { isValid: false };
  }
}

/**
 * Получает initData из Telegram WebApp
 */
export function getTelegramWebAppInitData(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Проверяем, доступен ли Telegram WebApp
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return null;
  
  return tg.initData || null;
}

/**
 * Инициализирует Telegram WebApp
 */
export function initTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return null;
  
  // Расширяем WebApp на весь экран
  tg.expand();
  
  // Включаем главную кнопку
  tg.MainButton.show();
  
  // Устанавливаем тему
  tg.setHeaderColor('#212121');
  tg.setBackgroundColor('#212121');
  
  return tg;
}