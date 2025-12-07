import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Инициализация Supabase с Service Role Key
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Защита: проверка токена администратора (опционально)
  // Раскомментируй, если хочешь защитить endpoint
  /*
  const adminToken = req.headers.authorization?.replace('Bearer ', '');
  if (adminToken !== process.env.ADMIN_ANALYTICS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  */

  if (!supabase) {
    console.error('[Analytics] Supabase not configured');
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    // Получаем все данные о прогрессе
    const { data: allProgress, error } = await supabase
      .from('user_progress')
      .select('checked_items, user_id, telegram_username, telegram_first_name, updated_at, created_at');

    if (error) {
      console.error('[Analytics] Supabase error:', error);
      throw error;
    }

    if (!allProgress || allProgress.length === 0) {
      return res.json({
        totalUsers: 0,
        practiceStats: {},
        moduleStats: {},
        dropOffPoints: {},
        overallStats: {},
        message: 'No data available yet'
      });
    }

    // Анализируем данные
    const practiceStats: Record<string, number> = {};
    const moduleStats: Record<string, { users: Set<number | string>, practices: Set<string> }> = {};
    const dropOffPoints: Record<string, number> = {};
    const userLastPractice: Record<string, string> = {};

    // Обрабатываем каждый пользователя
    allProgress.forEach(progress => {
      const userId = progress.user_id;
      const checkedItems = progress.checked_items || {};
      let lastPractice = '';

      // Подсчитываем статистику по практикам
      Object.keys(checkedItems).forEach(practiceId => {
        if (checkedItems[practiceId] === true) {
          // Статистика по практикам
          practiceStats[practiceId] = (practiceStats[practiceId] || 0) + 1;

          // Определяем модуль
          let moduleName = 'other';
          if (practiceId.startsWith('setup_')) moduleName = 'setup';
          else if (practiceId.startsWith('prep_')) moduleName = 'prep';
          else if (practiceId.startsWith('mod1_') && !practiceId.startsWith('mod1_5_day_')) moduleName = 'module1';
          else if (practiceId.startsWith('mod1_5_day_')) moduleName = 'module1_diary';
          else if (practiceId.startsWith('mod2_')) moduleName = 'module2';
          else if (practiceId.startsWith('mod3_')) moduleName = 'module3';
          else if (practiceId.startsWith('mod4_')) moduleName = 'module4';
          else if (practiceId.startsWith('bonus1_')) moduleName = 'bonus1';
          else if (practiceId.startsWith('bonus2_')) moduleName = 'bonus2';
          else if (practiceId.startsWith('bonus3_')) moduleName = 'bonus3';
          else if (practiceId.startsWith('bonus4_')) moduleName = 'bonus4';

          // Статистика по модулям
          if (!moduleStats[moduleName]) {
            moduleStats[moduleName] = { users: new Set(), practices: new Set() };
          }
          moduleStats[moduleName].users.add(userId);
          moduleStats[moduleName].practices.add(practiceId);

          // Отслеживаем последнюю практику пользователя
          if (practiceId > lastPractice) {
            lastPractice = practiceId;
          }
        }
      });

      // Сохраняем последнюю практику пользователя
      if (lastPractice) {
        userLastPractice[userId] = lastPractice;
        dropOffPoints[lastPractice] = (dropOffPoints[lastPractice] || 0) + 1;
      }
    });

    // Подсчитываем общую статистику
    const totalUsers = allProgress.length;
    const userPracticeCounts = allProgress.map(p => {
      const items = p.checked_items || {};
      return Object.keys(items).filter(k => items[k] === true).length;
    });

    const overallStats = {
      totalUsers,
      avgPracticesPerUser: userPracticeCounts.length > 0
        ? Math.round((userPracticeCounts.reduce((a, b) => a + b, 0) / userPracticeCounts.length) * 100) / 100
        : 0,
      maxPracticesCompleted: Math.max(...userPracticeCounts, 0),
      minPracticesCompleted: Math.min(...userPracticeCounts, 0),
      usersWith50Plus: userPracticeCounts.filter(c => c >= 50).length,
      usersWith70Plus: userPracticeCounts.filter(c => c >= 70).length,
    };

    // Преобразуем Sets в числа для JSON
    const moduleStatsFormatted: Record<string, { users: number, practices: number, percentage: number }> = {};
    Object.keys(moduleStats).forEach(moduleName => {
      const stats = moduleStats[moduleName];
      moduleStatsFormatted[moduleName] = {
        users: stats.users.size,
        practices: stats.practices.size,
        percentage: totalUsers > 0 ? Math.round((stats.users.size / totalUsers) * 10000) / 100 : 0
      };
    });

    // Сортируем практики по популярности
    const practiceStatsSorted = Object.entries(practiceStats)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [key, value]) => {
        acc[key] = {
          completed: value,
          percentage: totalUsers > 0 ? Math.round((value / totalUsers) * 10000) / 100 : 0
        };
        return acc;
      }, {} as Record<string, { completed: number, percentage: number }>);

    // Сортируем точки отсева
    const dropOffPointsSorted = Object.entries(dropOffPoints)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .reduce((acc, [key, value]) => {
        acc[key] = {
          usersStopped: value,
          percentage: totalUsers > 0 ? Math.round((value / totalUsers) * 10000) / 100 : 0
        };
        return acc;
      }, {} as Record<string, { usersStopped: number, percentage: number }>);

    return res.json({
      totalUsers,
      practiceStats: practiceStatsSorted,
      moduleStats: moduleStatsFormatted,
      dropOffPoints: dropOffPointsSorted,
      overallStats,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Analytics] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

