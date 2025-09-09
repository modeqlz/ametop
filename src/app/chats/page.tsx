'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Chat {
  id: string;
  name: string;
  type: 'system' | 'private' | 'group';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  avatar?: string;
}

export default function ChatsPage() {
  const [user, setUser] = useState<any>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Проверяем авторизацию
    const telegramUser = localStorage.getItem('telegram_user');
    if (!telegramUser) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(telegramUser));

    // Инициализируем чаты с системным чатом AME
    const systemChats: Chat[] = [
      {
        id: 'ame',
        name: 'AME',
        type: 'system',
        lastMessage: 'Добро пожаловать в AME!',
        lastMessageTime: new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        unreadCount: 0,
        avatar: '🤖',
      },
    ];

    setChats(systemChats);
  }, [router]);

  const formatTime = (time: string) => {
    return time;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-telegram-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-telegram-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-telegram-bg">
      {/* Header */}
      <header className="bg-telegram-bg-secondary border-b border-telegram-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-telegram-text text-xl font-semibold">Чаты</h1>
          <div className="flex items-center space-x-3">
            <button className="text-telegram-text-secondary hover:text-telegram-text transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-telegram-text-secondary hover:text-telegram-text transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* User Info */}
      <div className="bg-telegram-bg-secondary border-b border-telegram-border px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-telegram-accent rounded-full flex items-center justify-center text-white font-semibold">
            {user.first_name?.[0] || '?'}
          </div>
          <div>
            <p className="text-telegram-text font-medium">
              {user.first_name} {user.last_name}
            </p>
            {user.username && (
              <p className="text-telegram-text-secondary text-sm">@{user.username}</p>
            )}
          </div>
        </div>
      </div>

      {/* Chats List */}
      <div className="divide-y divide-telegram-border">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/chats/${chat.id}`}
            className="block hover:bg-telegram-bg-secondary transition-colors"
          >
            <div className="px-4 py-3 flex items-center space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {chat.avatar ? (
                  <div className="w-12 h-12 bg-telegram-bg-tertiary rounded-full flex items-center justify-center text-2xl">
                    {chat.avatar}
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-telegram-accent rounded-full flex items-center justify-center text-white font-semibold">
                    {chat.name[0]}
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-telegram-text font-medium truncate">
                    {chat.name}
                    {chat.type === 'system' && (
                      <span className="ml-2 text-xs bg-telegram-accent text-white px-2 py-0.5 rounded-full">
                        Система
                      </span>
                    )}
                  </h3>
                  {chat.lastMessageTime && (
                    <span className="text-telegram-text-hint text-sm flex-shrink-0">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-telegram-text-secondary text-sm truncate">
                    {chat.lastMessage || 'Нет сообщений'}
                  </p>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <span className="bg-telegram-accent text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {chats.length === 1 && (
        <div className="px-4 py-8 text-center">
          <div className="text-telegram-text-secondary text-lg mb-2">💬</div>
          <p className="text-telegram-text-secondary">
            У вас пока нет других чатов
          </p>
          <p className="text-telegram-text-hint text-sm mt-1">
            Начните общение, чтобы увидеть чаты здесь
          </p>
        </div>
      )}
    </div>
  );
}