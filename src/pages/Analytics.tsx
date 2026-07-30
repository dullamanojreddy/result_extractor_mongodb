import React, { useState, useEffect } from 'react';
import { Trophy, AlertTriangle, BarChart3, TrendingUp, Users, Award, ShieldAlert } from 'lucide-react';
import { AdvancedAnalytics } from '../types';
import { FooterBar } from '../components/FooterBar';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'toppers' | 'thresholds' | 'branches'>('toppers');
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    import { getAdvancedAnalytics } from '../services/api';
    getAdvancedAnalytics()
      .then(data => setAnalytics(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-white dark:bg-black">
      <div className="p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 animate-in fade-in duration-500 print:hidden">
        
        {/* 1. Header Section */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-800/30">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">Academic Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400">Toppers, rank distribution, and performance reports</p>
          </div>
        </div>

        {/* 2. Loading State or Analytics Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Analyzing database metrics and generating reports...
            </p>
          </div>
        )}

        {!loading && !analytics && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
            No analytics data available. Fetch some student results first to see reports!
          </div>
        )}

        {!loading && analytics && (
          <>
            {/* 3. Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800/80 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Total Students</p>
                <p className="text-2xl font-mono font-black text-slate-900 dark:text-white">
                  {analytics.system_stats?.total_students ?? 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500 mb-1">Found</p>
                <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {analytics.system_stats?.found_students ?? 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-1">Missing</p>
                <p className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400">
                  {analytics.system_stats?.missing_students ?? 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-500 mb-1">Average SGPA</p>
                <p className="text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400">
                  {analytics.system_stats?.avg_sgpa ?? 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/5 dark:bg-cyan-950/10 border border-cyan-100 dark:border-cyan-900/30 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-500 mb-1">Average CGPA</p>
                <p className="text-2xl font-mono font-black text-cyan-600 dark:text-cyan-400">
                  {analytics.system_stats?.avg_cgpa ?? 0}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800/80 shadow-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Storage</p>
                <p className="text-2xl font-mono font-black text-slate-900 dark:text-white">
                  {analytics.system_stats?.local_storage ?? '0 B'}
                </p>
              </div>
            </div>

            {/* 4. Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8">
              <button
                onClick={() => setActiveTab('toppers')}
                className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'toppers'
                    ? 'border-[#6B21A8] dark:border-purple-500 text-[#6B21A8] dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Top Performers</span>
              </button>

              <button
                onClick={() => setActiveTab('thresholds')}
                className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'thresholds'
                    ? 'border-[#6B21A8] dark:border-purple-500 text-[#6B21A8] dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Risk Watch</span>
              </button>

              <button
                onClick={() => setActiveTab('branches')}
                className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'branches'
                    ? 'border-[#6B21A8] dark:border-purple-500 text-[#6B21A8] dark:text-purple-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Grade Spread & Branches</span>
              </button>
            </div>

            {/* 5. Tab Content: Top Performers */}
            {activeTab === 'toppers' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SGPA Toppers */}
                <div className="space-y-4 bg-white dark:bg-[#121212] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Top 10 SGPA Rank List</span>
                  </h4>
                  <div className="border border-slate-100 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                          <th className="p-3 font-semibold">Rank</th>
                          <th className="p-3 font-semibold">Hall Ticket</th>
                          <th className="p-3 font-semibold">Candidate</th>
                          <th className="p-3 text-right font-mono font-semibold">SGPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {analytics.top_sgpa_10.map((st, i) => (
                          <tr key={st.hall_ticket} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="p-3 font-bold text-slate-400 font-mono">#{i + 1}</td>
                            <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{st.hall_ticket}</td>
                            <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{st.name}</td>
                            <td className="p-3 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">{st.sgpa}</td>
                          </tr>
                        ))}
                        {analytics.top_sgpa_10.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-400 dark:text-slate-500 italic">No topper data found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CGPA Toppers */}
                <div className="space-y-4 bg-white dark:bg-[#121212] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-xs">
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>Top 10 CGPA Cumulative Rank</span>
                  </h4>
                  <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                          <th className="p-3 font-semibold">Rank</th>
                          <th className="p-3 font-semibold">Hall Ticket</th>
                          <th className="p-3 font-semibold">Candidate</th>
                          <th className="p-3 text-right font-mono font-semibold">CGPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {analytics.top_cgpa_10.map((st, i) => (
                          <tr key={st.hall_ticket} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="p-3 font-bold text-slate-400 font-mono">#{i + 1}</td>
                            <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{st.hall_ticket}</td>
                            <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{st.name}</td>
                            <td className="p-3 text-right font-mono font-black text-cyan-600 dark:text-cyan-400">{st.cgpa}</td>
                          </tr>
                        ))}
                        {analytics.top_cgpa_10.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-slate-400 dark:text-slate-500 italic">No topper data found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Tab Content: Risk Watch */}
            {activeTab === 'thresholds' && (
              <div className="space-y-6 bg-white dark:bg-[#121212] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-xs">
                {/* Summary stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-200/30">
                    <span className="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1">Distinction (SGPA ≥ 9.0)</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {analytics.students_above_9?.length ?? 0} <span className="text-xs font-normal">students</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-950/10 border border-amber-200/30">
                    <span className="block text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 mb-1">Needs Support (SGPA &lt; 6.0)</span>
                    <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      {analytics.students_below_6?.length ?? 0} <span className="text-xs font-normal">students</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-950/10 border border-rose-200/30">
                    <span className="block text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 mb-1">Backlogs / F-Grades</span>
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                      {analytics.failed_students?.length ?? 0} <span className="text-xs font-normal">students</span>
                    </span>
                  </div>
                </div>

                {/* Distinction List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Students Scoring Above 9.0 SGPA ({analytics.students_above_9?.length ?? 0})</span>
                    </h4>
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
                            <th className="p-2.5 font-semibold">Hall Ticket</th>
                            <th className="p-2.5 font-semibold">Name</th>
                            <th className="p-2.5 text-right font-mono font-semibold">SGPA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {analytics.students_above_9?.map(st => (
                            <tr key={st.hall_ticket} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                              <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">{st.hall_ticket}</td>
                              <td className="p-2.5 font-medium text-slate-700 dark:text-slate-300">{st.name}</td>
                              <td className="p-2.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">{st.sgpa}</td>
                            </tr>
                          ))}
                          {(!analytics.students_above_9 || analytics.students_above_9.length === 0) && (
                            <tr>
                              <td colSpan={3} className="p-4 text-center text-slate-400 dark:text-slate-500 italic">No distinction students</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Failed Students List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Students with Backlogs / F-Grades ({analytics.failed_students?.length ?? 0})</span>
                    </h4>
                    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
                            <th className="p-2.5 font-semibold">Hall Ticket</th>
                            <th className="p-2.5 font-semibold">Name</th>
                            <th className="p-2.5 text-right font-mono font-semibold">SGPA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {analytics.failed_students?.map(st => (
                            <tr key={st.hall_ticket} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                              <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">{st.hall_ticket}</td>
                              <td className="p-2.5 font-medium text-slate-700 dark:text-slate-300">{st.name}</td>
                              <td className="p-2.5 text-right font-mono font-black text-rose-600 dark:text-rose-400">{st.sgpa}</td>
                            </tr>
                          ))}
                          {(!analytics.failed_students || analytics.failed_students.length === 0) && (
                            <tr>
                              <td colSpan={3} className="p-4 text-center text-slate-400 dark:text-slate-500 italic">No backlogs reported</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Tab Content: Grade Spread & Branches */}
            {activeTab === 'branches' && (
              <div className="space-y-8 bg-white dark:bg-[#121212] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-xs">
                {/* Grade Distribution */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-4">
                    Overall Grade Distribution Across All Enrolled Courses
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                    {Object.entries(analytics.grade_distribution ?? {}).map(([grade, count]) => (
                      <div key={grade} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center shadow-2xs">
                        <span className="block text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mb-0.5">{grade}</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{count}</span>
                        <span className="block text-[10px] text-slate-400">subject awards</span>
                      </div>
                    ))}
                    {Object.keys(analytics.grade_distribution ?? {}).length === 0 && (
                      <div className="col-span-full py-4 text-center text-slate-400 dark:text-slate-500 italic">No grade distribution metrics available</div>
                    )}
                  </div>
                </div>

                {/* Branch breakdown */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white mb-4">
                    Branch Performance Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(analytics.branch_breakdown ?? {}).map(([branch, bData]) => {
                      const data = bData as { total: number; avg_sgpa: number };
                      return (
                        <div key={branch} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2 shadow-2xs">
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
                    {Object.keys(analytics.branch_breakdown ?? {}).length === 0 && (
                      <div className="col-span-full py-4 text-center text-slate-400 dark:text-slate-500 italic">No branch metrics found</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <FooterBar />
    </div>
  );
}
