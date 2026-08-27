import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

export function SettingsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>App Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3 mt-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 shadow-xs">
            <Settings className="h-4.5 w-4.5" />
          </div>
          Settings Hub
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          Personalize your workspace layout, configure alert triggers, and manage storage parameters.
        </p>
      </div>
    </div>
  );
}
