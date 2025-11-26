# Настройка Supabase для личных кабинетов

## Шаг 1: Создай проект в Supabase

1. Открой https://supabase.com
2. Нажми "Start your project" → "New Project"
3. Заполни:
   - **Name**: `potok-tracklist` (или любое другое)
   - **Database Password**: придумай надёжный пароль (сохрани его!)
   - **Region**: выбери ближайший к твоим пользователям
4. Нажми "Create new project"
5. Подожди 2-3 минуты, пока проект создаётся

## Шаг 2: Создай таблицу

1. В Supabase Dashboard перейди в **SQL Editor**
2. Скопируй содержимое файла `supabase-setup.sql`
3. Вставь в SQL Editor
4. Нажми "Run" (или F5)
5. Должно появиться сообщение "Success. No rows returned"

## Шаг 3: Получи API ключи

1. В Supabase Dashboard перейди в **Settings** → **API**
2. Скопируй:
   - **Project URL** (это `VITE_SUPABASE_URL`)
   - **anon public** ключ (это `VITE_SUPABASE_ANON_KEY`)

## Шаг 4: Добавь переменные окружения в Vercel

1. Открой Vercel Dashboard → твой проект → **Settings** → **Environment Variables**
2. Добавь две переменные:
   - **Name**: `VITE_SUPABASE_URL`
     **Value**: твой Project URL из Supabase
     **Environments**: Production, Preview, Development (все три)
   
   - **Name**: `VITE_SUPABASE_ANON_KEY`
     **Value**: твой anon public ключ из Supabase
     **Environments**: Production, Preview, Development (все три)

3. Нажми "Save"

## Шаг 5: Передеплой проект

```bash
git add .
git commit -m "Добавлена поддержка Supabase для личных кабинетов"
git push
```

После деплоя синхронизация заработает автоматически!

## Проверка работы

1. Открой приложение в Telegram
2. Отметь несколько чекбоксов
3. Нажми "Отправить X%"
4. Открой приложение на другом устройстве
5. Прогресс должен синхронизироваться!

## Важно

- Supabase бесплатный тариф даёт 500MB базы данных и 2GB трафика в месяц
- Этого хватит на тысячи пользователей
- Если нужно больше - можно перейти на платный тариф ($25/месяц)

