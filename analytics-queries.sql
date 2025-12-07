-- SQL запросы для аналитики прогресса пользователей в Supabase
-- Выполняй эти запросы в Supabase Dashboard → SQL Editor

-- ============================================
-- 1. СТАТИСТИКА ПО ПРАКТИКАМ
-- Какие практики проходят чаще всего
-- ============================================
WITH practice_completions AS (
  SELECT 
    user_id,
    jsonb_object_keys(checked_items) as practice_id
  FROM user_progress
  WHERE checked_items->jsonb_object_keys(checked_items)::text = 'true'
)
SELECT 
  practice_id,
  COUNT(*) as completed_count,
  (SELECT COUNT(*) FROM user_progress) as total_users,
  ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM user_progress), 0), 2) as completion_percentage
FROM practice_completions
GROUP BY practice_id
ORDER BY completed_count DESC;

-- ============================================
-- 2. ТОЧКИ ОТСЕВА - до каких практик не доходят
-- Находим последнюю выполненную практику для каждого пользователя
-- ============================================
WITH user_last_practice AS (
  SELECT 
    user_id,
    MAX(practice_id) as last_practice_id
  FROM (
    SELECT 
      user_id,
      jsonb_object_keys(checked_items) as practice_id
    FROM user_progress
    WHERE checked_items->jsonb_object_keys(checked_items)::text = 'true'
  ) as practices
  GROUP BY user_id
)
SELECT 
  last_practice_id,
  COUNT(*) as users_stopped_here,
  ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM user_last_practice), 0), 2) as percentage
FROM user_last_practice
GROUP BY last_practice_id
ORDER BY users_stopped_here DESC
LIMIT 20;

-- ============================================
-- 3. ПРОГРЕСС ПО МОДУЛЯМ
-- Статистика завершения по модулям
-- ============================================
WITH module_practices AS (
  SELECT 
    user_id,
    CASE 
      WHEN practice_id LIKE 'setup_%' THEN 'setup'
      WHEN practice_id LIKE 'prep_%' THEN 'prep'
      WHEN practice_id LIKE 'mod1_%' AND practice_id NOT LIKE 'mod1_5_day_%' THEN 'module1'
      WHEN practice_id LIKE 'mod1_5_day_%' THEN 'module1_diary'
      WHEN practice_id LIKE 'mod2_%' THEN 'module2'
      WHEN practice_id LIKE 'mod3_%' THEN 'module3'
      WHEN practice_id LIKE 'mod4_%' THEN 'module4'
      WHEN practice_id LIKE 'bonus1_%' THEN 'bonus1'
      WHEN practice_id LIKE 'bonus2_%' THEN 'bonus2'
      WHEN practice_id LIKE 'bonus3_%' THEN 'bonus3'
      WHEN practice_id LIKE 'bonus4_%' THEN 'bonus4'
      ELSE 'other'
    END as module_name,
    practice_id
  FROM (
    SELECT 
      user_id,
      jsonb_object_keys(checked_items) as practice_id
    FROM user_progress
    WHERE checked_items->jsonb_object_keys(checked_items)::text = 'true'
  ) as practices
)
SELECT 
  module_name,
  COUNT(DISTINCT user_id) as users_with_progress,
  COUNT(DISTINCT practice_id) as unique_practices_completed,
  (SELECT COUNT(*) FROM user_progress) as total_users,
  ROUND(COUNT(DISTINCT user_id) * 100.0 / NULLIF((SELECT COUNT(*) FROM user_progress), 0), 2) as user_percentage
FROM module_practices
WHERE module_name != 'other'
GROUP BY module_name
ORDER BY 
  CASE module_name
    WHEN 'setup' THEN 1
    WHEN 'prep' THEN 2
    WHEN 'module1' THEN 3
    WHEN 'module1_diary' THEN 4
    WHEN 'module2' THEN 5
    WHEN 'module3' THEN 6
    WHEN 'module4' THEN 7
    WHEN 'bonus1' THEN 8
    WHEN 'bonus2' THEN 9
    WHEN 'bonus3' THEN 10
    WHEN 'bonus4' THEN 11
    ELSE 99
  END;

-- ============================================
-- 4. ОБЩАЯ СТАТИСТИКА
-- Сколько пользователей завершили весь поток
-- ============================================
WITH user_stats AS (
  SELECT 
    user_id,
    jsonb_object_keys(checked_items) as practice_id
  FROM user_progress
  WHERE checked_items->jsonb_object_keys(checked_items)::text = 'true'
),
practice_counts AS (
  SELECT 
    user_id,
    COUNT(*) as practices_completed
  FROM user_stats
  GROUP BY user_id
)
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN practices_completed >= 50 THEN 1 END) as users_with_50_plus_practices,
  COUNT(CASE WHEN practices_completed >= 70 THEN 1 END) as users_with_70_plus_practices,
  ROUND(AVG(practices_completed), 2) as avg_practices_per_user,
  MAX(practices_completed) as max_practices_completed,
  MIN(practices_completed) as min_practices_completed,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY practices_completed) as median_practices
FROM practice_counts;

-- ============================================
-- 5. ПРАКТИКИ С НИЗКИМ ПРОХОЖДЕНИЕМ
-- Практики, которые проходят менее 30% пользователей
-- ============================================
WITH practice_stats AS (
  SELECT 
    practice_id,
    COUNT(*) as completed_count,
    ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM user_progress), 0), 2) as completion_percentage
  FROM (
    SELECT 
      user_id,
      jsonb_object_keys(checked_items) as practice_id
    FROM user_progress
    WHERE checked_items->jsonb_object_keys(checked_items)::text = 'true'
  ) as practices
  GROUP BY practice_id
)
SELECT 
  practice_id,
  completed_count,
  completion_percentage
FROM practice_stats
WHERE completion_percentage < 30
ORDER BY completion_percentage ASC;

-- ============================================
-- 6. ВРЕМЕННАЯ АНАЛИТИКА
-- Активность пользователей по времени
-- ============================================
SELECT 
  DATE_TRUNC('day', updated_at) as date,
  COUNT(*) as updates_count,
  COUNT(DISTINCT user_id) as unique_active_users
FROM user_progress
WHERE updated_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', updated_at)
ORDER BY date DESC;

-- ============================================
-- 7. СТАТИСТИКА ПО ДНЕВНИКУ 21 ДЕНЬ
-- Сколько пользователей прошли дневник полностью
-- ============================================
WITH diary_days AS (
  SELECT 
    user_id,
    COUNT(*) as days_completed
  FROM (
    SELECT 
      user_id,
      jsonb_object_keys(checked_items) as practice_id
    FROM user_progress
    WHERE checked_items->jsonb_object_keys(checked_items)::text = 'true'
      AND practice_id LIKE 'mod1_5_day_%'
  ) as diary
  GROUP BY user_id
)
SELECT 
  COUNT(*) as total_users_with_diary,
  COUNT(CASE WHEN days_completed = 21 THEN 1 END) as users_completed_full_diary,
  COUNT(CASE WHEN days_completed >= 14 THEN 1 END) as users_completed_14_plus_days,
  COUNT(CASE WHEN days_completed >= 7 THEN 1 END) as users_completed_7_plus_days,
  ROUND(AVG(days_completed), 2) as avg_days_completed,
  ROUND(COUNT(CASE WHEN days_completed = 21 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as full_completion_percentage
FROM diary_days;

-- ============================================
-- 8. РАСПРЕДЕЛЕНИЕ ПО УРОВНЯМ ПРОГРЕССА
-- Сколько пользователей на каждом уровне
-- ============================================
WITH user_progress_levels AS (
  SELECT 
    user_id,
    COUNT(*) as practices_completed,
    CASE 
      WHEN COUNT(*) >= 70 THEN 'Завершили поток (70+)'
      WHEN COUNT(*) >= 50 THEN 'Почти завершили (50-69)'
      WHEN COUNT(*) >= 30 THEN 'Хороший прогресс (30-49)'
      WHEN COUNT(*) >= 15 THEN 'Средний прогресс (15-29)'
      WHEN COUNT(*) >= 5 THEN 'Начали (5-14)'
      ELSE 'Только начали (0-4)'
    END as progress_level
  FROM (
    SELECT 
      user_id,
      jsonb_object_keys(checked_items) as practice_id
    FROM user_progress
    WHERE checked_items->jsonb_object_keys(checked_items)::text = 'true'
  ) as practices
  GROUP BY user_id
)
SELECT 
  progress_level,
  COUNT(*) as users_count,
  ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM user_progress_levels), 0), 2) as percentage
FROM user_progress_levels
GROUP BY progress_level
ORDER BY 
  CASE progress_level
    WHEN 'Завершили поток (70+)' THEN 1
    WHEN 'Почти завершили (50-69)' THEN 2
    WHEN 'Хороший прогресс (30-49)' THEN 3
    WHEN 'Средний прогресс (15-29)' THEN 4
    WHEN 'Начали (5-14)' THEN 5
    WHEN 'Только начали (0-4)' THEN 6
  END;

