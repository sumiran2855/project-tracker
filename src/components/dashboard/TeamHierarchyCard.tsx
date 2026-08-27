import { Users } from 'lucide-react';
import type { TeamHierarchyCardProps } from '@/types/dashboard.types';


export function TeamHierarchyCard({ hierarchyTree }: TeamHierarchyCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Team Hierarchy</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">Subordinate structure & alignments</p>
        
        <div className="max-h-[290px] overflow-y-auto pr-1 space-y-4">
          {hierarchyTree && hierarchyTree.length > 0 ? (
            hierarchyTree.map((mgr) => (
              <div key={mgr.id || 'mgr'} className="space-y-3.5">
                {/* Manager node */}
                <div className="flex items-center gap-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100/40 dark:border-indigo-900/30 shadow-3xs">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 ${mgr.bg || 'bg-indigo-500'}`}>
                    {mgr.initials || 'M'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">{mgr.name}</p>
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-100/50 dark:border-indigo-900/30 px-1.5 py-0.5 text-[8px] font-black uppercase text-indigo-700 dark:text-indigo-405 tracking-wider mt-0.5">
                      Manager
                    </span>
                  </div>
                </div>

                {/* Leads and children */}
                <div className="pl-5 border-l border-dashed border-slate-200 dark:border-slate-800 ml-4 space-y-4">
                  {mgr.leads && mgr.leads.map((lead: any) => (
                    <div key={lead.id || 'lead'} className="space-y-3 relative">
                      {/* Connector line for lead */}
                      <div className="absolute -left-5 top-4 w-4 h-0.5 border-t border-dashed border-slate-200 dark:border-slate-800" />
                      
                      {/* Lead node */}
                      <div className="flex items-center gap-2.5 bg-amber-50/40 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-100/30 dark:border-amber-900/30 shadow-3xs">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0 ${lead.bg || 'bg-amber-500'}`}>
                          {lead.initials || 'TL'}
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{lead.name}</p>
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950 border border-amber-100/55 dark:border-amber-900/30 px-1 py-0.2 text-[7px] font-black uppercase text-amber-805 dark:text-amber-400 tracking-wider mt-0.5">
                            Team Lead
                          </span>
                        </div>
                      </div>

                      {/* Employees under lead */}
                      {lead.children && lead.children.length > 0 && (
                        <div className="pl-5 border-l border-dashed border-slate-200 dark:border-slate-800 ml-3.5 space-y-2 relative">
                          {lead.children.map((emp: any) => (
                            <div key={emp.id || 'emp'} className="relative flex items-center gap-2.5 bg-emerald-50/30 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100/30 dark:border-emerald-900/30 shadow-3xs">
                              {/* Connector line for employee */}
                              <div className="absolute -left-5 top-4 w-4.5 h-0.5 border-t border-dashed border-slate-200 dark:border-slate-800" />
                              
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[8px] font-black shrink-0 ${emp.bg || 'bg-emerald-500'}`}>
                                {emp.initials || 'E'}
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{emp.name}</p>
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-100/50 dark:border-emerald-900/30 px-1 py-0.2 text-[7px] font-black uppercase text-emerald-805 dark:text-emerald-400 tracking-wider mt-0.5">
                                  Employee
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Standalone Employees under manager */}
                  {mgr.standalone && mgr.standalone.length > 0 && (
                    <div className="space-y-2">
                      {mgr.standalone.map((emp: any) => (
                        <div key={emp.id || 'emp-standalone'} className="relative flex items-center gap-2.5 bg-emerald-50/30 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100/30 dark:border-emerald-900/30 shadow-3xs ml-0">
                          <div className="absolute -left-5 top-4 w-4 h-0.5 border-t border-dashed border-slate-200 dark:border-slate-800" />
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[8px] font-black shrink-0 ${emp.bg || 'bg-emerald-500'}`}>
                            {emp.initials || 'E'}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{emp.name}</p>
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-100/50 dark:border-emerald-900/30 px-1 py-0.2 text-[7px] font-black uppercase text-emerald-805 dark:text-emerald-400 tracking-wider mt-0.5">
                              Employee
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Team Assigned</p>
              <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-[220px]">
                No Team is assigned to you yet. Please contact your manager or administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
