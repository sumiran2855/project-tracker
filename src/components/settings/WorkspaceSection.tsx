import { Check } from 'lucide-react';
import type { WorkspaceSectionProps } from '@/types/settings.types';
import { useTheme } from 'next-themes';

export function WorkspaceSection({
  workspace,
  setWorkspace,
}: WorkspaceSectionProps) {
  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f43f5e', '#a855f7'];
  const { setTheme } = useTheme();

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Workspace Preferences</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Control layout defaults and presentation formats.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Default Entry View</label>
          <select
            value={workspace.defaultView}
            onChange={e => setWorkspace(w => ({ ...w, defaultView: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="Dashboard" className="dark:bg-slate-900">Dashboard</option>
            <option value="Projects" className="dark:bg-slate-900">Projects Hub</option>
            <option value="Tasks Board" className="dark:bg-slate-900">Tasks Board</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Theme Mode</label>
          <select
            value={workspace.theme}
            onChange={e => {
              const val = e.target.value;
              setWorkspace(w => ({ ...w, theme: val as any }));
              setTheme(val);
            }}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="light" className="dark:bg-slate-900">Light Mode</option>
            <option value="dark" className="dark:bg-slate-900">Dark Mode</option>
            <option value="system" className="dark:bg-slate-900">Follow System</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Calendar Week Starts On</label>
          <select
            value={workspace.weekStart}
            onChange={e => setWorkspace(w => ({ ...w, weekStart: e.target.value as any }))}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="Sunday" className="dark:bg-slate-900">Sunday</option>
            <option value="Monday" className="dark:bg-slate-900">Monday</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Brand Accent Color</label>
          <div className="flex items-center gap-2 mt-1">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setWorkspace(w => ({ ...w, accentTint: color }))}
                className="h-7 w-7 rounded-full border border-slate-200/50 flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              >
                {workspace.accentTint === color && (
                  <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
