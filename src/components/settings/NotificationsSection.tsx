import { Mail, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationsSectionProps } from '@/types/settings.types';

export function NotificationsSection({
  notifications,
  toggleNotification,
}: NotificationsSectionProps) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-sm font-black text-slate-800">Alert triggers & Notifications</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Toggle what triggers email digests and real-time alarms.</p>
      </div>

      <div className="space-y-4">
        {/* Category Header */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Email Communications</span>
        </div>

        <div className="space-y-3.5">
          {/* Toggle row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Task Assignments</p>
              <p className="text-[10px] text-slate-400">Receive alert when you are assigned to a new track.</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification('emailTasks')}
              className={cn(
                'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                notifications.emailTasks ? 'bg-indigo-600' : 'bg-slate-200'
              )}
            >
              <span className={cn(
                'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                notifications.emailTasks ? 'translate-x-4.5' : 'translate-x-0'
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Due Date Reminders</p>
              <p className="text-[10px] text-slate-400">Get warnings of upcoming tasks close to deadlines.</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification('emailDueDates')}
              className={cn(
                'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                notifications.emailDueDates ? 'bg-indigo-600' : 'bg-slate-200'
              )}
            >
              <span className={cn(
                'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                notifications.emailDueDates ? 'translate-x-4.5' : 'translate-x-0'
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Daily Activity Digest</p>
              <p className="text-[10px] text-slate-400">A clean daily summary of tasks completed and logged bugs.</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification('emailDigests')}
              className={cn(
                'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                notifications.emailDigests ? 'bg-indigo-600' : 'bg-slate-200'
              )}
            >
              <span className={cn(
                'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                notifications.emailDigests ? 'translate-x-4.5' : 'translate-x-0'
              )} />
            </button>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 pt-2">
          <Monitor className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Desktop & Alerts</span>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Direct Mentions</p>
              <p className="text-[10px] text-slate-400">Show floating banners immediately on updates.</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification('pushMentions')}
              className={cn(
                'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                notifications.pushMentions ? 'bg-indigo-600' : 'bg-slate-200'
              )}
            >
              <span className={cn(
                'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                notifications.pushMentions ? 'translate-x-4.5' : 'translate-x-0'
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Sound Alarms</p>
              <p className="text-[10px] text-slate-400">Play audio ping when changes happen in the board.</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification('soundAlerts')}
              className={cn(
                'relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                notifications.soundAlerts ? 'bg-indigo-600' : 'bg-slate-200'
              )}
            >
              <span className={cn(
                'pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                notifications.soundAlerts ? 'translate-x-4.5' : 'translate-x-0'
              )} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
