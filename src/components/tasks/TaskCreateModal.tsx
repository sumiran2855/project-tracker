import { CheckSquare, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Employee } from '@/types/projects.types';
import type { Task, TaskCreateModalProps } from '@/types/tasks.types';
import { Portal } from '@/components/ui/portal';

export function TaskCreateModal({
  isOpen,
  onClose,
  newTaskProject,
  setNewTaskProject,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDesc,
  setNewTaskDesc,
  newTaskStatus,
  setNewTaskStatus,
  newTaskPriority,
  setNewTaskPriority,
  newTaskStartDate,
  setNewTaskStartDate,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskAssignees,
  setNewTaskAssignees,
  projects,
  availableMembers,
  user,
  isEmployee,
  onSubmit,
}: TaskCreateModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-slate-950/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-none p-6 sm:p-8 space-y-4 animate-scaleIn max-h-[90vh] flex flex-col mt-12 sm:mt-16 mb-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30">
              <CheckSquare className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">Add New Task</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto pr-1.5 space-y-5 no-scrollbar py-0.5">
          
          {/* Project Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Destination Project</label>
            <div className="relative">
              <select
                required
                value={newTaskProject}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setNewTaskProject(selectedId);
                  const targetProj = projects.find((p) => p.id === selectedId);
                  if (targetProj && Array.isArray(targetProj.members)) {
                    const targetMemberNames = new Set(targetProj.members.map((m: any) => (m.name || '').toLowerCase()));
                    if (user && user.name && isEmployee) {
                      setNewTaskAssignees([user.name]);
                    } else {
                      setNewTaskAssignees((prev) => prev.filter((name) => targetMemberNames.has(name.toLowerCase())));
                    }
                  }
                }}
                className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-808 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
              >
                <option value="" disabled className="dark:bg-slate-900">Select project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement webhook handlers"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-808 dark:text-slate-100 font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</label>
            <textarea
              rows={3}
              placeholder="Detail the deliverables..."
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-808 dark:text-slate-100 font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all resize-none"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</label>
              <div className="relative">
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value as Task['status'])}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-808 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                >
                  <option value="To Do" className="dark:bg-slate-900">To Do</option>
                  <option value="In Progress" className="dark:bg-slate-900">In Progress</option>
                  <option value="In Review" className="dark:bg-slate-900">In Review</option>
                  <option value="Done" className="dark:bg-slate-900">Done</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Priority</label>
              <div className="relative">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                  className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-808 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer pr-10"
                >
                  <option value="Low" className="dark:bg-slate-900">Low</option>
                  <option value="Medium" className="dark:bg-slate-900">Medium</option>
                  <option value="High" className="dark:bg-slate-900">High</option>
                  <option value="Urgent" className="dark:bg-slate-900">Urgent</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Start Date</label>
              <input
                type="date"
                value={newTaskStartDate}
                onChange={(e) => setNewTaskStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-808 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Due Date</label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-808 dark:text-slate-100 font-bold focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/8 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Assignees selection */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Assign Task To</label>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const selectedTaskProj = projects.find((p) => p.id === newTaskProject);
                let taskAssignableMembers: any[] = [];
                if (selectedTaskProj) {
                  const projMembers = selectedTaskProj.members || [];
                  taskAssignableMembers = projMembers.filter((m: any) => {
                    const foundMember = availableMembers.find(
                      (am) => am.id === m.userId || am.id === m.id || am.name?.toLowerCase() === m.name?.toLowerCase()
                    );
                    const roleStr = foundMember?.role || m.role || '';
                    const r = roleStr.toLowerCase();
                    const lowerName = (m.name || '').toLowerCase();
                    const lowerCreatorName = (user?.name || '').toLowerCase();

                    // Admin and client should never be visible
                    if (r === 'admin' || r === 'client') return false;
                    if (lowerName.includes('admin') || lowerName.includes('client')) return false;

                    // Only Manager, TL, and Employee can be visible
                    const isAllowedRole = r === 'manager' || r === 'team lead' || r === 'employee';
                    if (!isAllowedRole && (roleStr !== '' || lowerName.includes('admin') || lowerName.includes('client'))) return false;

                    // If manager or TL is creating the task, they should not be visible (cannot assign to themselves)
                    const creatorRole = user?.role?.toLowerCase() || '';
                    if (creatorRole === 'manager' || creatorRole === 'team lead') {
                      if (m.userId === user?.id || m.id === user?.id || lowerName === lowerCreatorName) {
                        return false;
                      }
                    }

                    return true;
                  });
                } else {
                  taskAssignableMembers = availableMembers.filter((m) => {
                    const r = (m.role || '').toLowerCase();
                    const lowerName = (m.name || '').toLowerCase();
                    const lowerCreatorName = (user?.name || '').toLowerCase();

                    // Admin and client should never be visible
                    if (r === 'admin' || r === 'client') return false;
                    if (lowerName.includes('admin') || lowerName.includes('client')) return false;

                    // Only Manager, TL, and Employee can be visible
                    const isAllowedRole = r === 'manager' || r === 'team lead' || r === 'employee';
                    if (!isAllowedRole && (m.role !== '' || lowerName.includes('admin') || lowerName.includes('client'))) return false;

                    // If manager or TL is creating the task, they should not be visible
                    const creatorRole = user?.role?.toLowerCase() || '';
                    if (creatorRole === 'manager' || creatorRole === 'team lead') {
                      if (m.id === user?.id || lowerName === lowerCreatorName) {
                        return false;
                      }
                    }

                    return true;
                  });
                }

                if (isEmployee && user && user.name) {
                  return (
                    <div className="flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3.5 py-2 rounded-xl text-xs font-bold w-fit">
                      <div className="h-5.5 w-5.5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white font-black shrink-0">
                        {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span>Assigned to you ({user.name})</span>
                    </div>
                  );
                }

                if (taskAssignableMembers.length === 0) {
                  return <p className="text-xs text-slate-400 font-medium italic">No team members assigned to this project.</p>;
                }

                return taskAssignableMembers.map((member) => {
                  const isSelected = newTaskAssignees.includes(member.name);
                  return (
                    <button
                      key={member.name}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setNewTaskAssignees(newTaskAssignees.filter(m => m !== member.name));
                        } else {
                          setNewTaskAssignees([...newTaskAssignees, member.name]);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-200 cursor-pointer",
                        isSelected 
                          ? "bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 shadow-3xs ring-1 ring-indigo-200/50 dark:ring-indigo-900/30"
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-3xs"
                      )}
                    >
                      <div className={cn("h-5.5 w-5.5 rounded-full flex items-center justify-center text-[8px] text-white font-black shadow-3xs shrink-0", member.bg || 'bg-indigo-500')}>
                        {member.initials || member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span>{member.name}</span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer active:scale-98"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-650/10 transition-all cursor-pointer active:scale-98"
            >
              Create Task
            </button>
          </div>

        </form>
      </div>
    </div>
    </Portal>
  );
}
