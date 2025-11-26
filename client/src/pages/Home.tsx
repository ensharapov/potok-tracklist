import { useState, useEffect, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface Practice {
  id: string;
  name: string;
  link: string;
  module: string;
  isBonus?: boolean;
}

const practices: Practice[] = [
  // НАСТРОЙКА НА РАБОТУ В ПОТОКЕ
  { id: 'setup_1', name: 'Повесть-притча "Чайка по имени Джонатан Ливингстон"', link: 'https://t.me/c/2429484344/208', module: 'setup' },
  { id: 'setup_2', name: 'Видео-квест: Зачем вам нужен бадди', link: 'https://t.me/c/2429484344/209', module: 'setup' },
  { id: 'setup_3', name: 'Универсальная практика перед началом "Потока"', link: 'https://t.me/c/2429484344/210', module: 'setup' },
  
  // ПРЕДВАРИТЕЛЬНОЕ ЗАДАНИЕ
  { id: 'prep_1', name: 'Бадди + Анкета', link: 'https://t.me/c/2429484344/211', module: 'prep' },
  { id: 'prep_2', name: 'Мотивационный лист', link: 'https://t.me/c/2429484344/212', module: 'prep' },
  
  // МОДУЛЬ I
  { id: 'mod1_1', name: 'Посрать мозгом', link: 'https://t.me/c/2429484344/214', module: 'module1' },
  { id: 'mod1_2', name: 'Антилось', link: 'https://t.me/c/2429484344/215', module: 'module1' },
  { id: 'mod1_3', name: 'Зелёный маркер', link: 'https://t.me/c/2429484344/216', module: 'module1' },
  { id: 'mod1_4', name: 'Развивающий дискомфорт', link: 'https://t.me/c/2429484344/217', module: 'module1' },
  { id: 'mod1_5', name: 'ДНЕВНИК 21 день - Тренажёр', link: 'https://t.me/c/2429484344/218', module: 'module1' },
  { id: 'mod1_bonus_1', name: 'Что делать, если "тело выбивает" и вы заболели', link: 'https://t.me/c/2429484344/219', module: 'module1', isBonus: true },
  { id: 'mod1_bonus_2', name: 'Видео-квест: 40 лет максимум!', link: 'https://t.me/c/2429484344/220', module: 'module1', isBonus: true },
  { id: 'mod1_6', name: 'Бегущий генерал', link: 'https://t.me/c/2429484344/221', module: 'module1' },
  { id: 'mod1_7', name: 'Энергетическая бухгалтерия', link: 'https://t.me/c/2429484344/222', module: 'module1' },
  { id: 'mod1_8', name: 'Подарок телу', link: 'https://t.me/c/2429484344/223', module: 'module1' },
  { id: 'mod1_9', name: 'Отдых как инвестиция', link: 'https://t.me/c/2429484344/224', module: 'module1' },
  { id: 'mod1_bonus_3', name: 'Как усилить работу над базовыми практиками (чеклист)', link: 'https://t.me/c/2429484344/225', module: 'module1', isBonus: true },
  { id: 'mod1_bonus_4', name: 'Видео-квест: Ирина Хакамада об энергии', link: 'https://t.me/c/2429484344/226', module: 'module1', isBonus: true },
  
  // МОДУЛЬ II
  { id: 'mod2_1', name: 'Хронометраж', link: 'https://t.me/c/2429484344/229', module: 'module2' },
  { id: 'mod2_2', name: 'Десять достижений', link: 'https://t.me/c/2429484344/230', module: 'module2' },
  { id: 'mod2_3', name: 'Маховик (часть I)', link: 'https://t.me/c/2429484344/231', module: 'module2' },
  { id: 'mod2_4', name: 'Маховик (часть II) — 60 минут', link: 'https://t.me/c/2429484344/232', module: 'module2' },
  { id: 'mod2_bonus_1', name: 'Видео-квест: Кунг-Фу Панда (2008)', link: 'https://t.me/c/2429484344/233', module: 'module2', isBonus: true },
  { id: 'mod2_5', name: 'Хронометраж анализ', link: 'https://t.me/c/2429484344/234', module: 'module2' },
  { id: 'mod2_6', name: 'Шедевр', link: 'https://t.me/c/2429484344/235', module: 'module2' },
  { id: 'mod2_7', name: 'Опрос друзей', link: 'https://t.me/c/2429484344/236', module: 'module2' },
  { id: 'mod2_bonus_2', name: 'Видео-квест: В погоне за счастьем', link: 'https://t.me/c/2429484344/237', module: 'module2', isBonus: true },
  
  // МОДУЛЬ III
  { id: 'mod3_1', name: 'Миллионер', link: 'https://t.me/c/2429484344/240', module: 'module3' },
  { id: 'mod3_2', name: 'Сила рода', link: 'https://t.me/c/2429484344/241', module: 'module3' },
  { id: 'mod3_3', name: 'Страшно хочу', link: 'https://t.me/c/2429484344/242', module: 'module3' },
  { id: 'mod3_bonus_1', name: 'Павел Кочкин о "Проблеме гарантийного талона"', link: 'https://t.me/c/2429484344/243', module: 'module3', isBonus: true },
  { id: 'mod3_bonus_2', name: '3 истории от Стива Джобса', link: 'https://youtu.be/haoTFLjysjk', module: 'module3', isBonus: true },
  { id: 'mod3_4', name: 'Перекрёсток Ильи Муромца', link: 'https://t.me/c/2429484344/244', module: 'module3' },
  { id: 'mod3_5', name: 'Прогулка в парке', link: 'https://t.me/c/2429484344/245', module: 'module3' },
  { id: 'mod3_6', name: 'Внешний носитель', link: 'https://t.me/c/2429484344/246', module: 'module3' },
  { id: 'mod3_7', name: 'Микрозадачи', link: 'https://t.me/c/2429484344/247', module: 'module3' },
  { id: 'mod3_bonus_3', name: 'Притча "Призвание художника"', link: 'https://t.me/c/2429484344/248', module: 'module3', isBonus: true },
  
  // МОДУЛЬ IV
  { id: 'mod4_1', name: 'Сразу после', link: 'https://t.me/c/2429484344/251', module: 'module4' },
  { id: 'mod4_2', name: 'Мастер-Майнд', link: 'https://t.me/c/2429484344/252', module: 'module4' },
  { id: 'mod4_3', name: 'Пять селфи', link: 'https://t.me/c/2429484344/253', module: 'module4' },
  { id: 'mod4_bonus_1', name: 'Видео-квест: фильм "Мирный воин"', link: 'https://t.me/c/2429484344/254', module: 'module4', isBonus: true },
  { id: 'mod4_4', name: 'Яйцо', link: 'https://t.me/c/2429484344/255', module: 'module4' },
  { id: 'mod4_5', name: 'Организовать свой Мастер-Майнд', link: 'https://t.me/c/2429484344/256', module: 'module4' },
  { id: 'mod4_6', name: 'Празднование 🎉', link: 'https://t.me/c/2429484344/257', module: 'module4' },
  { id: 'mod4_7', name: 'Признание и присвоение результатов', link: 'https://t.me/c/2429484344/258', module: 'module4' },
  { id: 'mod4_bonus_2', name: 'Видео-квест: Сила уязвимости', link: 'https://t.me/c/2429484344/259', module: 'module4', isBonus: true },
];

const moduleOrder = ['setup', 'prep', 'module1', 'module2', 'module3', 'module4'] as const;

const moduleMeta: Record<(typeof moduleOrder)[number], { title: string; tagline: string; accent: string }> = {
  setup: { title: 'НАСТРОЙКА НА РАБОТУ В ПОТОКЕ', tagline: 'Подготовь состояние', accent: 'from-rose-500 to-red-500' },
  prep: { title: 'ПРЕДВАРИТЕЛЬНОЕ ЗАДАНИЕ', tagline: 'Задай намерение', accent: 'from-red-500 to-orange-500' },
  module1: { title: 'МОДУЛЬ I: НАБОР ЭНЕРГИИ', tagline: 'Разгоняем мощность', accent: 'from-orange-500 to-amber-500' },
  module2: { title: 'МОДУЛЬ II: ИССЛЕДОВАНИЕ ПОТЕНЦИАЛА', tagline: 'Исследуем себя', accent: 'from-amber-500 to-emerald-500' },
  module3: { title: 'МОДУЛЬ III: ВЫБОР НАПРАВЛЕНИЯ', tagline: 'Фокусируем намерение', accent: 'from-emerald-500 to-sky-500' },
  module4: { title: 'МОДУЛЬ IV: ПРИВЫЧКА ДЕЛАТЬ', tagline: 'Фиксируем результат', accent: 'from-sky-500 to-indigo-500' },
};

const PracticeItem = ({ practice, checked, onToggle }: { practice: Practice; checked: boolean; onToggle: () => void }) => (
  <div className="flex items-start gap-3 py-2 hover:bg-gray-50 px-2 rounded transition-colors">
    <Checkbox
      id={practice.id}
      checked={checked}
      onCheckedChange={onToggle}
      className="mt-1 flex-shrink-0"
    />
    <a
      href={practice.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-1 text-sm text-blue-600 hover:text-blue-800 hover:underline leading-relaxed"
    >
      {practice.name}
    </a>
  </div>
);

export default function Home() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [openModule, setOpenModule] = useState<(typeof moduleOrder)[number]>('setup');
  const {
    isTelegram,
    user: telegramUser,
    webApp,
    configureMainButton,
    registerMainButtonClick,
    sendPayload,
  } = useTelegramWebApp();

  // Load progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      console.log('[Client] === LOAD PROGRESS START ===');
      console.log('[Client] isTelegram:', isTelegram);
      console.log('[Client] telegramUser:', telegramUser);
      console.log('[Client] window.Telegram:', window.Telegram);
      
      // Проверяем, есть ли Telegram WebApp
      const hasTelegram = Boolean(window.Telegram?.WebApp);
      const userId = telegramUser?.id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      
      console.log('[Client] hasTelegram:', hasTelegram);
      console.log('[Client] userId:', userId);
      
      if (hasTelegram && userId) {
        // Загружаем с сервера для Telegram пользователей
        try {
          console.log('[Client] Making GET request to /api/progress/' + userId);
          const response = await axios.get(`/api/progress/${userId}`);
          console.log('[Client] GET response status:', response.status);
          console.log('[Client] GET response data:', response.data);
          
          if (response.data?.checkedItems) {
            const serverItems = response.data.checkedItems;
            const serverCount = Object.keys(serverItems).length;
            console.log('[Client] Loaded', serverCount, 'items from server');
            
            // Объединяем с localStorage (приоритет серверу)
            const localSaved = localStorage.getItem('potok_progress');
            if (localSaved) {
              const localItems = JSON.parse(localSaved);
              const localCount = Object.keys(localItems).length;
              console.log('[Client] Local storage has', localCount, 'items');
              
              // Если на сервере есть данные, используем их, иначе локальные
              if (serverCount > 0) {
                setCheckedItems(serverItems);
                // Обновляем localStorage серверными данными
                localStorage.setItem('potok_progress', JSON.stringify(serverItems));
              } else if (localCount > 0) {
                setCheckedItems(localItems);
                // Синхронизируем локальные данные на сервер
                try {
                  await axios.post('/api/progress', {
                    userId: String(userId),
                    checkedItems: localItems,
                  });
                  console.log('[Client] Synced local data to server');
                } catch (e) {
                  console.error('[Client] Failed to sync local data:', e);
                }
              }
            } else {
              setCheckedItems(serverItems);
              if (serverCount > 0) {
                localStorage.setItem('potok_progress', JSON.stringify(serverItems));
              }
            }
            console.log('[Client] === LOAD PROGRESS SUCCESS ===');
            return;
          }
        } catch (error: any) {
          console.error('[Client] GET request failed:', error);
          console.error('[Client] Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
        }
      }
      
      // Fallback на localStorage
      const saved = localStorage.getItem('potok_progress');
      if (saved) {
        console.log('[Client] Loading from localStorage (fallback)');
        setCheckedItems(JSON.parse(saved));
      } else {
        console.log('[Client] No saved progress found');
      }
      console.log('[Client] === LOAD PROGRESS END ===');
    };

    // Небольшая задержка, чтобы Telegram WebApp успел загрузиться
    const timer = setTimeout(loadProgress, 100);
    return () => clearTimeout(timer);
  }, [isTelegram, telegramUser?.id]);

  // Save progress whenever checkedItems changes
  useEffect(() => {
    // Всегда сохраняем в localStorage как backup
    localStorage.setItem('potok_progress', JSON.stringify(checkedItems));

    // Для Telegram пользователей также сохраняем на сервер
    if (isTelegram && telegramUser?.id) {
      const saveToServer = async () => {
        try {
          const itemsCount = Object.keys(checkedItems).length;
          console.log('[Client] Saving progress to server:', { userId: telegramUser.id, itemsCount });
          await axios.post('/api/progress', {
            userId: String(telegramUser.id),
            checkedItems,
          });
          console.log('[Client] Progress saved successfully');
        } catch (error) {
          console.error('[Client] Failed to save progress to server:', error);
        }
      };

      // Debounce: сохраняем через 500ms после последнего изменения
      const timeoutId = setTimeout(saveToServer, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [checkedItems, isTelegram, telegramUser?.id]);

  const togglePractice = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const groupedPractices = practices.reduce((acc, practice) => {
    if (!acc[practice.module]) {
      acc[practice.module] = [];
    }
    acc[practice.module].push(practice);
    return acc;
  }, {} as Record<string, Practice[]>);

  const stats = useMemo(() => {
    const moduleStats = moduleOrder.map(moduleKey => {
      const items = groupedPractices[moduleKey] ?? [];
      const completed = items.filter(practice => checkedItems[practice.id]).length;
      return {
        key: moduleKey,
        total: items.length,
        completed,
        percent: items.length ? Math.round((completed / items.length) * 100) : 0,
        main: items.filter(p => !p.isBonus),
        bonus: items.filter(p => p.isBonus),
      };
    });

    const totals = moduleStats.reduce(
      (acc, module) => {
        acc.completed += module.completed;
        acc.total += module.total;
        return acc;
      },
      { completed: 0, total: 0 }
    );

    return { moduleStats, totals };
  }, [checkedItems, groupedPractices]);

  const globalPercent = stats.totals.total ? Math.round((stats.totals.completed / stats.totals.total) * 100) : 0;

  const ProgressBar = ({ percent, accent = 'from-rose-500 to-red-500' }: { percent: number; accent?: string }) => (
    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${accent} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );

  useEffect(() => {
    if (!isTelegram || !webApp) return;
    if (!globalPercent) {
      webApp.MainButton.hide();
      return;
    }

    configureMainButton({ text: `Отправить ${globalPercent}%`, isVisible: true });
    const unsubscribe = registerMainButtonClick?.(() => {
      sendPayload({
        type: 'progress_update',
        progress: {
          percent: globalPercent,
          completed: stats.totals.completed,
          total: stats.totals.total,
        },
        payload: {
          checkedItems,
        },
        timestamp: Date.now(),
      });
      // Закрываем приложение после отправки данных
      setTimeout(() => {
        webApp?.close();
      }, 100);
    });

    return () => {
      unsubscribe?.();
      webApp.MainButton.hide();
    };
  }, [
    checkedItems,
    configureMainButton,
    globalPercent,
    isTelegram,
    registerMainButtonClick,
    sendPayload,
    stats.totals.completed,
    stats.totals.total,
    webApp,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff9f8] to-white flex flex-col">
      <div className="bg-white border-b-2 border-red-600 px-6 py-8 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.7em] text-gray-400 mb-3">интерактивный поток</p>
        <h1 className="text-5xl font-black text-black mb-2 tracking-[0.2em]">ПОТОК</h1>
        <p className="text-xl text-red-600 font-semibold">Чтоб глаза горели и деньги были</p>
        {isTelegram && telegramUser && (
          <p className="text-sm text-gray-500 mt-3">
            Telegram WebApp активен · {telegramUser.first_name} {telegramUser.last_name ?? ''}
          </p>
        )}
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-10">
        <div className="bg-black text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 opacity-40 pointer-events-none">
            <div className="w-72 h-72 bg-red-500 blur-[140px]" />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div>
              <p className="uppercase text-sm tracking-[0.4em] text-white/70 mb-2">общий прогресс</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black">{globalPercent}%</span>
                <span className="text-sm text-white/70 mb-2">
                  {stats.totals.completed} из {stats.totals.total} практик
                </span>
              </div>
            </div>
            <div className="w-full lg:max-w-sm">
              <ProgressBar percent={globalPercent} accent="from-red-500 to-orange-400" />
              <p className="text-xs text-white/60 mt-3">Каждый чекбокс — топливо для следующего рывка</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-white/80 text-sm">
            {moduleOrder.map(moduleKey => {
              const info = stats.moduleStats.find(stat => stat.key === moduleKey);
              if (!info) return null;
              return (
                <div key={moduleKey} className="border border-white/10 rounded-2xl py-3 px-4 backdrop-blur bg-white/5">
                  <p className="text-[11px] uppercase tracking-wide text-white/60">{moduleMeta[moduleKey].tagline}</p>
                  <p className="text-lg font-semibold">
                    {info.percent} <span className="text-xs text-white/60">%</span>
                  </p>
                  <p className="text-xs text-white/50">
                    {info.completed}/{info.total} выполнено
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {stats.moduleStats.map(module => (
            <div
              key={module.key}
              className="bg-white/95 backdrop-blur rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-xl"
            >
              <button
                className="w-full flex items-center justify-between gap-6 px-6 py-5 text-left"
                onClick={() => setOpenModule(module.key)}
              >
                <div>
                  <p className="text-xs uppercase text-gray-500 tracking-[0.3em] mb-1">{moduleMeta[module.key].tagline}</p>
                  <h2 className="text-2xl font-black text-gray-900">{moduleMeta[module.key].title}</h2>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm text-gray-500">готово</p>
                  <p className="text-2xl font-black text-gray-900">
                    {module.completed}
                    <span className="text-lg text-gray-400">/{module.total}</span>
                  </p>
                </div>
              </button>

              <div className="px-6 pb-6">
                <ProgressBar percent={module.percent} accent={moduleMeta[module.key].accent} />

                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                  <span>{module.percent}% модуля</span>
                  <span>{module.main.length} обязательных • {module.bonus.length} бонусов</span>
                </div>

                {openModule === module.key && (
                  <div className="mt-6 space-y-6">
                    <div className="space-y-1">
                      {module.main.map(practice => (
                        <PracticeItem
                          key={practice.id}
                          practice={practice}
                          checked={checkedItems[practice.id] || false}
                          onToggle={() => togglePractice(practice.id)}
                        />
                      ))}
                    </div>

                    {module.bonus.length > 0 && (
                      <div className="border-t border-dashed border-gray-200 pt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2 tracking-widest">Бонусы на выходные</p>
                        <div className="space-y-1">
                          {module.bonus.map(practice => (
                            <PracticeItem
                              key={practice.id}
                              practice={practice}
                              checked={checkedItems[practice.id] || false}
                              onToggle={() => togglePractice(practice.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-t-2 border-red-600 py-5 text-center">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-[0.5em]">
          Только делание идёт в счёт
        </p>
      </div>
    </div>
  );
}
