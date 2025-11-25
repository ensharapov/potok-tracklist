import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

// Инициализация Upstash Redis (если переменные окружения настроены)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fallback in-memory storage для локальной разработки
const progressStore = new Map<string, Record<string, boolean>>();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers для работы из Telegram WebApp
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    // Сохранение прогресса
    const { userId, checkedItems } = req.body;

    console.log('[API] POST /api/progress', { userId, itemsCount: Object.keys(checkedItems || {}).length });

    if (!userId || typeof userId !== 'string') {
      console.error('[API] Missing userId');
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!checkedItems || typeof checkedItems !== 'object') {
      console.error('[API] Missing checkedItems');
      return res.status(400).json({ error: 'checkedItems is required' });
    }

    try {
      // Пытаемся использовать Upstash Redis (если настроен)
      if (redis) {
        try {
          await redis.set(`progress:${userId}`, checkedItems);
          console.log('[API] Progress saved to Redis for userId:', userId);
          return res.json({ success: true });
        } catch (redisError) {
          console.error('[API] Redis error, falling back to memory:', redisError);
        }
      }
      
      // Fallback на in-memory если Redis не настроен
      console.log('[API] Redis not available, using memory storage');
      progressStore.set(userId, checkedItems);
      console.log('[API] Progress saved to memory for userId:', userId);
      return res.json({ success: true });
    } catch (error) {
      console.error('[API] Error saving progress:', error);
      // Fallback на in-memory при ошибке
      progressStore.set(userId, checkedItems);
      return res.json({ success: true });
    }
  }

  if (req.method === 'GET') {
    // Загрузка прогресса
    const { userId } = req.query;

    console.log('[API] GET /api/progress', { userId });

    if (!userId || typeof userId !== 'string') {
      console.error('[API] Missing userId in query');
      return res.status(400).json({ error: 'userId is required' });
    }

    try {
      let checkedItems: Record<string, boolean> = {};
      
      // Пытаемся загрузить из Upstash Redis (если настроен)
      if (redis) {
        try {
          const redisData = await redis.get<Record<string, boolean>>(`progress:${userId}`);
          if (redisData) {
            checkedItems = redisData;
            console.log('[API] Progress loaded from Redis for userId:', userId, 'items:', Object.keys(checkedItems).length);
            return res.json({ checkedItems });
          }
        } catch (redisError) {
          console.error('[API] Redis error, falling back to memory:', redisError);
        }
      }
      
      // Fallback на in-memory если Redis не настроен или данных нет
      console.log('[API] Redis not available or no data, using memory storage');
      checkedItems = progressStore.get(userId) || {};
      console.log('[API] Progress loaded from memory for userId:', userId, 'items:', Object.keys(checkedItems).length);
      return res.json({ checkedItems });
    } catch (error) {
      console.error('[API] Error loading progress:', error);
      // Fallback на in-memory при ошибке
      const checkedItems = progressStore.get(userId as string) || {};
      return res.json({ checkedItems });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

