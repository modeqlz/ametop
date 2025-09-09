-- Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы чатов
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('system', 'private', 'group')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы сообщений
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы участников чатов
CREATE TABLE IF NOT EXISTS chat_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);

-- Включение Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для таблицы profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (telegram_id = (current_setting('app.current_telegram_id'))::BIGINT);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (telegram_id = (current_setting('app.current_telegram_id'))::BIGINT);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (telegram_id = (current_setting('app.current_telegram_id'))::BIGINT);

-- Политики безопасности для таблицы chats
CREATE POLICY "Users can view chats they are members of" ON chats
  FOR SELECT USING (
    id IN (
      SELECT chat_id FROM chat_members 
      WHERE user_id IN (
        SELECT id FROM profiles 
        WHERE telegram_id = (current_setting('app.current_telegram_id'))::BIGINT
      )
    )
  );

-- Политики безопасности для таблицы messages
CREATE POLICY "Users can view messages in chats they are members of" ON messages
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM chat_members 
      WHERE user_id IN (
        SELECT id FROM profiles 
        WHERE telegram_id = (current_setting('app.current_telegram_id'))::BIGINT
      )
    )
  );

CREATE POLICY "Users can insert messages in chats they are members of" ON messages
  FOR INSERT WITH CHECK (
    chat_id IN (
      SELECT chat_id FROM chat_members 
      WHERE user_id IN (
        SELECT id FROM profiles 
        WHERE telegram_id = (current_setting('app.current_telegram_id'))::BIGINT
      )
    )
  );

-- Политики безопасности для таблицы chat_members
CREATE POLICY "Users can view chat members for chats they are in" ON chat_members
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM chat_members 
      WHERE user_id IN (
        SELECT id FROM profiles 
        WHERE telegram_id = (current_setting('app.current_telegram_id'))::BIGINT
      )
    )
  );

-- Создание системного чата AME
INSERT INTO chats (id, name, type) 
VALUES ('00000000-0000-0000-0000-000000000001', 'AME', 'system')
ON CONFLICT DO NOTHING;

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();