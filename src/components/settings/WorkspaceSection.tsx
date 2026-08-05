import { Check } from 'lucide-react';
import type { WorkspaceSectionProps } from '@/types/settings.types';

export function WorkspaceSection({
  workspace,
  setWorkspace,
}: WorkspaceSectionProps) {
  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f43f5e', '#a855f7'];

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h3 className="text-sm font-black text-slate-800">Workspace Preferences</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Control layout defaults and presentation formats.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Default Entry View</label>
          <select
            value={workspace.defaultView}
            onChange={e => setWorkspace(w => ({ ...w, defaultView: e.target.value }))}
            className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-850 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="Dashboard">Dashboard</option>
            <option value="Projects">Projects Hub</option>
            <option value="Tasks Board">Tasks Board</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-455">Theme Mode</label>
          <select
            value={workspace.theme}
            onChange={e => setWorkspace(w => ({ ...w, theme: e.target.value as any }))}
            className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode (Coming Soon)</option>
            <option value="system">Follow System</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Calendar Week Starts On</label>
          <select
            value={workspace.weekStart}
            onChange={e => setWorkspace(w => ({ ...w, weekStart: e.target.value as any }))}
            className="w-full rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-855 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Brand Accent Color</label>
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
