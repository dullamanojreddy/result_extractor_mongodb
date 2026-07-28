import React from 'react';
import { Play, Search, Settings, BarChart2, Terminal, Zap, Trophy, UserCheck } from 'lucide-react';

interface ActionPanelProps {
  onOpenClassResult: () => void;
  onOpenSubjectResult: () => void;
  onOpenPipelineMonitor: () => void;
  onOpenStudentSearch: () => void;
  onOpenAdvancedAnalytics: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenLogs: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  onOpenClassResult,
  onOpenSubjectResult,
  onOpenPipelineMonitor,
  onOpenStudentSearch,
  onOpenAdvancedAnalytics,
  onOpenSettings,
  onOpenStats,
  onOpenLogs
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Result Extractor & Enterprise Analytics
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          High-performance Producer-Consumer pipeline, local raw HTML caching, normalized MySQL persistence & real-time analytics.
        </p>
      </div>

      {/* Main 3 Prominent Dashboard Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
        {/* CARD 1: PIPELINE MONITOR (Indigo / Zap) */}
        <button
          onClick={onOpenPipelineMonitor}
          className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-500 hover:to-indigo-800 text-white p-6 rounded-2xl shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/35 transition-all duration-300 transform hover:-translate-y-0.5 text-left border border-indigo-500/30 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 bg-white/10 dark:bg-white/15 backdrop-blur-md rounded-xl text-white font-bold text-2xl group-hover:scale-110 transition-transform">
              ⚡
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full text-white/90">
              Pipeline Engine
            </span>
          </div>

          <div>
            <h3 className="text-xl font-extrabold mb-1 tracking-tight flex items-center gap-2">
              PIPELINE MONITOR
            </h3>
            <p className="text-xs text-indigo-100/90 leading-relaxed">
              Launch multi-worker scraper, view real-time queue backpressure, worker threads & throughput.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-semibold text-indigo-100">
            <span>Open Pipeline Live Monitor</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* CARD 2: CLASS RESULT (Red) */}
        <button
          onClick={onOpenClassResult}
          className="group relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white p-6 rounded-2xl shadow-lg shadow-rose-600/25 hover:shadow-xl hover:shadow-rose-600/35 transition-all duration-300 transform hover:-translate-y-0.5 text-left border border-rose-500/30 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 bg-white/10 dark:bg-white/15 backdrop-blur-md rounded-xl text-white font-bold text-2xl group-hover:scale-110 transition-transform">
              🔴
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full text-white/90">
              Batch Ingestion
            </span>
          </div>

          <div>
            <h3 className="text-xl font-extrabold mb-1 tracking-tight flex items-center gap-2">
              CLASS RESULT
            </h3>
            <p className="text-xs text-rose-100/90 leading-relaxed">
              Scrape or fetch range of hall tickets. Checks DB cache before scraping missing tickets.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-semibold text-rose-100">
            <span>Start Class Result Batch</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>

        {/* CARD 3: SUBJECT WISE RESULT (Blue) */}
        <button
          onClick={onOpenSubjectResult}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-sky-600/25 hover:shadow-xl hover:shadow-sky-600/35 transition-all duration-300 transform hover:-translate-y-0.5 text-left border border-sky-500/30 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="p-3 bg-white/10 dark:bg-white/15 backdrop-blur-md rounded-xl text-white font-bold text-2xl group-hover:scale-110 transition-transform">
              🔵
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full text-white/90">
              Subject Search
            </span>
          </div>

          <div>
            <h3 className="text-xl font-extrabold mb-1 tracking-tight flex items-center gap-2">
              SUBJECT WISE RESULT
            </h3>
            <p className="text-xs text-sky-100/90 leading-relaxed">
              Query grades by subject name (e.g. "Database Management Systems"). Fast DB query with auto-fetch.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-semibold text-sky-100">
            <span>Query Subject Grades</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      </div>

      {/* Secondary Quick Utilities Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onOpenStudentSearch}
          className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 transition flex items-center gap-2"
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
          <span>🎓 Candidate Grade Card</span>
        </button>

        <button
          onClick={onOpenAdvancedAnalytics}
          className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 hover:bg-purple-100 transition flex items-center gap-2"
        >
          <Trophy className="w-3.5 h-3.5 text-purple-500" />
          <span>🏆 Rank & Toppers Analytics</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>⚙ MySQL & System Settings</span>
        </button>

        <button
          onClick={onOpenStats}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
        >
          <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
          <span>📊 DB Overview</span>
        </button>

        <button
          onClick={onOpenLogs}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span>📝 Logs</span>
        </button>
      </div>
    </div>
  );
};
