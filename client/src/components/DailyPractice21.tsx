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
    <div className="border-2 border-orange-200 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 mb-6">
      {/* Заголовок с ссылкой */}
      <div className="mb-4">
        <h3 className="text-xl font-black text-gray-900 mb-2">Дневник 21 день</h3>
        {practiceLink && (
          <a
            href={practiceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-orange-600 hover:text-orange-700 underline font-medium"
          >
            Открыть чат для сдачи отчета →
          </a>
        )}
      </div>

      {/* Статистика */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        {stats.streak > 0 && (
          <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
            🔥 {stats.streak} день{stats.streak === 1 ? '' : stats.streak < 5 ? 'а' : 'ей'}
          </span>
        )}
        <span className="text-gray-600">
          День <span className="font-bold text-orange-600">{stats.currentDay || '?'}</span> из 21
        </span>
        <span className="text-gray-600">
          Выполнено: <span className="font-bold text-orange-600">{stats.completed}/21</span>
        </span>
      </div>

      {/* Прогресс-бар */}
      <div className="mb-6 h-2 bg-orange-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
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
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-600 text-white shadow-md scale-105' 
                  : isToday
                  ? 'bg-orange-100 border-orange-400 border-dashed text-orange-700 hover:bg-orange-200'
                  : isPast
                  ? 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
                  : 'bg-white border-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                }
                ${!isFuture ? 'hover:scale-110 active:scale-95' : ''}
              `}
              title={dayDate ? `${day}. ${formatDate(dayDate)}` : `День ${day}`}
            >
              {isChecked ? (
                <span className="text-white text-sm">✓</span>
              ) : (
                <span className={isToday ? 'text-orange-700' : isPast ? 'text-gray-500' : 'text-gray-400'}>
                  {day}
                </span>
              )}
              {isToday && !isChecked && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] text-orange-600 font-bold">
                  •
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Подсказка */}
      {!startDate && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200 text-center">
          <p className="text-xs text-gray-600">
            Отметь первый день, чтобы начать отсчёт 21 дня
          </p>
        </div>
      )}
    </div>
  );
}

