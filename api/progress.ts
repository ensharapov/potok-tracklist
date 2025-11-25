import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage (в production лучше использовать БД типа Supabase, PlanetScale и т.д.)
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

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!checkedItems || typeof checkedItems !== 'object') {
      return res.status(400).json({ error: 'checkedItems is required' });
    }

    progressStore.set(userId, checkedItems);
    return res.json({ success: true });
  }

  if (req.method === 'GET') {
    // Загрузка прогресса
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const checkedItems = progressStore.get(userId) || {};
    return res.json({ checkedItems });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

