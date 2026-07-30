import React from 'react';
import { Database, FileText, BarChart3, Terminal, Settings, Sun, Moon, Server, RefreshCw } from 'lucide-react';
import { DatabaseStats } from '../types';

interface HeaderProps {
  stats: DatabaseStats | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenDocs: () => void;
  onOpenStats: () => void;
  onOpenLogs: () => void;
  onOpenSettings: () => void;
  onRefreshStats: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  darkMode,
  setDarkMode,
  onOpenDocs,
  onOpenStats,
  onOpenLogs,
  onOpenSettings,
  onRefreshStats,
  loading
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 font-bold text-lg">
            RA
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight tracking-tight flex items-center gap-2">
              Result Analyzer
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                v1.0.0
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {stats?.driver === 'mongodb' ? 'MongoDB Database & Result Management System' : 'Local Database & Result Management System'}
            </p>
          </div>
        </div>

        {/* Center Quick Stats */}
        {stats && (
          <div className="hidden lg:flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>Total in DB: <strong className="text-slate-900 dark:text-white font-semibold">{stats.total_students}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
              <span>Found: <strong>{stats.found_students}</strong></span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
              <span>Missing (-): <strong>{stats.missing_students}</strong></span>
            </div>
            {stats.avg_sgpa > 0 && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30">
                <span>Avg SGPA: <strong>{stats.avg_sgpa}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Right Tools & Theme */}
        <div className="flex items-center space-x-2">
          {/* Status Indicator */}
          {stats?.driver === 'mongodb' ? (
            <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mr-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="font-semibold">MongoDB Live</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold">Local Storage</span>
            </div>
          )}

          <button
            onClick={onRefreshStats}
            title="Refresh Database Stats"
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenStats}
            title="Database Statistics"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLogs}
            title="Live Logs Terminal"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <Terminal className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenDocs}
            title="Project Documentation (14 docs)"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition flex items-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">Docs</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark / Light Theme"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
