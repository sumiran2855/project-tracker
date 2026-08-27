import { Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationItemCardProps } from '@/types/notifications.types';

export function NotificationItemCard({
  item,
  onMarkAsRead,
  onDelete,
}: NotificationItemCardProps) {
  return (
    <div
      onClick={() => onMarkAsRead(item.id)}
      className={cn(
        "bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-3xs cursor-pointer transition-all hover:shadow-xs group flex items-start gap-4 border-slate-200 dark:border-slate-800 relative overflow-hidden animate-scaleIn",

        !item.read ? "border-l-4 border-l-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20" : ""
      )}
    >
      {/* Type Icon indicator */}
      <div className={cn(
        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
        item.type === 'issue' ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400" :
        item.type === 'task' ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" :
        item.type === 'project' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" :
        "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
      )}>
        {item.type === 'issue' ? '!' : item.type === 'task' ? '✓' : item.type === 'project' ? 'P' : 'S'}
      </div>

      {/* Main Content details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug truncate">
            {item.title}
          </h4>
          {!item.read && (
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5 leading-relaxed">
          {item.description}
        </p>
        <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-400 dark:text-slate-500 mt-2">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>{item.time}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300 mx-0.5" />
          <span className="uppercase text-slate-400 dark:text-slate-500">{item.type} alert</span>
        </div>
      </div>

      {/* Trash option */}
      <button
        onClick={(e) => onDelete(item.id, e)}
        className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-100 dark:border-slate-800 hover:border-rose-100 dark:hover:border-rose-900/30 flex items-center justify-center text-slate-400 dark:text-slate-550 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-all opacity-0 group-hover:opacity-100 shadow-3xs"
        title="Delete notification"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
