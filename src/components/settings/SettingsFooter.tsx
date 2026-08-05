import { Check, AlertCircle, Loader2, Save } from 'lucide-react';
import type { SettingsFooterProps } from '@/types/settings.types';

export function SettingsFooter({
  isSavingPrefs,
  saveSuccess,
  prefsSaveError,
  handleSave,
}: SettingsFooterProps) {
  return (
    <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center justify-between">
      <div>
        {saveSuccess && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
            <Check className="h-3.5 w-3.5 stroke-[3px]" />
            Preferences saved successfully!
          </span>
        )}
        {prefsSaveError && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-xl">
            <AlertCircle className="h-3.5 w-3.5" />
            {prefsSaveError}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSavingPrefs}
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white px-4.5 py-2.5 text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed min-w-[130px]"
      >
        {isSavingPrefs ? (
          <><Loader2 className="h-3.5 w-3.5 animate-spin" /><span>Saving...</span></>
        ) : (
          <><Save className="h-4.5 w-4.5" /><span>Save Changes</span></>
        )}
      </button>
    </div>
  );
}
