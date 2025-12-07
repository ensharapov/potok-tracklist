import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Инициализация Supabase
// В serverless functions переменные без VITE_ префикса
// Используем Service Role Key для обхода RLS (более безопасно)
// Если Service Role Key не настроен, используем ANON_KEY как fallback
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

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
    const { userId, checkedItems, appMode, telegramUsername, telegramFirstName, telegramLastName } = req.body;

    console.log('[API] POST /api/progress-supabase', { userId, itemsCount: Object.keys(checkedItems || {}).length, appMode });

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
      // Сохраняем appMode в метаданных checkedItems или в отдельном поле
      const updateData: any = {
        user_id: userId, // Supabase автоматически конвертирует строку в BIGINT
        checked_items: checkedItems,
        telegram_username: telegramUsername || null,
        telegram_first_name: telegramFirstName || null,
        telegram_last_name: telegramLastName || null,
        updated_at: new Date().toISOString(),
      };
      
      // Если есть appMode, сохраняем его в метаданных (можно добавить отдельное поле позже)
      if (appMode) {
        // Сохраняем в checkedItems как метаданные
        updateData.checked_items = {
          ...checkedItems,
          _meta: {
            ...(checkedItems._meta || {}),
            appMode,
          },
        };
      }
      
      const { data, error } = await supabase
        .from('user_progress')
        .upsert(updateData, {
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
          return res.json({ checkedItems: {}, appMode: null });
        }
        console.error('[API] Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      const checkedItems = data?.checked_items || {};
      // Извлекаем appMode из метаданных
      const appMode = checkedItems._meta?.appMode || null;
      // Убираем метаданные из checkedItems перед возвратом (чтобы не мешали в логике)
      const cleanCheckedItems = { ...checkedItems };
      if (cleanCheckedItems._meta) {
        delete cleanCheckedItems._meta;
      }
      
      console.log('[API] Progress loaded from Supabase for userId:', userId, 'items:', Object.keys(cleanCheckedItems).length, 'appMode:', appMode);
      return res.json({ checkedItems: cleanCheckedItems, appMode });
    } catch (error: any) {
      console.error('[API] Error loading progress:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

