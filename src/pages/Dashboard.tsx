import React from 'react';
import { TopHeader } from '../components/TopHeader';
import { FeaturedActionCards } from '../components/FeaturedActionCards';
import { FooterBar } from '../components/FooterBar';
import { Student, ScrapeConfig, DatabaseStats, LogEntry, PipelineStats } from '../types';
import { Users, TrendingUp, Award, Trophy, Zap, Database, Search, ShieldCheck, ShieldAlert, Activity, Info } from 'lucide-react';

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
  onSearchChange: (val: string) => void;
  searchValue: string;
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
  onDownloadCsv,
  onSearchChange,
  searchValue
}: DashboardProps) {
  const isPipelineRunning = pipelineStats?.status === 'running';

  const totalStudents = dbStats?.total_students ?? 0;
  const avgSgpa = dbStats?.avg_sgpa && dbStats.avg_sgpa > 0 ? dbStats.avg_sgpa.toFixed(2) : '0.00';
  const avgCgpa = dbStats?.avg_cgpa && dbStats.avg_cgpa > 0 ? dbStats.avg_cgpa.toFixed(2) : '0.00';
  const highestSgpa = dbStats?.highest_sgpa && dbStats.highest_sgpa > 0 ? dbStats.highest_sgpa.toFixed(2) : '0.00';
  const highestCgpa = dbStats?.highest_cgpa && dbStats.highest_cgpa > 0 ? dbStats.highest_cgpa.toFixed(2) : '0.00';
  const isConnected = dbStats?.mongodb_connected ?? false;

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-white dark:bg-black print:bg-white print:p-0">
      <div className="p-6 lg:p-8 max-w-7xl w-full mx-auto print:hidden">
        {/* Top Header */}
        <TopHeader darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Dashboard Search Box */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-550/10 dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {/* Live Pipeline Monitor Strip if running */}
        {isPipelineRunning && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Extraction Pipeline Running</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Processed {pipelineStats?.processed_tickets} of {pipelineStats?.total_tickets} tickets ({pipelineStats?.items_per_minute} req/m)
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPipelineMonitor}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-750 text-white rounded-xl text-[11px] font-bold transition cursor-pointer"
            >
              Monitor Ingestion
            </button>
          </div>
        )}

        {/* Featured Action Cards */}
        <FeaturedActionCards
          onOpenClassResult={onOpenClassResult}
          onOpenSubjectResult={onOpenSubjectResult}
        />

        {/* Stats Redesign Grid */}
        <div className="mt-8">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 px-1">
            System Insights & Stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Stat 1: Total Students */}
            <div className="bg-slate-50/50 dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 flex items-center space-x-4 shadow-3xs transition hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Students</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{totalStudents}</h3>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Institutes isolated</p>
              </div>
            </div>

            {/* Stat 2: Average SGPA */}
            <div className="bg-slate-50/50 dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 flex items-center space-x-4 shadow-3xs transition hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-550 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average SGPA</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{avgSgpa}</h3>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Active semester records</p>
              </div>
            </div>

            {/* Stat 3: Average CGPA */}
            <div className="bg-slate-50/50 dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 flex items-center space-x-4 shadow-3xs transition hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-550 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average CGPA</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{avgCgpa}</h3>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Cumulative average</p>
              </div>
            </div>

            {/* Stat 4: Highest SGPA */}
            <div className="bg-slate-50/50 dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 flex items-center space-x-4 shadow-3xs transition hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-550 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Highest SGPA</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{highestSgpa}</h3>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Top semester performer</p>
              </div>
            </div>

            {/* Stat 5: Highest CGPA */}
            <div className="bg-slate-50/50 dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 flex items-center space-x-4 shadow-3xs transition hover:shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-550 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Highest CGPA</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">{highestCgpa}</h3>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Top overall performer</p>
              </div>
            </div>

            {/* Stat 6: Database Status */}
            <div className="bg-slate-50/50 dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 flex items-center space-x-4 shadow-3xs transition hover:shadow-xs">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-450'
              }`}>
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Database Status</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {isConnected ? 'MongoDB Connected' : 'Disconnected'}
                  </h3>
                  {isConnected ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">State: {isConnected ? 'Active' : 'Offline'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Note */}
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">
            Performance metrics are generated based on the currently available extracted student records. Adding more records may update the average SGPA, CGPA, and overall analytics.
          </p>
        </div>
      </div>

      {/* Window Footer Status Bar */}
      <FooterBar />
    </div>
  );
}
