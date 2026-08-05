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
        "bg-white border rounded-2xl p-4 shadow-3xs cursor-pointer transition-all hover:shadow-xs group flex items-start gap-4 border-slate-200 relative overflow-hidden animate-scaleIn",
        !item.read ? "border-l-4 border-l-indigo-500 bg-indigo-50/10" : ""
      )}
    >
      {/* Type Icon indicator */}
      <div className={cn(
        "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
        item.type === 'issue' ? "bg-rose-50 text-rose-600" :
        item.type === 'task' ? "bg-indigo-50 text-indigo-650" :
        item.type === 'project' ? "bg-amber-50 text-amber-600" :
        "bg-emerald-50 text-emerald-600"
      )}>
        {item.type === 'issue' ? '!' : item.type === 'task' ? '✓' : item.type === 'project' ? 'P' : 'S'}
      </div>

      {/* Main Content details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-black text-slate-808 tracking-tight leading-snug truncate">
            {item.title}
          </h4>
          {!item.read && (
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">
          {item.description}
        </p>
        <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-slate-404 mt-2">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>{item.time}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300 mx-0.5" />
          <span className="uppercase text-slate-455">{item.type} alert</span>
        </div>
      </div>

      {/* Trash option */}
      <button
        onClick={(e) => onDelete(item.id, e)}
        className="h-8 w-8 rounded-full bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 flex items-center justify-center text-slate-400 hover:text-rose-600 cursor-pointer transition-all opacity-0 group-hover:opacity-100 shadow-3xs"
        title="Delete notification"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
