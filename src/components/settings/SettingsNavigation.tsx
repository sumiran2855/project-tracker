import { User, Bell, Sliders, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TabType, SettingsNavigationProps } from '@/types/settings.types';

export function SettingsNavigation({
  activeTab,
  setActiveTab,
}: SettingsNavigationProps) {
  const tabs = [
    { id: 'profile' as TabType, label: 'User Profile', icon: User },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'workspace' as TabType, label: 'Preferences', icon: Sliders },
    { id: 'data' as TabType, label: 'Data & Storage', icon: Database },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs space-y-1">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer',
              isActive 
                ? 'bg-indigo-50/70 text-indigo-650' 
                : 'text-slate-505 hover:bg-slate-50 hover:text-slate-805'
            )}
          >
            <Icon className={cn('h-4 w-4', isActive ? 'text-indigo-600' : 'text-slate-400')} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
