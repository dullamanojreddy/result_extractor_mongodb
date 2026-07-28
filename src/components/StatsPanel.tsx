import React from 'react';
import { X, Database, Trophy, Trash2, Award, TrendingUp, Users, BookOpen } from 'lucide-react';
import { DatabaseStats } from '../types';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DatabaseStats | null;
  onClearDatabase: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  isOpen,
  onClose,
  stats,
  onClearDatabase
}) => {
  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-indigo-500/5 dark:bg-indigo-500/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChartIcon className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              MySQL Database Statistics
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Stat Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Total Records</span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total_students}</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 block mb-1">Found Students</span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.found_students}</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40">
              <span className="text-xs text-amber-700 dark:text-amber-400 block mb-1">Missing (-)</span>
              <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats.missing_students}</p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40">
              <span className="text-xs text-indigo-700 dark:text-indigo-400 block mb-1">Avg SGPA</span>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.avg_sgpa}</p>
            </div>
          </div>

          {/* Top Performers Leaderboard */}
          {stats.top_performers && stats.top_performers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Top Performers Leaderboard</span>
              </h4>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4">Rank</th>
                      <th className="py-2.5 px-4">Hall Ticket</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4 text-center">SGPA</th>
                      <th className="py-2.5 px-4 text-center">CGPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 bg-white dark:bg-[#121212]">
                    {stats.top_performers.map((tp, idx) => (
                      <tr key={tp.hall_ticket} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-4 font-bold text-slate-400">
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {tp.hall_ticket}
                        </td>
                        <td className="py-2.5 px-4 font-medium">{tp.name}</td>
                        <td className="py-2.5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                          {tp.sgpa}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {tp.cgpa}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Database Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 justify-between items-center">
            <button
              onClick={onClearDatabase}
              className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-900 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Clear Database</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function BarChartIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
