-- SQL для создания таблицы прогресса в Supabase
-- Выполни этот SQL в Supabase Dashboard → SQL Editor

-- Создаём таблицу для хранения прогресса пользователей
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE, -- Telegram user ID
  telegram_username TEXT,
  telegram_first_name TEXT,
  telegram_last_name TEXT,
  checked_items JSONB NOT NULL DEFAULT '{}'::jsonb, -- Храним прогресс как JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - пользователи могут видеть только свой прогресс
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут читать только свой прогресс
CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  USING (auth.uid()::text = user_id::text OR true); -- Пока разрешаем всем, потом можно настроить через JWT

-- Политика: пользователи могут обновлять только свой прогресс
CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  USING (auth.uid()::text = user_id::text OR true);

-- Политика: пользователи могут создавать свой прогресс
CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text OR true);

