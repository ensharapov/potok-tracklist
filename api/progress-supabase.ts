import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Инициализация Supabase
// В serverless functions переменные без VITE_ префикса
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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
    const { userId, checkedItems, telegramUsername, telegramFirstName, telegramLastName } = req.body;

    console.log('[API] POST /api/progress-supabase', { userId, itemsCount: Object.keys(checkedItems || {}).length });

    if (!userId || typeof userId !== 'string') {
      console.error('[API] Missing userId');
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!checkedItems || typeof checkedItems !== 'object') {
      console.error('[API] Missing checkedItems');
      return res.status(400).json({ error: 'checkedItems is required' });
    }

    if (!supabase) {
      console.error('[API] Supabase not configured');
      return res.status(500).json({ error: 'Database not configured' });
    }

    try {
      // Используем upsert (обновить или создать)
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId, // Supabase автоматически конвертирует строку в BIGINT
          checked_items: checkedItems,
          telegram_username: telegramUsername || null,
          telegram_first_name: telegramFirstName || null,
          telegram_last_name: telegramLastName || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select();

      if (error) {
        console.error('[API] Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      console.log('[API] Progress saved to Supabase for userId:', userId);
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('[API] Error saving progress:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'GET') {
    // Загрузка прогресса
    const { userId } = req.query;

    console.log('[API] GET /api/progress-supabase', { userId });

    if (!userId || typeof userId !== 'string') {
      console.error('[API] Missing userId in query');
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!supabase) {
      console.error('[API] Supabase not configured');
      return res.status(500).json({ error: 'Database not configured' });
    }

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('checked_items')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Запись не найдена - возвращаем пустой объект
          console.log('[API] No progress found for userId:', userId);
          return res.json({ checkedItems: {} });
        }
        console.error('[API] Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      const checkedItems = data?.checked_items || {};
      console.log('[API] Progress loaded from Supabase for userId:', userId, 'items:', Object.keys(checkedItems).length);
      return res.json({ checkedItems });
    } catch (error: any) {
      console.error('[API] Error loading progress:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

