import React from 'react';
import { Sun, Moon, ShieldCheck, Minus, Square, X } from 'lucide-react';

interface TopHeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ darkMode, setDarkMode }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-1">
      {/* Left Title Area */}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
          Welcome back! <span className="text-base">👋</span>
        </p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 flex-wrap">
          <span className="text-[#7C3AED]">Result</span> Analyzer
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          High-performance result extraction, storage & analytics system
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 self-start sm:self-auto flex-wrap gap-y-2">
        {/* Theme Toggle Pill */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setDarkMode(false)}
            className={`p-1.5 rounded-full transition ${!darkMode ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Light Mode"
            aria-label="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDarkMode(true)}
            className={`p-1.5 rounded-full transition ${darkMode ? 'bg-slate-700 text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            title="Dark Mode"
            aria-label="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* System Healthy Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>System Healthy</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
        </div>
      </div>
    </div>
  );
};
