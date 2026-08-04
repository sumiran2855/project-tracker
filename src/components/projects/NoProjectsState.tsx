import { FolderOpen } from 'lucide-react';

export function NoProjectsState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-3xs">
      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
        <FolderOpen className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-808">No projects found</h3>
      <p className="text-xs text-slate-450 max-w-sm">
        Try adjusting your search criteria, filter, or create a brand new project tracker.
      </p>
    </div>
  );
}
