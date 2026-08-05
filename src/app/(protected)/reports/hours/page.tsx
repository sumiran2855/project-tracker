'use client';

import { useReportsHoursService } from '@/services/useReportsHoursService';
import { ReportsHoursHeader } from '@/components/reports-hours/ReportsHoursHeader';
import { ReportsHoursKpis } from '@/components/reports-hours/ReportsHoursKpis';
import { ReportsHoursFilters } from '@/components/reports-hours/ReportsHoursFilters';
import { ReportsHoursAnalytics } from '@/components/reports-hours/ReportsHoursAnalytics';
import { ReportsHoursLedger } from '@/components/reports-hours/ReportsHoursLedger';

export default function EnhancedHoursReportPage() {
  const service = useReportsHoursService();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      
      {/* Hero Header Section */}
      <ReportsHoursHeader
        loading={service.loading}
        onSync={service.loadData}
        onBack={() => service.router.push('/dashboard')}
      />

      {/* Main Workspace Container */}
      <div className="max-w-8xl mx-auto px-6 sm:px-8 py-6 space-y-6">
        
        {/* KPI Metrics Cards Grid */}
        <ReportsHoursKpis
          totalHours={service.totalHours}
          entriesCount={service.filteredLogs.length}
          avgDailyHours={service.avgDailyHours}
          mostActiveProject={service.mostActiveProject}
        />

        {/* Dynamic Filters Widget Card */}
        <ReportsHoursFilters
          presetFilter={service.presetFilter}
          setPresetFilter={service.setPresetFilter}
          customStartDate={service.customStartDate}
          setCustomStartDate={service.setCustomStartDate}
          customEndDate={service.customEndDate}
          setCustomEndDate={service.setCustomEndDate}
          searchText={service.searchText}
          setSearchText={service.setSearchText}
          activeTab={service.activeTab}
          setActiveTab={service.setActiveTab}
        />

        {/* Tab Content Display */}
        {service.activeTab === 'analytics' ? (
          <ReportsHoursAnalytics
            projectBreakdown={service.projectBreakdown}
            totalHours={service.totalHours}
            uniqueLoggedProjectsReport={service.uniqueLoggedProjectsReport}
            employeeBreakdown={service.employeeBreakdown}
            dayBreakdown={service.dayBreakdown}
          />
        ) : (
          <ReportsHoursLedger
            loading={service.loading}
            sortBy={service.sortBy}
            setSortBy={service.setSortBy}
            paginatedLogs={service.paginatedLogs}
            filteredLogs={service.filteredLogs}
            currentPage={service.currentPage}
            setCurrentPage={service.setCurrentPage}
            totalPages={service.totalPages}
          />
        )}

      </div>
    </div>
  );
}
