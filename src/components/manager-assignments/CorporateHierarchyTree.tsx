import { Building, ChevronDown, ChevronRight, Briefcase, User, Folder } from 'lucide-react';
import type { CorporateHierarchyTreeProps } from '@/types/manager-assignments.types';

export function CorporateHierarchyTree({
  managers,
  expandedNodes,
  toggleNode,
  setSelectedManagerId,
  getInitials,
  getGradient,
  getBgColor,
}: CorporateHierarchyTreeProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-md shadow-slate-100/50 dark:shadow-none space-y-6 animate-scaleIn">
      <div>
        <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
          Organizational Team Hierarchy
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Visual reporting lines of all manager assignments and active projects</p>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">

        {/* Root Node */}
        <div>
          <button
            onClick={() => toggleNode('root')}
            className="flex items-center gap-2.5 w-full text-left font-black text-slate-800 dark:text-slate-100 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            <div className="p-0.5 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200/40 dark:border-indigo-900/35 rounded text-indigo-600 dark:text-indigo-400">
              {expandedNodes['root'] ? <ChevronDown className="h-4 w-4 transition-transform duration-200" /> : <ChevronRight className="h-4 w-4 transition-transform duration-200" />}
            </div>
            <Building className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
            <span>Corporate Hierarchy root</span>
          </button>

          {expandedNodes['root'] && (
            <div className="pl-6 border-l-2 border-dashed border-indigo-100 dark:border-indigo-900/35 mt-4 space-y-6 pt-1 animate-fadeIn">

              {managers.length === 0 ? (
                <p className="text-xs text-slate-400 italic font-semibold">No manager assignments configured yet.</p>
              ) : (
                managers.map(manager => {
                  const nodeKey = `m-${manager.id}`;
                  const isExpanded = expandedNodes[nodeKey];

                  return (
                    <div key={manager.id} className="space-y-3 relative group/mBranch">

                      {/* Connector Dot */}
                      <div className="absolute -left-[30px] top-4 w-2.5 h-2.5 rounded-full bg-indigo-200 dark:bg-indigo-900 border-2 border-white dark:border-slate-900 ring-1 ring-indigo-50 dark:ring-indigo-950/30" />

                      {/* Manager Node */}
                      <div className="flex items-center justify-between group/mNode w-full py-1">
                        <button
                          onClick={() => toggleNode(nodeKey)}
                          className="flex items-center gap-2.5 text-left font-bold text-slate-800 dark:text-slate-100 text-xs hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          <div className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400">
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </div>
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-2xs shrink-0 bg-gradient-to-br ${getGradient(manager.name)}`}>
                            {getInitials(manager.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-100">{manager.name}</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-550 font-semibold">{manager.email}</span>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200/40 dark:border-indigo-900/35 px-2 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 shadow-3xs">
                            {manager.teamLeads.length + manager.employees.length} scoped members
                          </span>
                        </button>
                        <button
                          onClick={() => setSelectedManagerId(manager.id)}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30 px-3 py-1 rounded-xl transition-all border border-indigo-100 dark:border-indigo-900/30 opacity-0 group-hover/mNode:opacity-100 cursor-pointer shadow-3xs"
                        >
                          Edit Team
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="pl-6 border-l-2 border-slate-100 dark:border-slate-800 mt-2 space-y-4 pt-1 ml-4 relative animate-slideIn">

                          {/* Team Leads section under this manager */}
                          {manager.teamLeads.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Team Leads</p>
                              <div className="space-y-2.5">
                                {manager.teamLeads.map(tl => (
                                  <div key={tl.id} className="group/item relative flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-3xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs transition-all">
                                    <div className="flex items-center gap-3">
                                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-3xs shrink-0 ${getBgColor(tl.name)}`}>
                                        {getInitials(tl.name)}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{tl.name}</span>
                                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/35 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-3xs">
                                            <Briefcase className="h-2.5 w-2.5" /> Team Lead
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold">{tl.email}</p>
                                      </div>
                                    </div>
                                    {/* Projects list */}
                                    {tl.projects.length > 0 ? (
                                      <div className="flex items-center gap-1.5">
                                        {tl.projects.slice(0, 2).map(p => (
                                          <span key={p.id} className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-500 dark:text-slate-400 shadow-3xs">
                                            <Folder className="h-2.5 w-2.5 text-indigo-500" />
                                            {p.name}
                                          </span>
                                        ))}
                                        {tl.projects.length > 2 && (
                                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">+{tl.projects.length - 2}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[9px] text-slate-400 italic pl-1.5">No assigned projects</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Employees section under this manager */}
                          {manager.employees.length > 0 && (
                            <div className="space-y-3 pt-2">
                              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Employees</p>
                              <div className="space-y-2.5">
                                {manager.employees.map(emp => (
                                  <div key={emp.id} className="group/item relative flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-3xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs transition-all">
                                    <div className="flex items-center gap-3">
                                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-3xs shrink-0 ${getBgColor(emp.name)}`}>
                                        {getInitials(emp.name)}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{emp.name}</span>
                                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/35 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-3xs">
                                            <User className="h-2.5 w-2.5" /> Employee
                                          </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold">{emp.email}</p>
                                      </div>
                                    </div>
                                    {/* Projects list */}
                                    {emp.projects.length > 0 ? (
                                      <div className="flex items-center gap-1.5">
                                        {emp.projects.slice(0, 2).map(p => (
                                          <span key={p.id} className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-500 dark:text-slate-400 shadow-3xs">
                                            <Folder className="h-2.5 w-2.5 text-indigo-500" />
                                            {p.name}
                                          </span>
                                        ))}
                                        {emp.projects.length > 2 && (
                                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">+{emp.projects.length - 2}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[9px] text-slate-400 italic pl-1.5">No assigned projects</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {manager.teamLeads.length === 0 && manager.employees.length === 0 && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">No team leads or employees assigned to this manager.</p>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
