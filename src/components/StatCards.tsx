import React from 'react';
import { Users, UserCheck, AlertCircle, TrendingUp, Database } from 'lucide-react';
import { DatabaseStats } from '../types';

interface StatCardsProps {
  stats: DatabaseStats | null;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const totalStudents = stats?.total_students ?? 0;
  const foundStudents = stats?.found_students ?? 0;
  const missingStudents = stats?.missing_students ?? 0;
  const avgSgpa = stats?.avg_sgpa && stats.avg_sgpa > 0 ? stats.avg_sgpa.toFixed(2) : '0.00';

  const totalSubjects = stats?.total_subjects ?? 0;
  const storageSizeMb = stats ? ((totalStudents * 0.15) + (totalSubjects * 0.05)).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* CARD 1: TOTAL STUDENTS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Students</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{totalStudents}</h3>
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">In Database</p>
        </div>
      </div>

      {/* CARD 2: FOUND STUDENTS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Found Students</p>
          <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{foundStudents}</h3>
          <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">Successfully fetched</p>
        </div>
      </div>

      {/* CARD 3: MISSING STUDENTS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Missing Students</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{missingStudents}</h3>
          <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">Not found / failed</p>
        </div>
      </div>

      {/* CARD 4: AVERAGE SGPA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Average SGPA</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{avgSgpa}</h3>
          <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Across all students</p>
        </div>
      </div>

      {/* CARD 5: LOCAL STORAGE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Local Storage</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {storageSizeMb} <span className="text-xs font-bold text-slate-500">MB</span>
          </h3>
          <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Database Size</p>
        </div>
      </div>
    </div>
  );
};
