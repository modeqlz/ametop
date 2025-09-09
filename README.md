# AME - Telegram Mini App

Telegram Mini App с функциональностью чатов, построенное на Next.js 14 с TypeScript, Tailwind CSS и Supabase.

## 🚀 Технологии

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (тёмная тема в стиле Telegram)
- **Supabase** (PostgreSQL + Row Level Security)
- **Telegram WebApp API** для авторизации
- **ESLint + Prettier**

## 📋 Функциональность

- ✅ Авторизация через Telegram WebApp (без OAuth)
- ✅ HMAC-проверка данных Telegram
- ✅ Главная страница чатов с системным чатом "AME"
- ✅ Placeholder диалог для системного бота
- ✅ Тёмная тема в стиле Telegram
- ✅ Адаптивный дизайн для мобильных устройств

## 🛠 Установка и настройка

### 1. Клонирование и установка зависимостей

```bash
# Установка зависимостей
npm install
# или
pnpm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` и заполните следующие переменные:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Next.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Настройка Supabase

1. Создайте новый проект в [Supabase](https://supabase.com)
2. Выполните SQL-скрипт из файла `supabase-schema.sql` в SQL Editor
3. Скопируйте URL проекта и ключи API в `.env.local`

### 4. Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен бота и добавьте его в `.env.local`
3. Настройте Mini App в настройках бота:
   ```
   /newapp
   /setmenubutton
   ```
4. Укажите URL вашего приложения (для разработки: `https://your-ngrok-url.ngrok.io`)

## 🚀 Запуск

### Режим разработки

```bash
npm run dev
# или
pnpm dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

### Для тестирования в Telegram

Используйте [ngrok](https://ngrok.com/) для создания публичного URL:

```bash
# Установите ngrok
npm install -g ngrok

# Запустите туннель
ngrok http 3000
```

Используйте HTTPS URL от ngrok в настройках Telegram Bot.

### Продакшн

```bash
npm run build
npm start
```

## 🚀 Production Deployment Checklist

### 1. Настройка переменных окружения в Vercel

**Обязательные переменные:**
- `TELEGRAM_BOT_TOKEN` - Production токен бота (получить у @BotFather)
- `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` - Имя бота **без символа @** (например: `AME1MARKETBOT`)
- `NEXT_PUBLIC_SUPABASE_URL` - URL вашего Supabase проекта
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role ключ из Supabase

**Опциональные переменные для отладки:**
- `DEBUG_TG=true` - Включает отладочные логи с префиксом `[TGDEBUG]`

### 2. Redeploy приложения

После настройки переменных окружения выполните redeploy в Vercel.

### 3. Настройка Telegram бота

1. Откройте чат с @BotFather
2. Выполните команду `/setmenubutton`
3. Выберите вашего бота
4. Выберите "Web App"
5. Введите URL вашего приложения: `https://<your-app>.vercel.app/`

### 4. Тестирование

**ВАЖНО:** Открывайте Mini App **только из вашего бота**, а не из браузера!

1. Найдите вашего бота в Telegram
2. Нажмите кнопку Menu или отправьте команду
3. Выберите Web App
4. Проверьте авторизацию и функциональность

## 🐛 Отладка

### Включение DEBUG_TG

Для включения отладочных логов:

1. Установите переменную окружения `DEBUG_TG=true`
2. Redeploy приложение
3. Логи с префиксом `[TGDEBUG]` будут доступны в:
   - **Vercel**: Functions → View Function Logs
   - **Локально**: В консоли терминала где запущен `npm run dev`

### Что показывают [TGDEBUG] логи

- `tokenFp` - Первые 8 символов SHA256 хеша токена бота (для проверки правильности токена)
- `len` - Длина initData
- `calc` - Вычисленный HMAC
- `hashFromTG` - HMAC от Telegram
- `dataCheckString` - Строка для проверки подписи

## 📁 Структура проекта

```
src/
├── app/
│   ├── api/telegram/auth/     # API для авторизации Telegram
│   ├── chats/                 # Страницы чатов
│   │   ├── ame/              # Системный чат AME
│   │   └── page.tsx          # Список чатов
│   ├── globals.css           # Глобальные стили
│   ├── layout.tsx            # Корневой layout
│   └── page.tsx              # Главная страница (авторизация)
├── components/
│   └── TelegramAuth.tsx      # Компонент авторизации
└── lib/
    ├── supabase.ts           # Клиент Supabase
    └── telegram.ts           # Утилиты для работы с Telegram
```

## 🔐 Безопасность

- **HMAC-проверка**: Все данные от Telegram проверяются с помощью HMAC
- **Row Level Security**: Настроена в Supabase для защиты данных
- **Валидация времени**: Проверка актуальности данных авторизации
- **Типизация**: Полная типизация TypeScript для предотвращения ошибок

## 🎨 Дизайн

Приложение использует тёмную тему в стиле Telegram с:
- Цветовой палитрой Telegram
- Адаптивным дизайном
- Плавными анимациями
- Кастомными скроллбарами

## 📱 Использование

1. Откройте Mini App через бота в Telegram
2. Приложение автоматически авторизует пользователя
3. Перенаправление на страницу чатов
4. Системный чат "AME" всегда доступен
5. Клик по чату "AME" открывает placeholder диалог

## 🛠 Разработка

### Линтинг и форматирование

```bash
# Проверка ESLint
npm run lint

# Форматирование Prettier
npm run format
```

### Добавление новых функций

1. Создайте новые компоненты в `src/components/`
2. Добавьте API routes в `src/app/api/`
3. Обновите схему базы данных в `supabase-schema.sql`
4. Добавьте типы в `src/lib/supabase.ts`

## 📄 Лицензия

MIT License

## 🤝 Поддержка

Если у вас есть вопросы или проблемы, создайте issue в репозитории.
