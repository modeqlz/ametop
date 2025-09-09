'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AMEChatPage() {
  const [user, setUser] = useState<{ id: number; username?: string; first_name: string; last_name?: string; language_code?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Проверяем авторизацию
    const telegramUser = localStorage.getItem('telegram_user');
    if (!telegramUser) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(telegramUser));
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-telegram-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-telegram-bg flex flex-col">
      {/* Header */}
      <header className="bg-telegram-bg-secondary border-b border-telegram-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            href="/chats"
            className="text-telegram-accent hover:text-telegram-accent-dark transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 bg-telegram-bg-tertiary rounded-full flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <h1 className="text-telegram-text font-semibold">AME</h1>
              <p className="text-telegram-text-secondary text-sm">
                Системный бот
              </p>
            </div>
          </div>

          <button className="text-telegram-text-secondary hover:text-telegram-text transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="text-center max-w-md">
          {/* Bot Avatar */}
          <div className="w-24 h-24 bg-telegram-bg-secondary rounded-full flex items-center justify-center text-6xl mb-6 mx-auto">
            🤖
          </div>
          
          {/* Bot Name */}
          <h2 className="text-telegram-text text-2xl font-semibold mb-2">
            AME
          </h2>
          
          {/* Bot Description */}
          <p className="text-telegram-text-secondary text-lg mb-6">
            Системный бот-оповещатель
          </p>
          
          {/* Info Message */}
          <div className="bg-telegram-bg-secondary rounded-telegram p-4 mb-6">
            <p className="text-telegram-text-secondary text-center">
              Это системный бот, ответы недоступны
            </p>
          </div>
          
          {/* Features List */}
          <div className="text-left space-y-3">
            <div className="flex items-center space-x-3 text-telegram-text-secondary">
              <div className="w-2 h-2 bg-telegram-accent rounded-full flex-shrink-0"></div>
              <span>Уведомления о системных событиях</span>
            </div>
            <div className="flex items-center space-x-3 text-telegram-text-secondary">
              <div className="w-2 h-2 bg-telegram-accent rounded-full flex-shrink-0"></div>
              <span>Важные объявления</span>
            </div>
            <div className="flex items-center space-x-3 text-telegram-text-secondary">
              <div className="w-2 h-2 bg-telegram-accent rounded-full flex-shrink-0"></div>
              <span>Обновления приложения</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Input (Disabled) */}
      <div className="flex-shrink-0 border-t border-telegram-border bg-telegram-bg-secondary px-4 py-3">
        <div className="flex items-center space-x-3">
          <button 
            disabled
            className="text-telegram-text-hint cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              disabled
              placeholder="Сообщения недоступны..."
              className="w-full bg-telegram-bg border border-telegram-border rounded-telegram px-4 py-2 text-telegram-text-hint cursor-not-allowed"
            />
          </div>
          
          <button 
            disabled
            className="text-telegram-text-hint cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}