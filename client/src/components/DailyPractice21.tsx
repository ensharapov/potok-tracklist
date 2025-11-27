import { useState, useEffect, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';

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
  const [isExpanded, setIsExpanded] = useState(false);
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
  const handleDayToggle = (dayKey: string) => {
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
      {/* Компактный виджет */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{practiceName}</h3>
            {stats.streak > 0 && (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                🔥 {stats.streak} день{stats.streak === 1 ? '' : stats.streak < 5 ? 'а' : 'ей'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              День <span className="font-bold text-orange-600">{stats.currentDay || '?'}</span> из 21
            </span>
            <span className="text-gray-600">
              Выполнено: <span className="font-bold text-orange-600">{stats.completed}/21</span>
            </span>
          </div>
          <div className="mt-3 h-2 bg-orange-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
          aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Раскрывающийся календарь */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-orange-200">
          {!startDate && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-orange-200">
              <p className="text-sm text-gray-600 mb-3">
                Начни 21-дневную практику! Отметь первый день, чтобы начать отсчёт.
              </p>
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Начать практику
              </button>
            </div>
          )}

          <div className="grid grid-cols-7 gap-2">
            {days.map(({ day, key }) => {
              const isChecked = checkedItems[key] || false;
              const dayDate = getDayDate(day);
              const isToday = dayDate && dayDate.toDateString() === new Date().toDateString();
              const isPast = dayDate && dayDate < new Date() && dayDate.toDateString() !== new Date().toDateString();
              const isFuture = dayDate && dayDate > new Date();

              return (
                <div
                  key={key}
                  className={`
                    relative aspect-square rounded-lg border-2 transition-all
                    ${isChecked 
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-600' 
                      : isToday
                      ? 'bg-orange-100 border-orange-400 border-dashed'
                      : isPast
                      ? 'bg-gray-100 border-gray-300'
                      : 'bg-white border-gray-200'
                    }
                    ${!isFuture ? 'cursor-pointer hover:scale-105' : 'opacity-50'}
                  `}
                  onClick={() => !isFuture && handleDayToggle(key)}
                  title={dayDate ? formatDate(dayDate) : `День ${day}`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                    <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {isChecked && (
                      <span className="text-white text-[10px] mt-0.5">✓</span>
                    )}
                    {isToday && !isChecked && (
                      <span className="text-orange-600 text-[8px] mt-0.5">сегодня</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-orange-500 to-amber-500" />
                <span>Выполнено</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-100 border-2 border-orange-400 border-dashed" />
                <span>Сегодня</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-100 border-2 border-gray-300" />
                <span>Пропущено</span>
              </div>
            </div>
            {practiceLink && (
              <a
                href={practiceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 underline"
              >
                Открыть практику →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

