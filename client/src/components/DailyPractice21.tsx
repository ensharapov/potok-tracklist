import { useState, useEffect, useMemo } from 'react';

interface DailyPractice21Props {
  practiceId: string;
  practiceName: string;
  practiceLink: string;
  userId?: string | number;
  checkedItems: Record<string, boolean>;
  onToggle: (dayKey: string) => void;
}

export function DailyPractice21({
  practiceId,
  practiceName,
  practiceLink,
  userId,
  checkedItems,
  onToggle,
}: DailyPractice21Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Генерируем ключи для 21 дня
  const days = useMemo(() => {
    return Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      key: `${practiceId}_day_${i + 1}`,
    }));
  }, [practiceId]);

  // Загружаем дату начала из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`${practiceId}_start_date`);
    if (saved) {
      setStartDate(new Date(saved));
    }
  }, [practiceId]);

  // Вычисляем статистику
  const stats = useMemo(() => {
    const completed = days.filter(day => checkedItems[day.key]).length;
    const percent = Math.round((completed / 21) * 100);
    
    // Вычисляем streak (последовательные выполненные дни с конца)
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (checkedItems[days[i].key]) {
        streak++;
      } else {
        break;
      }
    }

    // Вычисляем текущий день (если есть дата начала)
    let currentDay = null;
    if (startDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 21) {
        currentDay = diffDays + 1;
      }
    }

    return { completed, percent, streak, currentDay };
  }, [days, checkedItems, startDate]);

  // Обработчик начала практики
  const handleStart = () => {
    const today = new Date();
    setStartDate(today);
    localStorage.setItem(`${practiceId}_start_date`, today.toISOString());
  };

  // Обработчик отметки дня
  const handleDayToggle = (dayKey: string, day: number) => {
    // Если это первый день и дата начала не установлена - устанавливаем
    if (!startDate && !checkedItems[dayKey]) {
      handleStart();
    }
    onToggle(dayKey);
  };

  // Вычисляем дату для каждого дня
  const getDayDate = (day: number): Date | null => {
    if (!startDate) return null;
    const date = new Date(startDate);
    date.setDate(date.getDate() + day - 1);
    return date;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="border-2 border-green-200 dark:border-green-700 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 mb-6">
      {/* Заголовок с ссылкой */}
      <div className="mb-4">
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Дневник 21 день</h3>
        {practiceLink && (
          <a
            href={practiceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline font-medium"
          >
            Открыть чат для сдачи отчета →
          </a>
        )}
      </div>

      {/* Статистика */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        {stats.streak > 0 && (
          <span className="px-3 py-1 bg-green-500 dark:bg-green-600 text-white text-xs font-bold rounded-full">
            🔥 {stats.streak} день{stats.streak === 1 ? '' : stats.streak < 5 ? 'а' : 'ей'}
          </span>
        )}
        <span className="text-gray-600 dark:text-gray-300">
          День <span className="font-bold text-green-600 dark:text-green-400">{stats.currentDay || '?'}</span> из 21
        </span>
        <span className="text-gray-600 dark:text-gray-300">
          Выполнено: <span className="font-bold text-green-600 dark:text-green-400">{stats.completed}/21</span>
        </span>
      </div>

      {/* Прогресс-бар */}
      <div className="mb-6 h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${stats.percent}%` }}
        />
      </div>

      {/* Цепочка из 21 кружка (Streak Chain) */}
      <div className="flex flex-wrap gap-2 justify-center">
        {days.map(({ day, key }) => {
          const isChecked = checkedItems[key] || false;
          const dayDate = getDayDate(day);
          const isToday = dayDate && dayDate.toDateString() === new Date().toDateString();
          const isPast = dayDate && dayDate < new Date() && dayDate.toDateString() !== new Date().toDateString();
          const isFuture = dayDate && dayDate > new Date();

          return (
            <button
              key={key}
              onClick={() => !isFuture && handleDayToggle(key, day)}
              disabled={isFuture}
              className={`
                relative w-10 h-10 rounded-full border-2 transition-all duration-200
                flex items-center justify-center text-xs font-bold
                ${isChecked 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-600 dark:border-green-400 text-white shadow-md scale-105' 
                  : isToday
                  ? 'bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-500 border-dashed text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60'
                  : isPast
                  ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed'
                }
                ${!isFuture ? 'hover:scale-110 active:scale-95' : ''}
              `}
              title={dayDate ? `${day}. ${formatDate(dayDate)}` : `День ${day}`}
            >
              {isChecked ? (
                <span className="text-white text-sm">✓</span>
              ) : (
                <span className={isToday ? 'text-green-700 dark:text-green-300' : isPast ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}>
                  {day}
                </span>
              )}
              {isToday && !isChecked && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] text-green-600 dark:text-green-400 font-bold">
                  •
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Подсказка */}
      {!startDate && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Отметь первый день, чтобы начать отсчёт 21 дня
          </p>
        </div>
      )}
    </div>
  );
}

