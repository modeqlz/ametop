'use client';

import { useEffect, useState } from 'react';
import { getTelegramWebAppInitData, initTelegramWebApp } from '@/lib/telegram';
import { useRouter } from 'next/navigation';

interface TelegramAuthProps {
  onAuthSuccess?: (user: any) => void;
}

export default function TelegramAuth({ onAuthSuccess }: TelegramAuthProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const authenticate = async () => {
      try {
        // Инициализируем Telegram WebApp
        const tg = initTelegramWebApp();
        
        if (!tg) {
          setError('Это приложение работает только в Telegram');
          setIsLoading(false);
          return;
        }

        // Получаем initData
        const initData = getTelegramWebAppInitData();
        
        if (!initData) {
          setError('Не удалось получить данные авторизации');
          setIsLoading(false);
          return;
        }

        // Отправляем данные на сервер для проверки
        const response = await fetch('/api/telegram/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Ошибка авторизации');
        }

        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('telegram_user', JSON.stringify(result.user));
        localStorage.setItem('user_profile', JSON.stringify(result.profile));

        // Вызываем callback если передан
        if (onAuthSuccess) {
          onAuthSuccess(result.user);
        }

        // Перенаправляем на страницу чатов
        router.push('/chats');
      } catch (err) {
        console.error('Auth error:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, [onAuthSuccess, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-telegram-accent mx-auto mb-4"></div>
          <p className="text-telegram-text">Авторизация...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center p-4">
        <div className="bg-telegram-bg-secondary rounded-telegram p-6 max-w-md w-full text-center">
          <div className="text-telegram-error text-4xl mb-4">⚠️</div>
          <h2 className="text-telegram-text text-xl font-semibold mb-2">
            Ошибка авторизации
          </h2>
          <p className="text-telegram-text-secondary mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-telegram-accent hover:bg-telegram-accent-dark text-white px-6 py-2 rounded-telegram transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return null;
}