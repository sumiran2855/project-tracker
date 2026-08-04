import React from 'react';
import { Settings, Sparkles } from 'lucide-react';

export function SettingsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2 text-indigo-650 font-bold text-xs uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          <span>App Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100/30 shadow-xs">
            <Settings className="h-4.5 w-4.5" />
          </div>
          Settings Hub
        </h1>
        <p className="text-xs text-slate-455 font-medium mt-1">
          Personalize your workspace layout, configure alert triggers, and manage storage parameters.
        </p>
      </div>
    </div>
  );
}
