import { X, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-955/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] p-6 sm:p-7 space-y-5 animate-scaleIn">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-655 border border-red-100/30">
              <Trash2 className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">Delete Issue</h3>
          </div>
          <button 
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <p className="text-xs font-bold text-slate-500 leading-relaxed">
          Are you sure you want to delete this issue? This action is permanent and cannot be undone.
        </p>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-655 text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-750 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}
