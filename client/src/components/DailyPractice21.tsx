import { useState, useEffect, useMemo } from 'react';

interface DailyPractice21Props {
  practiceId: string;
  practiceName: string;
  practiceLink: string;
  userId?: string | number;
  checkedItems: Record<string, boolean>;
  onToggle: (dayKey: string) => void;
  onReset?: () => void;
}

export function DailyPractice21({
  practiceId,
  practiceName,
  practiceLink,
  userId,
  checkedItems,
  onToggle,
  onReset,
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

    // Проверяем, все ли дни выполнены без пропусков (последовательно с первого дня)
    let allDaysCompletedWithoutGaps = false;
    if (completed === 21) {
      // Проверяем, что все дни от 1 до последнего выполнены
      allDaysCompletedWithoutGaps = days.every(day => checkedItems[day.key]);
    } else if (completed > 0) {
      // Находим первый выполненный день
      const firstCompletedIndex = days.findIndex(day => checkedItems[day.key]);
      if (firstCompletedIndex !== -1) {
        // Проверяем, что все дни от первого выполненного до последнего выполненного выполнены
        const lastCompletedIndex = days.length - 1 - days.slice().reverse().findIndex(day => checkedItems[day.key]);
        allDaysCompletedWithoutGaps = days
          .slice(firstCompletedIndex, lastCompletedIndex + 1)
          .every(day => checkedItems[day.key]);
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

    return { completed, percent, streak, currentDay, allDaysCompletedWithoutGaps };
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

  // Обработчик сброса
  const handleReset = () => {
    if (window.confirm('Вы уверены, что хотите сбросить прогресс 21-дневной практики? Все отметки будут удалены.')) {
      // Удаляем все дни
      days.forEach(day => {
        if (checkedItems[day.key]) {
          onToggle(day.key);
        }
      });
      // Удаляем дату начала
      localStorage.removeItem(`${practiceId}_start_date`);
      setStartDate(null);
      // Вызываем callback для сброса основного чекбокса
      if (onReset) {
        onReset();
      }
    }
  };

  return (
    <div className="border-3 border-orange-400 dark:border-orange-600 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-orange-900/30 p-6 mb-6 shadow-xl shadow-orange-200/50 dark:shadow-orange-900/30 relative overflow-hidden">
      {/* Декоративный элемент для выделения */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 dark:from-yellow-500/10 dark:to-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <div className="relative z-10">
      {/* Заголовок с ссылкой и кнопкой сброса */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Дневник 21 день</h3>
          <div className="flex flex-wrap items-center gap-3">
            {practiceLink && (
              <a
                href={practiceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline font-medium"
              >
                Открыть чат для сдачи отчета →
              </a>
            )}
            <button
              onClick={() => {
                const reportTemplate = `День ${stats.currentDay || 'X'}/21

🦌 Лось
🐳 Личность
✅ 1 шаг

🟢 Я молодец: 
🟢 Он молодец: 
🟢 Они молодцы: 

👻 Развивающий дискомфорт
🎁 Награда
@бадди`;

                navigator.clipboard.writeText(reportTemplate).then(() => {
                  // Можно добавить уведомление об успешном копировании
                  alert('Форма отчета скопирована!');
                }).catch(() => {
                  alert('Не удалось скопировать. Попробуйте еще раз.');
                });
              }}
              className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium px-3 py-1 border border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            >
              Форма отчета • Скопировать
            </button>
          </div>
        </div>
        {startDate && (
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 transition-colors whitespace-nowrap"
            title="Сбросить прогресс и начать заново"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Статистика */}
      <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
        {stats.streak > 0 && (
          <span className="px-3 py-1 bg-orange-500 dark:bg-orange-600 text-white text-xs font-bold rounded-full">
            🔥 {stats.streak} день{stats.streak === 1 ? '' : stats.streak < 5 ? 'а' : 'ей'}
          </span>
        )}
        {stats.allDaysCompletedWithoutGaps && stats.completed === 21 && (
          <span className="px-3 py-1 bg-green-500 dark:bg-green-600 text-white text-xs font-bold rounded-full">
            ✓ Все дни выполнены!
          </span>
        )}
      </div>

      {/* Прогресс-бар */}
      <div className="mb-6 h-2 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden">
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
          const isToday = dayDate ? dayDate.toDateString() === new Date().toDateString() : false;
          const isPast = dayDate ? dayDate < new Date() && dayDate.toDateString() !== new Date().toDateString() : false;
          const isFuture = dayDate ? dayDate > new Date() : false;

          return (
            <button
              key={key}
              onClick={() => !isFuture && handleDayToggle(key, day)}
              disabled={isFuture}
              className={`
                relative w-10 h-10 rounded-full border-2 transition-all duration-200
                flex items-center justify-center text-xs font-bold
                ${isChecked 
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-600 dark:border-orange-400 text-white shadow-md scale-105' 
                  : isToday
                  ? 'bg-orange-100 dark:bg-orange-900/40 border-orange-400 dark:border-orange-500 border-dashed text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60'
                  : isPast
                  ? 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  : 'bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed'
                }
                ${!isFuture ? 'hover:scale-110 active:scale-95' : ''}
              `}
              title={dayDate ? `${day}. ${formatDate(dayDate)}` : `День ${day}`}
            >
              {isChecked ? (
                <span className="text-white text-sm">✓</span>
              ) : (
                <span className={isToday ? 'text-orange-700 dark:text-orange-300' : isPast ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}>
                  {day}
                </span>
              )}
              {isToday && !isChecked && (
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] text-orange-600 dark:text-orange-400 font-bold">
                  •
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Подсказка */}
      {!startDate && (
        <div className="mt-4 p-3 bg-white dark:bg-black rounded-lg border border-orange-200 dark:border-orange-800 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Отметь первый день, чтобы начать отсчёт 21 дня
          </p>
        </div>
      )}
      
      {/* Информация о доступности чекбокса практики */}
      {stats.completed === 21 && stats.allDaysCompletedWithoutGaps && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 text-center">
          <p className="text-xs text-green-700 dark:text-green-300 font-semibold">
            ✓ Все 21 день выполнены без пропусков! Теперь можно отметить практику в модуле.
          </p>
        </div>
      )}
      </div>
    </div>
  );
}

