# Проверка настройки Supabase

## Как работает авторизация

**Регистрация НЕ нужна!** Система работает так:

1. Пользователь открывает приложение в Telegram
2. Telegram автоматически передаёт `user.id` (уникальный ID пользователя)
3. Этот ID используется как ключ для хранения прогресса в Supabase
4. Один `user.id` = один прогресс на всех устройствах

## Пошаговая проверка настройки

### 1. Проверь, что SQL выполнен

1. Открой Supabase Dashboard → **Table Editor**
2. Должна быть таблица `user_progress`
3. Если таблицы нет → вернись в SQL Editor и выполни SQL из `supabase-setup.sql`

### 2. Проверь переменные окружения в Vercel

1. Открой Vercel Dashboard → твой проект → **Settings** → **Environment Variables**
2. Должны быть **4 переменные**:
   - `VITE_SUPABASE_URL` (для клиента)
   - `VITE_SUPABASE_ANON_KEY` (для клиента)
   - `SUPABASE_URL` (для serverless functions)
   - `SUPABASE_ANON_KEY` (для serverless functions)
3. Все должны быть для Production, Preview, Development

### 3. Проверь, что проект пересобран

1. Vercel Dashboard → **Deployments**
2. Последний деплой должен быть после добавления переменных
3. Если нет → нажми "Redeploy" на последнем деплое

### 4. Проверь логи API

1. Открой приложение в Telegram
2. Отметь несколько чекбоксов
3. Нажми "Отправить X%"
4. Vercel Dashboard → **Functions** → `/api/progress-supabase` → **Logs**
5. Должны быть сообщения:
   - `[API] POST /api/progress-supabase`
   - `[API] Progress saved to Supabase for userId: ...`

### 5. Проверь данные в Supabase

1. Supabase Dashboard → **Table Editor** → `user_progress`
2. Должна появиться запись с твоим `user_id`
3. В колонке `checked_items` должен быть JSON с прогрессом

## Если прогресс всё ещё разный

### Возможные причины:

1. **Переменные окружения не добавлены в Vercel**
   - Решение: добавь все 4 переменные (см. выше)

2. **Проект не пересобран после добавления переменных**
   - Решение: Vercel Dashboard → Deployments → Redeploy

3. **API использует старый endpoint**
   - Проверь логи: должны быть запросы к `/api/progress-supabase`, а не `/api/progress`

4. **Разные Telegram аккаунты**
   - Каждый Telegram аккаунт = свой прогресс
   - Убедись, что на обоих устройствах один и тот же Telegram аккаунт

5. **Supabase не настроен**
   - Проверь, что таблица создана и переменные окружения правильные

## Быстрая проверка

Выполни в консоли браузера (F12) на телефоне:
```javascript
console.log('Telegram user:', window.Telegram?.WebApp?.initDataUnsafe?.user);
```

Должен показать объект с `id`, `first_name` и т.д. Если `id` разный на разных устройствах → это разные аккаунты Telegram.

