import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GlobalTask, TasksCalendarProps } from '@/types/tasks.types';

export function TasksCalendar({
  filteredTasks,
  currentCalendarDate,
  setCurrentCalendarDate,
  setSelectedTask,
}: TasksCalendarProps) {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  // Number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Start offset (day of the week of the 1st of the month, 0 for Sunday)
  const startOffset = new Date(year, month, 1).getDay();

  const calendarCells = [];

  // Blank cells before the 1st of the month
  for (let i = 0; i < startOffset; i++) {
    calendarCells.push(<div key={`blank-${i}`} className="min-h-24 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl opacity-40" />);
  }

  // Days 1 to daysInMonth
  for (let day = 1; day <= daysInMonth; day++) {
    const yearStr = String(year);
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

    const dayTasks = filteredTasks.filter(t => t.dueDate === dateStr);

    calendarCells.push(
      <div 
        key={`day-${day}`} 
        className="min-h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 flex flex-col justify-between hover:shadow-sm transition-shadow duration-200 group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">{day}</span>
          {dayTasks.length > 0 && (
            <span className="h-1.8 w-1.8 rounded-full bg-indigo-500" />
          )}
        </div>
        
        <div className="space-y-1.5 flex-1 mt-2 overflow-y-auto max-h-16 scrollbar-none">
          {dayTasks.map(task => (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="w-full text-left truncate text-[8px] font-bold px-1.5 py-0.5 rounded-lg border flex flex-col cursor-pointer bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-colors"
              title={task.title}
            >
              <span className="text-slate-800 dark:text-slate-200 truncate">{task.title}</span>
              <span className="text-[6px] text-indigo-500 dark:text-indigo-400 uppercase tracking-widest truncate">{task.projectName}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Add extra empty slots to round up to full row
  const totalSlots = startOffset + daysInMonth;
  const remainingSlots = (7 - (totalSlots % 7)) % 7;
  for (let i = 0; i < remainingSlots; i++) {
    calendarCells.push(<div key={`blank-end-${i}`} className="min-h-24 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-2xl opacity-40" />);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month];

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Calendar Month Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">{monthName} {year}</h3>
          </div>
          
          {/* Month Switcher Buttons */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-955 border border-slate-200/60 dark:border-slate-800 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="h-6 w-6 rounded-lg hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 active:scale-95"
              title="Previous Month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="h-6 w-6 rounded-lg hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 active:scale-95"
              title="Next Month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Workspace Tracker</span>
      </div>

      {/* Days of the week */}
      <div className="grid grid-cols-7 gap-2.5 text-center text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7 gap-2.5">
        {calendarCells}
      </div>
    </div>
  );
}
