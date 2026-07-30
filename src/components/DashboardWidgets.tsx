import React from 'react';
import { Zap, ClipboardList, Shield, CheckCircle2, Globe, Code2, Layers, HardDrive } from 'lucide-react';
import { PipelineStats, DatabaseStats, LogEntry, ScrapeConfig } from '../types';

interface DashboardWidgetsProps {
  pipelineStats: PipelineStats | null;
  dbStats: DatabaseStats | null;
  logs: LogEntry[];
  config: ScrapeConfig;
  onOpenPipelineMonitor: () => void;
  onOpenLogs: () => void;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  pipelineStats,
  dbStats,
  logs,
  config,
  onOpenPipelineMonitor,
  onOpenLogs
}) => {
  // Only show pipeline data if pipeline is actually running
  const isPipelineRunning = pipelineStats?.status === 'running';
  
  const totalTickets = pipelineStats?.total_tickets && pipelineStats.total_tickets > 0 ? pipelineStats.total_tickets : 0;
  
  const fetchQueueSize = pipelineStats?.fetch_queue_size ?? 0;
  const fetchProgress = totalTickets > 0 ? Math.min(100, Math.max(0, Math.round(((totalTickets - fetchQueueSize) / totalTickets) * 100))) : 0;

  const cachedHtmlCount = pipelineStats?.cached_html_count ?? 0;
  const htmlProgress = totalTickets > 0 ? Math.min(100, Math.round((cachedHtmlCount / totalTickets) * 100)) : 0;

  const parseQueueSize = pipelineStats?.parse_queue_size ?? 0;
  const parseProgress = totalTickets > 0 ? Math.min(100, Math.max(0, Math.round(((totalTickets - parseQueueSize) / totalTickets) * 100))) : 0;

  const dbQueueSize = pipelineStats?.db_queue_size ?? 0;
  const dbProgress = totalTickets > 0 ? Math.min(100, Math.round((dbQueueSize / totalTickets) * 100)) : 0;

  const activeWorkers = (pipelineStats?.active_fetch_workers ?? 0) +
                        (pipelineStats?.active_parse_workers ?? 0);
  const speed = pipelineStats?.items_per_minute ?? 0;

  // Format ETA
  const estSeconds = pipelineStats?.estimated_seconds_remaining ?? 0;
  const mins = Math.floor(estSeconds / 60);
  const secs = estSeconds % 60;
  const hrs = Math.floor(mins / 60);
  const etaStr = `${String(hrs).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Derive recent jobs from actual logs
  const jobLogs = logs.filter(l => l.message.includes('Class Result') || l.message.includes('Pipeline') || l.message.includes('range') || l.message.includes('students'));
  
  // Only show last 4 job-related logs, no fake data
  const recentJobs = jobLogs.slice(0, 4).map((log, idx) => ({
    range: log.message,
    time: log.timestamp,
    status: 'Completed',
    progress: 100,
    isLive: false
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* WIDGET 1: PIPELINE MONITOR - Only show when running */}
      {isPipelineRunning && (
        <div className="bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            {/* Widget Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Pipeline Monitor (Live)</span>
              </h3>
              <button
                onClick={onOpenPipelineMonitor}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                View Details
              </button>
            </div>

            {/* Queue Progress Rows */}
            <div className="space-y-4">
              {/* Fetch Queue */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fetch Queue</span>
                    <span className="font-mono text-[11px] text-slate-400">{totalTickets}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{fetchProgress}%</span>
                    <span className="text-slate-400">{fetchQueueSize} pending</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: `${fetchProgress}%` }}></div>
                </div>
              </div>

              {/* HTML Queue */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                    <Code2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>HTML Queue</span>
                    <span className="font-mono text-[11px] text-slate-400">{cachedHtmlCount}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{htmlProgress}%</span>
                    <span className="text-slate-400">{cachedHtmlCount} cached</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: `${htmlProgress}%` }}></div>
                </div>
              </div>

              {/* Parse Queue */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Parse Queue</span>
                    <span className="font-mono text-[11px] text-slate-400">{parseQueueSize}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{parseProgress}%</span>
                    <span className="text-slate-400">{parseQueueSize} pending</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: `${parseProgress}%` }}></div>
                </div>
              </div>

              {/* DB Queue */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    <span>DB Queue</span>
                    <span className="font-mono text-[11px] text-slate-400">{dbQueueSize}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{dbProgress}%</span>
                    <span className="text-slate-400">{dbQueueSize} pending</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: `${dbProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Metrics Summary */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/20 px-3 py-2 rounded-xl">
            <span>• Workers: {activeWorkers}</span>
            <span>• Speed: {speed} students/min</span>
            <span>• ETA: {etaStr}</span>
          </div>
        </div>
      )}

      {/* WIDGET 2: RECENT JOBS - Only show if there are actual job logs */}
      {recentJobs.length > 0 && (
        <div className="bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            {/* Widget Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Recent Jobs</span>
              </h3>
              <button
                onClick={onOpenLogs}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Job List */}
            <div className="space-y-3">
              {recentJobs.map((job, idx) => (
                <div key={idx} className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white font-mono">
                        {job.range}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 pl-3.5">{job.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {job.status}
                    </span>
                    <div className="w-7 h-7 rounded-full border-2 text-[10px] font-black flex items-center justify-center text-slate-800 dark:text-slate-200 border-emerald-500">
                      {job.progress}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WIDGET 3: SYSTEM STATUS - Show real status only */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
        <div>
          {/* Widget Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>System Status</span>
            </h3>
          </div>

          {/* Status Key-Values */}
          <div className="space-y-3.5 text-xs">
            {/* Row 1: Database */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Database</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {dbStats?.mongodb_connected ? 'MongoDB Connected' : 'Not Connected'}
                </span>
                <CheckCircle2 className={`w-4 h-4 ${dbStats?.mongodb_connected ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950' : 'text-rose-500 fill-rose-100 dark:fill-rose-950'}`} />
              </div>
            </div>

            {/* Row 2: Total Students */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Students</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {dbStats?.total_students || 0}
                </span>
              </div>
            </div>

            {/* Row 3: Pipeline Status */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Pipeline</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {isPipelineRunning ? 'Running' : 'Idle'}
                </span>
              </div>
            </div>

            {/* Row 4: Last Activity */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Last Activity</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {logs.length > 0 ? logs[0].timestamp : 'No activity'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
