import React, { useState, useEffect, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { DailyPractice21 } from '@/components/DailyPractice21';

interface Practice {
  id: string;
  name: string;
  link: string;
  module: string;
  isBonus?: boolean;
}

// Практики для студентов (основной поток)
const studentPractices: Practice[] = [
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
  
  // БОНУСНЫЙ МОДУЛЬ 1: КАК УДЕРЖАТЬСЯ НА ПУТИ?
  { id: 'bonus1_1', name: 'Инструкция себе', link: 'https://t.me/c/2621673691/11', module: 'bonus1' },
  { id: 'bonus1_2', name: 'Голод к тренировке', link: 'https://t.me/c/2621673691/13', module: 'bonus1' },
  { id: 'bonus1_3', name: 'Мотивационный лист', link: 'https://t.me/c/2621673691/14', module: 'bonus1' },
  { id: 'bonus1_4', name: 'Аудиогид «Каждый день в предназначении»', link: 'https://t.me/c/2621673691/18', module: 'bonus1' },
  
  // БОНУСНЫЙ МОДУЛЬ 2: РАБОТА С ЭМОЦИЯМИ
  { id: 'bonus2_1', name: 'Сквозная практика', link: 'https://t.me/c/2553266044/4', module: 'bonus2' },
  { id: 'bonus2_2', name: 'Дыхание по квадрату', link: 'https://t.me/c/2553266044/6', module: 'bonus2' },
  { id: 'bonus2_3', name: 'Как вы расслабляетесь', link: 'https://t.me/c/2553266044/9', module: 'bonus2' },
  { id: 'bonus2_4', name: 'Техника "Охранник"', link: 'https://t.me/c/2553266044/10', module: 'bonus2' },
  { id: 'bonus2_5', name: 'Описание обиды', link: 'https://t.me/c/2553266044/11', module: 'bonus2' },
  { id: 'bonus2_6', name: 'Проработка обиды', link: 'https://t.me/c/2553266044/12', module: 'bonus2' },
  
  // БОНУСНЫЙ МОДУЛЬ 3: РАБОТА С УБЕЖДЕНИЯМИ
  { id: 'bonus3_0', name: 'Вводная часть', link: 'https://t.me/c/2392642774/6', module: 'bonus3' },
  { id: 'bonus3_1', name: 'Сочинение ✍️', link: 'https://t.me/c/2392642774/7', module: 'bonus3' },
  { id: 'bonus3_2', name: 'Список ограничений', link: 'https://t.me/c/2392642774/8', module: 'bonus3' },
  { id: 'bonus3_3', name: 'Расширение убеждения', link: 'https://t.me/c/2392642774/9', module: 'bonus3' },
  { id: 'bonus3_4', name: 'Аудиогид «УБЕЖДЕНИЯ»', link: 'https://t.me/c/2392642774/10', module: 'bonus3' },
  
  // БОНУСНЫЙ МОДУЛЬ 4: МУЖСКОЕ И ЖЕНСКОЕ ПРЕДНАЗНАЧЕНИЕ
  { id: 'bonus4_0', name: '7 каналов взаимодействия между мужчиной и женщиной', link: 'https://t.me/c/2739965403/5', module: 'bonus4' },
  { id: 'bonus4_1', name: '3 тарифа поведения', link: 'https://t.me/c/2739965403/6', module: 'bonus4' },
  { id: 'bonus4_2', name: 'Задание 1 | Аксиомы', link: 'https://t.me/c/2739965403/7', module: 'bonus4' },
  { id: 'bonus4_3', name: 'ТЕОРИЯ. ПЕРВЫЙ УРОВЕНЬ', link: 'https://t.me/c/2739965403/27', module: 'bonus4' },
  { id: 'bonus4_4', name: 'Задание 2 | Невербальные просьбы', link: 'https://t.me/c/2739965403/28', module: 'bonus4' },
  { id: 'bonus4_5', name: 'ТЕОРИЯ. ВТОРОЙ УРОВЕНЬ', link: 'https://t.me/c/2739965403/29', module: 'bonus4' },
  { id: 'bonus4_6', name: 'Задание 3 | Комплименты и сюрпризы', link: 'https://t.me/c/2739965403/30', module: 'bonus4' },
  { id: 'bonus4_7', name: 'ТЕОРИЯ. ТРЕТИЙ УРОВЕНЬ', link: 'https://t.me/c/2739965403/31', module: 'bonus4' },
  { id: 'bonus4_8', name: 'Задание 4 | Практика на статус', link: 'https://t.me/c/2739965403/32', module: 'bonus4' },
  { id: 'bonus4_9', name: 'ТЕОРИЯ. ЧЕТВЕРТЫЙ УРОВЕНЬ', link: 'https://t.me/c/2739965403/33', module: 'bonus4' },
  { id: 'bonus4_10', name: 'Задание 5 | Любить партнера безусловно', link: 'https://t.me/c/2739965403/34', module: 'bonus4' },
  { id: 'bonus4_11', name: 'ТЕОРИЯ. ПЯТЫЙ УРОВЕНЬ', link: 'https://t.me/c/2739965403/35', module: 'bonus4' },
  { id: 'bonus4_12', name: 'Задание 6 | Грибы в ванной', link: 'https://t.me/c/2739965403/36', module: 'bonus4' },
  { id: 'bonus4_13', name: 'ТЕОРИЯ. ШЕСТОЙ УРОВЕНЬ', link: 'https://t.me/c/2739965403/37', module: 'bonus4' },
  { id: 'bonus4_14', name: 'Задание 7 | Видение будущего', link: 'https://t.me/c/2739965403/38', module: 'bonus4' },
  { id: 'bonus4_15', name: '7 УРОВЕНЬ. ИТОГИ', link: 'https://t.me/c/2739965403/39', module: 'bonus4' },
  { id: 'bonus4_16', name: 'ДЛЯ СВЯЗИ - окно, где можно обмениваться опытом и обратной связью, поддерживать друг друга в рамках данного модуля', link: 'https://t.me/c/2739965403/41', module: 'bonus4' },
];

// Практики для выпускников (расширенный доступ)
// TODO: Добавить практики для выпускников
const graduatePractices: Practice[] = [
  // Здесь будут практики для выпускников
  // Можно добавить те же практики, что и для студентов, плюс дополнительные
  // или полностью другие модули
];

// Выбираем массив практик в зависимости от режима
// Это будет использоваться внутри компонента через useMemo

const moduleOrder = ['setup', 'prep', 'module1', 'module2', 'module3', 'module4', 'bonus1', 'bonus2', 'bonus3', 'bonus4'] as const;

const moduleMeta: Record<(typeof moduleOrder)[number], { title: string; tagline: string; accent: string; isBonus?: boolean }> = {
  setup: { title: 'НАСТРОЙКА НА РАБОТУ В ПОТОКЕ', tagline: 'Подготовь состояние', accent: 'from-rose-500 to-red-500' },
  prep: { title: 'ПРЕДВАРИТЕЛЬНОЕ ЗАДАНИЕ', tagline: 'Задай намерение', accent: 'from-red-500 to-orange-500' },
  module1: { title: 'МОДУЛЬ I: НАБОР ЭНЕРГИИ', tagline: 'Разгоняем мощность', accent: 'from-orange-500 to-amber-500' },
  module2: { title: 'МОДУЛЬ II: ИССЛЕДОВАНИЕ ПОТЕНЦИАЛА', tagline: 'Исследуем себя', accent: 'from-amber-500 to-emerald-500' },
  module3: { title: 'МОДУЛЬ III: ВЫБОР НАПРАВЛЕНИЯ', tagline: 'Фокусируем намерение', accent: 'from-emerald-500 to-sky-500' },
  module4: { title: 'МОДУЛЬ IV: ПРИВЫЧКА ДЕЛАТЬ', tagline: 'Фиксируем результат', accent: 'from-sky-500 to-indigo-500' },
  bonus1: { title: 'Как удержаться на пути Предназначения в долгую?', tagline: 'Бонусный модуль', accent: 'from-purple-500 to-pink-500', isBonus: true },
  bonus2: { title: 'Как проработать сложные эмоции', tagline: 'Бонусный модуль', accent: 'from-pink-500 to-rose-500', isBonus: true },
  bonus3: { title: 'Найти то, что тормозит, и обезвредить. Как расширить горизонт видения?', tagline: 'Бонусный модуль', accent: 'from-violet-500 to-purple-500', isBonus: true },
  bonus4: { title: 'Как построить гармоничные семейные отношения', tagline: 'Бонусный модуль', accent: 'from-indigo-500 to-purple-500', isBonus: true },
};

const PracticeItem = ({ practice, checked, onToggle }: { practice: Practice; checked: boolean; onToggle: () => void }) => (
  <div className="flex items-start gap-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded transition-colors">
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
      className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline leading-relaxed"
    >
      {practice.name}
    </a>
  </div>
);

type AppMode = 'student' | 'graduate';

export default function Home() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Проверяем доступ к режиму выпускника (через URL параметр или localStorage)
  // В будущем это можно заменить на проверку через API/Telegram WebApp initData
  const [hasGraduateAccess, setHasGraduateAccess] = useState<boolean>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('graduate_access') === 'true') {
      localStorage.setItem('graduate_access', 'true');
      return true;
    }
    return localStorage.getItem('graduate_access') === 'true';
  });
  
  // Режим приложения: студент или выпускник
  const [appMode, setAppMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('potok_app_mode');
    return (saved === 'graduate' && hasGraduateAccess) ? 'graduate' : 'student';
  });
  
  // Проверяем разблокировку бонусных модулей через URL или localStorage
  const [bonusUnlocked, setBonusUnlocked] = useState<boolean>(() => {
    // Проверяем URL параметр
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('unlock_bonus') === 'true') {
      localStorage.setItem('bonus_unlocked', 'true');
      return true;
    }
    // Проверяем localStorage
    return localStorage.getItem('bonus_unlocked') === 'true';
  });
  
  // Загружаем последний открытый модуль из localStorage
  const [openModule, setOpenModule] = useState<(typeof moduleOrder)[number]>(() => {
    const saved = localStorage.getItem('potok_last_module');
    return (saved && moduleOrder.includes(saved as any)) ? (saved as typeof moduleOrder[number]) : 'setup';
  });
  const {
    isTelegram,
    user: telegramUser,
    webApp,
    configureMainButton,
    registerMainButtonClick,
    sendPayload,
  } = useTelegramWebApp();

  // Load progress on mount - только один раз при загрузке
  useEffect(() => {
    let isMounted = true;
    
    const loadProgress = async () => {
      console.log('[Client] === LOAD PROGRESS START ===');
      
      // Сначала загружаем из localStorage (быстро)
      const localSaved = localStorage.getItem('potok_progress');
      if (localSaved) {
        try {
          const localItems = JSON.parse(localSaved);
          const localCount = Object.keys(localItems).length;
          if (localCount > 0 && isMounted) {
            console.log('[Client] Loading from localStorage first:', localCount, 'items');
            setCheckedItems(localItems);
          }
        } catch (e) {
          console.error('[Client] Failed to parse localStorage:', e);
        }
      }
      
      // Потом пытаемся загрузить с сервера (если Telegram)
      const hasTelegram = Boolean(window.Telegram?.WebApp);
      const userId = telegramUser?.id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      
      console.log('[Client] hasTelegram:', hasTelegram, 'userId:', userId);
      
      if (hasTelegram && userId) {
        try {
          // Пробуем загрузить из Supabase
          console.log('[Client] Making GET request to /api/progress-supabase/' + userId);
          const response = await axios.get(`/api/progress-supabase?userId=${userId}`);
          console.log('[Client] GET response from Supabase:', response.data);
          
          if (response.data?.checkedItems && Object.keys(response.data.checkedItems).length > 0) {
            const serverItems = response.data.checkedItems;
            const serverCount = Object.keys(serverItems).length;
            const serverAppMode = response.data?.appMode;
            console.log('[Client] Loaded', serverCount, 'items from Supabase, appMode:', serverAppMode);
            
            if (isMounted) {
              // Серверные данные имеют приоритет
              setCheckedItems(serverItems);
              localStorage.setItem('potok_progress', JSON.stringify(serverItems));
              
              // Восстанавливаем режим из сервера, если есть доступ
              if (serverAppMode && hasGraduateAccess) {
                setAppMode(serverAppMode);
                localStorage.setItem('potok_app_mode', serverAppMode);
              }
              
              console.log('[Client] Updated from Supabase');
            }
            return;
          } else {
            console.log('[Client] No Supabase data, trying fallback API');
            // Fallback на старый API
            try {
              const fallbackResponse = await axios.get(`/api/progress/${userId}`);
              if (fallbackResponse.data?.checkedItems && Object.keys(fallbackResponse.data.checkedItems).length > 0) {
                const fallbackItems = fallbackResponse.data.checkedItems;
                if (isMounted) {
                  setCheckedItems(fallbackItems);
                  localStorage.setItem('potok_progress', JSON.stringify(fallbackItems));
                  console.log('[Client] Updated from fallback API');
                }
                return;
              }
            } catch (fallbackError) {
              console.log('[Client] Fallback API also failed, keeping local');
            }
          }
        } catch (error: any) {
          console.error('[Client] GET request to Supabase failed:', error.message);
          // Пробуем fallback API
          try {
            const fallbackResponse = await axios.get(`/api/progress/${userId}`);
            if (fallbackResponse.data?.checkedItems && Object.keys(fallbackResponse.data.checkedItems).length > 0) {
              const fallbackItems = fallbackResponse.data.checkedItems;
              if (isMounted) {
                setCheckedItems(fallbackItems);
                localStorage.setItem('potok_progress', JSON.stringify(fallbackItems));
                console.log('[Client] Updated from fallback API');
              }
            }
          } catch (fallbackError) {
            console.error('[Client] Fallback API also failed:', fallbackError);
            // Оставляем данные из localStorage
          }
        }
      }
      
      console.log('[Client] === LOAD PROGRESS END ===');
    };

    // Небольшая задержка, чтобы Telegram WebApp успел загрузиться
    const timer = setTimeout(loadProgress, 200);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []); // Загружаем только один раз при монтировании

  // Save progress to localStorage whenever checkedItems changes
  useEffect(() => {
    // Сохраняем в localStorage только если есть изменения
    if (Object.keys(checkedItems).length > 0) {
      console.log('[Client] Saving to localStorage:', Object.keys(checkedItems).length, 'items');
    localStorage.setItem('potok_progress', JSON.stringify(checkedItems));
    }
  }, [checkedItems]);

  // Выбираем массив практик в зависимости от режима
  const practices = appMode === 'graduate' ? graduatePractices : studentPractices;
  
  // Сохраняем режим в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('potok_app_mode', appMode);
  }, [appMode]);
  
  // Обработчик переключения режима
  const handleModeSwitch = (newMode: AppMode) => {
    if (newMode === 'graduate' && !hasGraduateAccess) {
      // Если пытаются переключиться на режим выпускника без доступа
      return;
    }
    setAppMode(newMode);
    localStorage.setItem('potok_app_mode', newMode);
  };

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
      
      // Для модуля 1: считаем 21-дневную практику как одну практику (если выполнено хотя бы 1 день)
      let completed = 0;
      let total = items.length;
      
      if (moduleKey === 'module1') {
        // Убираем mod1_5 из списка практик модуля 1
        const otherPractices = items.filter(p => p.id !== 'mod1_5');
        completed = otherPractices.filter(p => checkedItems[p.id]).length;
        total = otherPractices.length;
        
        // Проверяем, все ли 21 день выполнены без пропусков
        const practice21Days = Array.from({ length: 21 }, (_, i) => `mod1_5_day_${i + 1}`);
        const allDaysCompleted = practice21Days.every(dayKey => checkedItems[dayKey]);
        const hasPractice = checkedItems['mod1_5'];
        
        // Если все 21 день выполнены - считаем практику выполненной
        if (allDaysCompleted || hasPractice) {
          completed++;
          total++;
        }
        
        return {
          key: moduleKey,
          total,
          completed,
          percent: total ? Math.round((completed / total) * 100) : 0,
          main: otherPractices.filter(p => !p.isBonus),
          bonus: otherPractices.filter(p => p.isBonus),
        };
      } else {
        completed = items.filter(practice => checkedItems[practice.id]).length;
        return {
          key: moduleKey,
          total,
          completed,
          percent: total ? Math.round((completed / total) * 100) : 0,
          main: items.filter(p => !p.isBonus),
          bonus: items.filter(p => p.isBonus),
        };
      }
    });

    // Подсчитываем общую статистику только для основных модулей
    const mainModuleStats = moduleStats.filter(m => !moduleMeta[m.key]?.isBonus);
    const totals = mainModuleStats.reduce(
      (acc, module) => {
        acc.completed += module.completed;
        acc.total += module.total;
        return acc;
      },
      { completed: 0, total: 0 }
    );

    // Проверяем, завершены ли все основные модули
    const mainModules = ['setup', 'prep', 'module1', 'module2', 'module3', 'module4'];
    const allMainModulesCompleted = mainModules.every(key => {
      const module = moduleStats.find(m => m.key === key);
      return module && module.percent === 100;
    });

    return { moduleStats, totals, allMainModulesCompleted, bonusUnlocked };
  }, [checkedItems, groupedPractices, bonusUnlocked]);

  // Автоматически сбрасываем чекбокс практики 21 день, если не все дни выполнены
  useEffect(() => {
    const practice21Days = Array.from({ length: 21 }, (_, i) => `mod1_5_day_${i + 1}`);
    const allDaysCompleted = practice21Days.every(dayKey => checkedItems[dayKey]);
    
    // Если чекбокс отмечен, но не все дни выполнены - сбрасываем его
    if (!allDaysCompleted && checkedItems['mod1_5']) {
      setCheckedItems(prev => {
        const newItems = { ...prev };
        delete newItems['mod1_5'];
        return newItems;
      });
    }
  }, [checkedItems]);

  const globalPercent = stats.totals.total ? Math.round((stats.totals.completed / stats.totals.total) * 100) : 0;

  const ProgressBar = ({ percent, accent = 'from-rose-500 to-red-500' }: { percent: number; accent?: string }) => (
    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${accent} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );

  // Настройка кнопки "Отправить" для синхронизации
  useEffect(() => {
    if (!isTelegram || !webApp) return;
    
    // Показываем кнопку только если есть прогресс
    const hasProgress = Object.keys(checkedItems).length > 0;
    
    if (!hasProgress) {
      webApp.MainButton.hide();
      return;
    }

    configureMainButton({ text: `Отправить ${globalPercent}%`, isVisible: true });
    
    const unsubscribe = registerMainButtonClick?.(async () => {
      try {
        // 1. Сохраняем в localStorage
        localStorage.setItem('potok_progress', JSON.stringify(checkedItems));
        console.log('[Client] Saved to localStorage');
        
        // 2. Сохраняем на сервер в Supabase (если есть userId)
        const userId = telegramUser?.id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
        if (userId) {
          console.log('[Client] Syncing to Supabase for userId:', userId);
          try {
            await axios.post('/api/progress-supabase', {
              userId: String(userId),
              checkedItems,
              appMode, // Сохраняем режим приложения
              telegramUsername: telegramUser?.username || window.Telegram?.WebApp?.initDataUnsafe?.user?.username,
              telegramFirstName: telegramUser?.first_name || window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name,
              telegramLastName: telegramUser?.last_name || window.Telegram?.WebApp?.initDataUnsafe?.user?.last_name,
            });
            console.log('[Client] Synced to Supabase successfully');
          } catch (error) {
            console.error('[Client] Failed to sync to Supabase:', error);
            // Пробуем старый API как fallback
            try {
              await axios.post('/api/progress', {
                userId: String(userId),
                checkedItems,
              });
              console.log('[Client] Synced to fallback API');
            } catch (fallbackError) {
              console.error('[Client] Fallback API also failed:', fallbackError);
            }
          }
        }
        
        // 3. Отправляем данные в бот
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
        
        // 4. Показываем уведомление и закрываем
        webApp.showAlert('Прогресс сохранён и синхронизирован!');
        setTimeout(() => {
          webApp?.close();
        }, 500);
      } catch (error) {
        console.error('[Client] Failed to sync:', error);
        webApp.showAlert('Ошибка синхронизации. Данные сохранены локально.');
      }
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
    telegramUser?.id,
    webApp,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff9f8] to-white dark:from-black dark:to-black flex flex-col">
      <div className="bg-white dark:bg-black border-b-2 border-red-600 dark:border-red-500 px-6 py-8 text-center shadow-sm relative">
        {/* Переключатель режимов (только если есть доступ к режиму выпускника) */}
        {hasGraduateAccess && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => handleModeSwitch('student')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                appMode === 'student'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Студент
            </button>
            <button
              onClick={() => handleModeSwitch('graduate')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                appMode === 'graduate'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Выпускник
            </button>
          </div>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Тренинг по методу Павла Кочкина</p>
        <h1 className="text-5xl font-black text-black dark:text-white mb-2 tracking-[0.2em]">ПОТОК</h1>
        <p className="text-xl text-red-600 dark:text-red-400 font-semibold">Чтоб глаза горели и деньги были</p>
        {isTelegram && telegramUser && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Telegram WebApp активен · {telegramUser.first_name} {telegramUser.last_name ?? ''}
          </p>
        )}
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-10">
        <div className="bg-black dark:bg-black text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-gray-800">
          <div className="absolute inset-y-0 right-0 opacity-40 pointer-events-none">
            <div className="w-72 h-72 bg-red-500 blur-[140px]" />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black">{globalPercent}%</span>
              <span className="text-sm text-white/70 mb-1">
                {stats.totals.completed} из {stats.totals.total} практик
              </span>
            </div>
            <div className="w-full lg:max-w-sm">
              <ProgressBar percent={globalPercent} accent="from-red-500 to-orange-400" />
              <p className="text-xs text-white/60 mt-2">Каждый чекбокс — топливо для следующего рывка</p>
            </div>
          </div>
        </div>

        {/* Карта всего пути */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-3 text-center">Карта пути</p>
          <div className="flex flex-wrap justify-center gap-2">
            {stats.moduleStats.map((module, index) => {
              const isBonusModule = moduleMeta[module.key]?.isBonus;
              const isDisabled = isBonusModule && !stats.allMainModulesCompleted && !stats.bonusUnlocked;
              const isCompleted = module.percent === 100;
              
              // Определяем номер для отображения
              let moduleNumber = '';
              if (module.key === 'setup' || module.key === 'prep') {
                moduleNumber = ''; // Подготовительные без номера
              } else if (module.key.startsWith('module')) {
                const num = module.key.replace('module', '');
                moduleNumber = num === '1' ? 'I' : num === '2' ? 'II' : num === '3' ? 'III' : num === '4' ? 'IV' : '';
              } else if (module.key.startsWith('bonus')) {
                const num = module.key.replace('bonus', '');
                moduleNumber = `B${num}`;
              }
              
              return (
                <React.Fragment key={module.key}>
                  <button
                    onClick={() => {
                      if (!isDisabled) {
                        setOpenModule(module.key);
                        localStorage.setItem('potok_last_module', module.key);
                        // Прокручиваем к модулю
                        setTimeout(() => {
                          const element = document.querySelector(`[data-module-key="${module.key}"]`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }
                    }}
                    className={`
                      relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                      ${isCompleted 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : isDisabled
                        ? 'bg-gray-200 dark:bg-gray-900 text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed'
                        : module.percent > 0
                        ? 'bg-orange-200 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 hover:bg-orange-300 dark:hover:bg-orange-900/60 cursor-pointer'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer'
                      }
                    `}
                    title={`${moduleMeta[module.key].title}: ${module.percent}%`}
                    disabled={isDisabled}
                  >
                    {moduleNumber && <span className="mr-1 opacity-70">{moduleNumber}.</span>}
                    {isCompleted && '✓ '}
                    {moduleMeta[module.key].tagline}
                    {!isCompleted && module.percent > 0 && (
                      <span className="ml-1 text-[10px]">{module.percent}%</span>
                    )}
                  </button>
                  
                  {/* Кнопка для дневника 21 день - центральная практика, выделяем особо */}
                  {module.key === 'module1' && (() => {
                    const practice21Days = Array.from({ length: 21 }, (_, i) => `mod1_5_day_${i + 1}`);
                    const allDaysCompleted = practice21Days.every(dayKey => checkedItems[dayKey]);
                    const hasAnyDay = practice21Days.some(dayKey => checkedItems[dayKey]);
                    const isCompleted = allDaysCompleted;
                    
                    return (
                      <button
                        onClick={() => {
                          // Прокручиваем к виджету дневника
                          setTimeout(() => {
                            const element = document.querySelector('[data-daily-practice-21]');
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                        }}
                        className={`
                          relative px-4 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105
                          shadow-lg border-2
                          ${isCompleted 
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-yellow-300 hover:from-yellow-500 hover:to-amber-600 shadow-yellow-500/50' 
                            : hasAnyDay
                            ? 'bg-gradient-to-r from-orange-300 to-amber-400 dark:from-orange-900/60 dark:to-amber-900/60 text-orange-900 dark:text-orange-200 border-orange-400 dark:border-orange-700 hover:from-orange-400 hover:to-amber-500 dark:hover:from-orange-800 dark:hover:to-amber-800 shadow-orange-500/30 cursor-pointer animate-pulse'
                            : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-700 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-700 dark:hover:to-gray-800 cursor-pointer'
                          }
                        `}
                        title="Дневник 21 день - Центральная практика тренинга"
                      >
                        <span className="mr-1.5">⭐</span>
                        {isCompleted && '✓ '}
                        <span className="font-black">Дневник 21 день</span>
                        {!isCompleted && hasAnyDay && (
                          <span className="ml-1.5 text-xs font-semibold bg-white/30 dark:bg-black/30 px-1.5 py-0.5 rounded">
                            {practice21Days.filter(dayKey => checkedItems[dayKey]).length}/21
                          </span>
                        )}
                      </button>
                    );
                  })()}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          {stats.moduleStats.map((module, index) => {
            const isBonusModule = moduleMeta[module.key]?.isBonus;
            const isDisabled = isBonusModule && !stats.allMainModulesCompleted && !stats.bonusUnlocked;

          return (
            <React.Fragment key={module.key}>
              <div
                data-module-key={module.key}
                className={`bg-white/95 dark:bg-black/95 backdrop-blur rounded-3xl border shadow-sm overflow-hidden transition-all ${
                  isBonusModule 
                    ? 'border-purple-300 dark:border-purple-800 border-2' 
                    : 'border-gray-100 dark:border-gray-800'
                } ${
                  isDisabled 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-xl cursor-pointer'
                }`}
              >
                <button
                  className={`w-full flex items-center justify-between gap-6 px-6 py-5 text-left ${
                    isDisabled ? 'cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (!isDisabled) {
                      setOpenModule(module.key);
                      // Сохраняем последний открытый модуль
                      localStorage.setItem('potok_last_module', module.key);
                    }
                  }}
                  disabled={isDisabled}
                >
                  <div>
                    <p className={`text-xs uppercase tracking-[0.3em] mb-1 ${
                      isBonusModule 
                        ? isDisabled
                          ? 'text-purple-400 dark:text-purple-600 font-bold'
                          : 'text-purple-600 dark:text-purple-400 font-bold'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {moduleMeta[module.key].tagline}
                    </p>
                    <h2 className={`text-2xl font-black ${
                      isDisabled 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {moduleMeta[module.key].title}
                </h2>
                    {isDisabled && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 font-semibold">
                        Пройдите Поток, чтобы открыть модуль
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <p className={`text-sm ${
                      isDisabled 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      готово
                    </p>
                    <p className={`text-2xl font-black ${
                      isDisabled 
                        ? 'text-gray-400 dark:text-gray-600' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {module.completed}
                      <span className="text-lg text-gray-400 dark:text-gray-500">/{module.total}</span>
                    </p>
                  </div>
                </button>

                <div className="px-6 pb-6">
                  <ProgressBar percent={module.percent} accent={moduleMeta[module.key].accent} />

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
                    <span>{module.percent}% модуля</span>
                    <span>{module.main.length} обязательных • {module.bonus.length} бонусов</span>
              </div>

                  {openModule === module.key && !isDisabled && (
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
                        
                        {/* Чекбокс для практики 21 день - доступен только после выполнения всех дней */}
                        {module.key === 'module1' && (() => {
                          const practice21Days = Array.from({ length: 21 }, (_, i) => `mod1_5_day_${i + 1}`);
                          const allDaysCompleted = practice21Days.every(dayKey => checkedItems[dayKey]);
                          const practice21 = practices.find(p => p.id === 'mod1_5');
                          if (!practice21) return null;
                          
                          return (
                            <div className="flex items-start gap-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 px-2 rounded transition-colors">
                              <Checkbox
                                id="mod1_5"
                                checked={allDaysCompleted && (checkedItems['mod1_5'] || false)}
                                onCheckedChange={() => {
                                  if (allDaysCompleted) {
                                    togglePractice('mod1_5');
                                  }
                                }}
                                disabled={!allDaysCompleted}
                                className="mt-1 flex-shrink-0"
                              />
                              <label
                                htmlFor="mod1_5"
                                className={`flex-1 text-sm leading-relaxed ${
                                  allDaysCompleted
                                    ? 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer'
                                    : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {practice21.name}
                                {!allDaysCompleted && (
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    (выполните все 21 день без пропусков)
                                  </span>
                                )}
                              </label>
                            </div>
                          );
                        })()}
              </div>

                      {module.bonus.length > 0 && (
                        <div className="border-t border-dashed border-gray-200 dark:border-gray-800 pt-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 tracking-widest">Бонусы на выходные</p>
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
              
              {/* Вставляем практику 21 день между модулями 1 и 2 */}
              {module.key === 'module1' && (
                <div data-daily-practice-21>
                  <DailyPractice21
                    practiceId="mod1_5"
                    practiceName="ДНЕВНИК 21 день - Тренажёр"
                    practiceLink="https://t.me/c/2429484344/218"
                    userId={telegramUser?.id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id}
                    checkedItems={checkedItems}
                    onToggle={togglePractice}
                    onReset={() => {
                      // Сбрасываем основной чекбокс практики
                      if (checkedItems['mod1_5']) {
                        togglePractice('mod1_5');
                      }
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
        </div>
      </div>

      <div className="bg-white dark:bg-black border-t-2 border-red-600 dark:border-red-500 py-5 text-center">
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-[0.5em]">
          Только делание идёт в счёт
        </p>
      </div>
    </div>
  );
}
