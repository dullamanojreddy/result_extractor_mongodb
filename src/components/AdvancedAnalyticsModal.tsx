import React, { useState, useEffect } from 'react';
import { X, Trophy, AlertTriangle, BarChart3, TrendingUp, Users, Award, ShieldAlert } from 'lucide-react';
import { AdvancedAnalytics } from '../types';
import { getAdvancedAnalytics } from '../services/api';

interface AdvancedAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedAnalyticsModal: React.FC<AdvancedAnalyticsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'toppers' | 'thresholds' | 'branches'>('toppers');
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAdvancedAnalytics()
        .then(data => setAnalytics(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                📊 Advanced Academic Analytics & Performance Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toppers, rank distribution, branch wise breakdown & failure risk detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('toppers')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'toppers'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Top Performers (SGPA / CGPA)</span>
          </button>

          <button
            onClick={() => setActiveTab('thresholds')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'thresholds'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SGPA Thresholds & Risk Watch</span>
          </button>

          <button
            onClick={() => setActiveTab('branches')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'branches'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Branch Breakdown & Grade Spread</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="text-center py-12 text-slate-400 text-xs">
              Analyzing database metrics...
            </div>
          )}

          {!loading && analytics && (
            <>
              {/* System Overview Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Total Students</p>
                  <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{analytics.system_stats?.total_students || 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Found</p>
                  <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{analytics.system_stats?.found_students || 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">Missing</p>
                  <p className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">{analytics.system_stats?.missing_students || 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Average SGPA</p>
                  <p className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{analytics.system_stats?.avg_sgpa || 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Local Storage</p>
                  <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{analytics.system_stats?.local_storage || '1.5 MB'}</p>
                </div>
              </div>
            </>
          )}

          {!loading && analytics && activeTab === 'toppers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top SGPA */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Top 10 SGPA Rank List</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-2.5">Rank</th>
                        <th className="p-2.5">Hall Ticket</th>
                        <th className="p-2.5">Candidate</th>
                        <th className="p-2.5 text-right font-mono">SGPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {analytics.top_sgpa_10.map((st, i) => (
                        <tr key={st.hall_ticket} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5 font-bold text-slate-400 font-mono">#{i + 1}</td>
                          <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">{st.hall_ticket}</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">{st.name}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{st.sgpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top CGPA */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>Top 10 CGPA Cumulative Rank</span>
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-2.5">Rank</th>
                        <th className="p-2.5">Hall Ticket</th>
                        <th className="p-2.5">Candidate</th>
                        <th className="p-2.5 text-right font-mono">CGPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {analytics.top_cgpa_10.map((st, i) => (
                        <tr key={st.hall_ticket} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5 font-bold text-slate-400 font-mono">#{i + 1}</td>
                          <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">{st.hall_ticket}</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">{st.name}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-cyan-600 dark:text-cyan-400">{st.cgpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!loading && analytics && activeTab === 'thresholds' && (
            <div className="space-y-6">
              {/* Summary stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Distinction (SGPA ≥ 9.0)</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{analytics.students_above_9.length} <span className="text-xs font-normal">students</span></span>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="block text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">Needs Support (SGPA &lt; 6.0)</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{analytics.students_below_6.length} <span className="text-xs font-normal">students</span></span>
                </div>

                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="block text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Backlogs / F-Grades</span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{analytics.failed_students.length} <span className="text-xs font-normal">students</span></span>
                </div>
              </div>

              {/* Distinction List */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-2">
                  Students Scoring Above 9.0 SGPA ({analytics.students_above_9.length})
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="p-2">Hall Ticket</th>
                        <th className="p-2">Name</th>
                        <th className="p-2 text-right">SGPA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {analytics.students_above_9.map(st => (
                        <tr key={st.hall_ticket}>
                          <td className="p-2 font-mono font-semibold text-slate-900 dark:text-white">{st.hall_ticket}</td>
                          <td className="p-2 text-slate-700 dark:text-slate-300">{st.name}</td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-600">{st.sgpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!loading && analytics && activeTab === 'branches' && (
            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Overall Grade Distribution Across All Enrolled Courses
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {Object.entries(analytics.grade_distribution).map(([grade, count]) => (
                  <div key={grade} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                    <span className="block text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{grade}</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{count}</span>
                    <span className="block text-[10px] text-slate-400">subject awards</span>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                  Branch Performance Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(analytics.branch_breakdown).map(([branch, bData]) => {
                    const data = bData as { total: number; avg_sgpa: number };
                    return (
                      <div key={branch} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-slate-900 dark:text-white">{branch}</span>
                          <span className="text-[10px] font-bold text-slate-400">{data.total} students</span>
                        </div>
                        <div className="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                          {data.avg_sgpa} <span className="text-xs font-normal text-slate-400">Avg SGPA</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
