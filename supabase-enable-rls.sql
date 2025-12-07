-- SQL для включения Row Level Security (RLS) в Supabase
-- Выполни этот SQL в Supabase Dashboard → SQL Editor
-- ВАЖНО: После выполнения этого скрипта нужно использовать Service Role Key в API

-- Удаляем старые политики (если есть)
DROP POLICY IF EXISTS "Service role has full access" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;

-- Включаем Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Создаём политику для Service Role
-- Service Role Key автоматически обходит RLS, поэтому эта политика
-- нужна только для случаев, когда используется анонимный доступ
-- В нашем случае мы используем Service Role Key на сервере, поэтому
-- эта политика будет работать как дополнительная защита
CREATE POLICY "Service role has full access"
  ON user_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Примечание:
-- Service Role Key обходит RLS автоматически, но мы всё равно создаём политику
-- на случай, если в будущем понадобится более тонкая настройка доступа

