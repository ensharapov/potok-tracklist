-- SQL для создания таблицы прогресса в Supabase
-- Выполни этот SQL в Supabase Dashboard → SQL Editor

-- Удаляем существующие объекты (если есть) для чистого старта
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
DROP FUNCTION IF EXISTS update_updated_at_column();

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
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - отключаем для начала, чтобы всё работало
-- ⚠️ ВАЖНО: После первоначальной настройки ВКЛЮЧИ RLS для безопасности!
-- Выполни скрипт supabase-enable-rls.sql для включения RLS
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- ⚠️ БЕЗОПАСНОСТЬ: После выполнения этого скрипта выполни supabase-enable-rls.sql
-- Это включит RLS и защитит данные от несанкционированного доступа

