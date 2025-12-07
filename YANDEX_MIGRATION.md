# Миграция на Яндекс.Облако

## ✅ Что можно заменить

### 1. Vercel → Yandex Cloud Functions + Object Storage

**Текущая инфраструктура:**
- Vercel Serverless Functions (`/api/*`)
- Vercel Static Hosting

**Замена на Яндекс:**
- **Yandex Cloud Functions** — для serverless API
- **Yandex Object Storage** — для статических файлов (React build)
- **Yandex Application Load Balancer** или **CloudFront** — для CDN и HTTPS

**Что нужно изменить:**
- Адаптировать `api/progress-supabase.ts` под формат Yandex Functions
- Настроить деплой статики в Object Storage
- Обновить переменные окружения

---

### 2. Supabase → Yandex Managed PostgreSQL

**Текущая инфраструктура:**
- Supabase PostgreSQL
- Supabase REST API

**Замена на Яндекс:**
- **Yandex Managed PostgreSQL** — полностью совместим с PostgreSQL
- Используем тот же `@supabase/supabase-js` или нативный `pg` драйвер

**Что нужно изменить:**
- Обновить строку подключения к БД
- Обновить переменные окружения (`SUPABASE_URL` → `YANDEX_PG_URL`)
- SQL схема (`supabase-setup.sql`) останется без изменений

**Альтернатива (если нужен NoSQL):**
- **Yandex Database (YDB)** — потребует переписывания логики работы с БД

---

### 3. GitHub → GitLab (Yandex Cloud) или Yandex Cloud Git

**Текущая инфраструктура:**
- GitHub для версионирования

**Замена на Яндекс:**
- **GitLab** (если доступен в Yandex Cloud)
- Или любой другой Git-хостинг

**Важно:** Работа в Cursor **НЕ ИЗМЕНИТСЯ** — это локальный редактор, который работает с файлами на вашем компьютере.

---

## ❌ Что нельзя заменить

### 1. Telegram WebApp SDK
- Это официальный SDK от Telegram
- Работает независимо от инфраструктуры
- Не требует изменений

### 2. React / Vite / TypeScript
- Это инструменты разработки
- Работают локально на вашем компьютере
- Не зависят от инфраструктуры деплоя

---

## 🔧 План миграции

### Шаг 1: Подготовка Yandex Cloud

1. Создать аккаунт в Yandex Cloud
2. Создать Managed PostgreSQL инстанс
3. Выполнить SQL из `supabase-setup.sql` в новой БД
4. Создать Object Storage bucket для статики
5. Создать Cloud Functions для API

### Шаг 2: Адаптация кода

#### 2.1. Адаптация API функций

**Текущий формат (Vercel):**
```typescript
// api/progress-supabase.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ...
}
```

**Новый формат (Yandex Functions):**
```typescript
// api/progress-supabase.ts
export const handler = async (event: any, context: any) => {
  const { httpMethod, body, queryStringParameters } = event;
  
  if (httpMethod === 'POST') {
    // Обработка POST
  }
  
  if (httpMethod === 'GET') {
    // Обработка GET
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ /* ... */ }),
  };
};
```

#### 2.2. Обновление переменных окружения

**Текущие:**
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

**Новые (Yandex):**
```
VITE_YANDEX_PG_URL=...
VITE_YANDEX_PG_KEY=...
YANDEX_PG_HOST=...
YANDEX_PG_PORT=...
YANDEX_PG_DATABASE=...
YANDEX_PG_USER=...
YANDEX_PG_PASSWORD=...
```

#### 2.3. Обновление клиента Supabase

**Текущий код:**
```typescript
// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

**Новый код (если используем нативный pg):**
```typescript
// client/src/lib/db.ts
// Или оставляем Supabase клиент, но подключаемся к Yandex PostgreSQL
// (Supabase JS клиент работает с любым PostgreSQL через REST API)
```

### Шаг 3: Деплой

#### 3.1. Статические файлы
```bash
# Сборка
pnpm build

# Загрузка в Object Storage
yc storage cp -r dist/public/* s3://your-bucket-name/
```

#### 3.2. Serverless Functions
```bash
# Упаковка функции
zip -r function.zip api/progress-supabase.ts node_modules/

# Деплой в Yandex Functions
yc serverless function create --name progress-api
yc serverless function version create \
  --function-name progress-api \
  --runtime nodejs18 \
  --entrypoint handler \
  --source-path function.zip
```

---

## 📝 Что НЕ изменится в работе

### ✅ Cursor (ваш редактор)
- **Полностью независим** от инфраструктуры деплоя
- Работает с локальными файлами на вашем компьютере
- Продолжит работать точно так же

### ✅ Локальная разработка
```bash
pnpm install
pnpm run dev
```
- Всё останется как есть

### ✅ Git workflow
- Коммиты, пуши, ветки — всё без изменений
- Только URL репозитория может измениться

---

## 🎯 Рекомендации

### Вариант 1: Полная миграция
- Заменить Vercel на Yandex Cloud Functions
- Заменить Supabase на Yandex Managed PostgreSQL
- **Плюсы:** Всё на одной платформе
- **Минусы:** Требует времени на адаптацию

### Вариант 2: Гибридный подход
- Оставить Supabase (он работает из любой точки мира)
- Заменить только Vercel на Yandex Cloud
- **Плюсы:** Меньше изменений в коде
- **Минусы:** Две платформы

### Вариант 3: Оставить как есть
- Vercel и Supabase работают стабильно
- Миграция нужна только если есть бизнес-требования
- **Плюсы:** Не нужно ничего менять
- **Минусы:** Зависимость от зарубежных сервисов

---

## 🔗 Полезные ссылки

- [Yandex Cloud Functions](https://cloud.yandex.ru/docs/functions/)
- [Yandex Managed PostgreSQL](https://cloud.yandex.ru/docs/managed-postgresql/)
- [Yandex Object Storage](https://cloud.yandex.ru/docs/storage/)
- [Yandex Application Load Balancer](https://cloud.yandex.ru/docs/application-load-balancer/)

---

## ❓ Вопросы?

Если решите мигрировать, я помогу:
1. Адаптировать код под Yandex Functions
2. Настроить подключение к Yandex PostgreSQL
3. Настроить деплой статики
4. Обновить переменные окружения

**Главное:** Работа в Cursor **НЕ ИЗМЕНИТСЯ** — мы продолжим работать точно так же! 🚀




