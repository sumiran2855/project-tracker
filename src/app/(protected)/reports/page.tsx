'use client';

import { useReportsService } from '@/services/useReportsService';
import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { ReportsKpis } from '@/components/reports/ReportsKpis';
import { ProjectWorkloadAllocation } from '@/components/reports/ProjectWorkloadAllocation';
import { TaskPrioritiesChart } from '@/components/reports/TaskPrioritiesChart';
import { LoggedHoursBarChart } from '@/components/reports/LoggedHoursBarChart';
import { TeamCapacityList } from '@/components/reports/TeamCapacityList';

export default function ReportsPage() {
  const service = useReportsService();

  if (!service.user || !service.canViewReports) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50/20 dark:bg-slate-900/20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fadeUp p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto space-y-6">
      
      {/* Reports Header */}
      <ReportsHeader 
        onRefresh={service.loadReportData} 
        onPrint={() => window.print()} 
      />

      {/* KPI Stats cards */}
      <ReportsKpis
        completionRate={service.completionRate}
        completedTasksCount={service.completedTasksCount}
        tasksCount={service.tasksCount}
        projectsCount={service.projectsCount}
        overdueTasksCount={service.overdueTasksCount}
      />

      {/* Bento grid reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Project Workload Allocation */}
        <ProjectWorkloadAllocation 
          projectStatsList={service.projectStatsList} 
        />

        {/* 2. Task Priorities distribution */}
        <TaskPrioritiesChart
          tasksCount={service.tasksCount}
          priorityStatsList={service.priorityStatsList}
        />

        {/* 3. Timesheet Logs (Vertical Bar Graph) */}
        <LoggedHoursBarChart
          user={service.user}
          router={service.router}
          weeklyTimeLogs={service.weeklyTimeLogs}
          dailyCapacity={service.dailyCapacity}
          weeklyCapacity={service.weeklyCapacity}
          isHoursMenuOpen={service.isHoursMenuOpen}
          setIsHoursMenuOpen={service.setIsHoursMenuOpen}
          hoveredHoursIndex={service.hoveredHoursIndex}
          setHoveredHoursIndex={service.setHoveredHoursIndex}
        />

        {/* 4. Team Workload Capacity */}
        <TeamCapacityList 
          teamStatsList={service.teamStatsList} 
        />

      </div>
    </div>
  );
}
