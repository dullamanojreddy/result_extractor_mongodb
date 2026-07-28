import React from 'react';
import { TopHeader } from '../components/TopHeader';
import { FeaturedActionCards } from '../components/FeaturedActionCards';
import { DashboardWidgets } from '../components/DashboardWidgets';
import { ResultsTable } from '../components/ResultsTable';
import { FooterBar } from '../components/FooterBar';
import { Student, ScrapeConfig, DatabaseStats, LogEntry, PipelineStats } from '../types';

interface DashboardProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  pipelineStats: PipelineStats | null;
  dbStats: DatabaseStats | null;
  logs: LogEntry[];
  config: ScrapeConfig;
  students: Student[];
  onOpenClassResult: () => void;
  onOpenSubjectResult: () => void;
  onOpenPipelineMonitor: () => void;
  onOpenLogs: () => void;
  onDownloadExcel: () => void;
  onDownloadCsv: () => void;
}

export default function Dashboard({
  darkMode,
  setDarkMode,
  pipelineStats,
  dbStats,
  logs,
  config,
  students,
  onOpenClassResult,
  onOpenSubjectResult,
  onOpenPipelineMonitor,
  onOpenLogs,
  onDownloadExcel,
  onDownloadCsv
}: DashboardProps) {
  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-white dark:bg-black print:bg-white print:p-0">
      <div className="p-6 lg:p-8 max-w-7xl w-full mx-auto print:hidden">
        {/* Top Header */}
        <TopHeader darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Featured Action Cards */}
        <FeaturedActionCards
          onOpenClassResult={onOpenClassResult}
          onOpenSubjectResult={onOpenSubjectResult}
        />

        {/* Row 3: 3 Bottom Dashboard Widgets */}
        <DashboardWidgets
          pipelineStats={pipelineStats}
          dbStats={dbStats}
          logs={logs}
          config={config}
          onOpenPipelineMonitor={onOpenPipelineMonitor}
          onOpenLogs={onOpenLogs}
        />

        {/* Latest Fetched Records */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Latest Fetched Records</h3>
            <span className="text-xs text-slate-500 italic font-mono">Showing last 5 updates</span>
          </div>
          <ResultsTable
            students={students}
            onDownloadExcel={onDownloadExcel}
            onDownloadCsv={onDownloadCsv}
          />
        </div>
      </div>

      {/* Window Footer Status Bar */}
      <FooterBar />
    </div>
  );
}
