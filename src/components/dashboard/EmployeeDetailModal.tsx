'use client';

import React from 'react';
import { X, Mail, Shield, CheckCircle2, Clock, Calendar, CheckSquare, AlertCircle, Folder, ExternalLink, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id?: string;
    name: string;
    email?: string;
    role?: string;
    initials?: string;
    bg?: string;
  } | null;
  assignedItems?: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    actualHours?: number;
    itemType?: 'task' | 'issue';
    projectName?: string;
  }>;
  onSelectWorkItem?: (item: any) => void;
}

export function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  assignedItems = [],
  onSelectWorkItem,
}: EmployeeDetailModalProps) {
  if (!isOpen || !employee) return null;

  const initials = employee.initials || employee.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'EM';
  const role = employee.role || 'Employee';
  const email = employee.email || `${employee.name.toLowerCase().replace(/\s+/g, '.')}@company.com`;

  const totalItems = assignedItems.length;
  const completedItems = assignedItems.filter(item => item.status === 'Done' || item.status === 'Closed' || item.status === 'Resolved').length;
  const inProgressItems = assignedItems.filter(item => item.status === 'In Progress').length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const totalHoursLogged = assignedItems.reduce((acc, item) => acc + (item.actualHours || 0), 0);

  // Extract unique projects
  const uniqueProjects = Array.from(
    new Set(assignedItems.map(item => item.projectName).filter(Boolean))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col">
        
        {/* Header Ribbon / Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-650 to-violet-600 p-6 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className={cn(
              "h-16 w-16 rounded-2xl flex items-center justify-center text-xl text-white font-black shadow-lg border-2 border-white/30 shrink-0",
              employee.bg || "bg-indigo-500"
            )}>
              {initials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">{employee.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider text-white border border-white/20">
                  {role}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-indigo-100 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-200" />
                  {email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar">
          
          {/* Workload Highlights Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-3xs text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned Tasks</span>
              <p className="text-xl font-black text-slate-800 tracking-tight mt-0.5">{totalItems}</p>
              <p className="text-[10px] font-bold text-slate-450 mt-0.5">{completedItems} completed</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-3xs text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Completion</span>
              <p className="text-xl font-black text-indigo-650 tracking-tight mt-0.5">{completionPercentage}%</p>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-3xs text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Logged Hours</span>
              <p className="text-xl font-black text-amber-600 tracking-tight mt-0.5">{totalHoursLogged}h</p>
              <p className="text-[10px] font-bold text-slate-450 mt-0.5">Total recorded</p>
            </div>
          </div>

          {/* Active Projects */}
          {uniqueProjects.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-3xs space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-indigo-600" />
                Active Projects ({uniqueProjects.length})
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {uniqueProjects.map((proj, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-700 font-extrabold text-xs">
                    {proj}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Work Items List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-indigo-600" />
                Assigned Work Items ({totalItems})
              </h4>
              {totalItems > 0 && (
                <span className="text-[10px] font-bold text-slate-450">
                  {inProgressItems} in progress
                </span>
              )}
            </div>

            {totalItems === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center shadow-3xs">
                <User className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No active work items assigned</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  This employee currently has no tasks or issues assigned in this sprint.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                {assignedItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onSelectWorkItem) {
                        onSelectWorkItem(item);
                        onClose();
                      }
                    }}
                    className={cn(
                      "bg-white border border-slate-200 hover:border-indigo-400 p-3.5 rounded-2xl shadow-3xs transition-all flex items-center justify-between gap-3 group",
                      onSelectWorkItem ? "cursor-pointer hover:shadow-md" : ""
                    )}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full font-black text-[8px] uppercase tracking-wider",
                          item.itemType === 'issue' ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-indigo-50 text-indigo-650 border border-indigo-100"
                        )}>
                          {item.itemType === 'issue' ? 'Issue' : 'Task'}
                        </span>
                        {item.projectName && (
                          <span className="text-[10px] font-bold text-slate-400 truncate">
                            • {item.projectName}
                          </span>
                        )}
                      </div>
                      
                      <h5 className="text-xs font-black text-slate-800 truncate group-hover:text-indigo-650 transition-colors">
                        {item.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Priority */}
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md",
                        item.priority === 'Urgent' || item.priority === 'Critical' ? "bg-red-50 text-red-600" :
                        item.priority === 'High' ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {item.priority}
                      </span>

                      {/* Status */}
                      <span className={cn(
                        "text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border",
                        item.status === 'Done' || item.status === 'Closed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        item.status === 'In Progress' ? "bg-indigo-50 text-indigo-650 border-indigo-100" :
                        "bg-slate-50 text-slate-500 border-slate-100"
                      )}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 p-4 bg-white flex items-center justify-between shrink-0">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            Send Email
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-black transition-all cursor-pointer shadow-3xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
