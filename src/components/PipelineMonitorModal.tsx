import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Square, RefreshCw, Cpu, Layers, HardDrive, Zap, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';
import { PipelineStats, ScrapeConfig } from '../types';
import API_URL from '../config/api';

interface PipelineMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScrapeConfig;
}

export const PipelineMonitorModal: React.FC<PipelineMonitorModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [runConfig, setRunConfig] = useState<ScrapeConfig>(config);
  const [loading, setLoading] = useState<boolean>(false);
  const [reparsing, setReparsing] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (isOpen) {
      const fetchStats = async () => {
        try {
          const res = await fetch(`${API_URL}/api/pipeline/stats`);
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        } catch (_) {}
      };

      fetchStats();
      interval = setInterval(fetchStats, 800);
    }
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartPipeline = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/pipeline/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runConfig)
      });
    } catch (err) {
      console.error('Failed to start pipeline', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePausePipeline = async () => {
    await fetch(`${API_URL}/api/pipeline/pause`, { method: 'POST' });
  };

  const handleResumePipeline = async () => {
    await fetch(`${API_URL}/api/pipeline/resume`, { method: 'POST' });
  };

  const handleStopPipeline = async () => {
    await fetch(`${API_URL}/api/pipeline/stop`, { method: 'POST' });
  };

  const handleReparseCachedHtml = async () => {
    setReparsing(true);
    try {
      const res = await fetch(`${API_URL}/api/raw-html/reparse`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully re-parsed ${data.reprocessed} cached HTML files into database.`);
      }
    } catch (err) {
      console.error('Failed to reparse html', err);
    } finally {
      setReparsing(false);
    }
  };

  const progressPercent = stats?.total_tickets
    ? Math.min(100, Math.round((stats.processed_tickets / stats.total_tickets) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ⚡ Producer-Consumer Pipeline Monitor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-threaded HTML fetchers, decoupled DOM parsers & batched database writers
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

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status & Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                stats?.status === 'running'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse'
                  : stats?.status === 'paused'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : stats?.status === 'completed'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  stats?.status === 'running' ? 'bg-emerald-500' : stats?.status === 'paused' ? 'bg-amber-500' : 'bg-slate-400'
                }`} />
                <span>{stats?.status || 'idle'}</span>
              </span>

              {stats?.status === 'running' && (
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 font-mono">
                  Ticket: <strong className="text-indigo-600 dark:text-indigo-400">{stats.current_hall_ticket}</strong>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {stats?.status !== 'running' && stats?.status !== 'paused' ? (
                <button
                  onClick={handleStartPipeline}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Pipeline</span>
                </button>
              ) : stats?.status === 'running' ? (
                <button
                  onClick={handlePausePipeline}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              ) : (
                <button
                  onClick={handleResumePipeline}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              )}

              {(stats?.status === 'running' || stats?.status === 'paused') && (
                <button
                  onClick={handleStopPipeline}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700 dark:text-slate-300">Overall Execution Progress</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">{progressPercent}% ({stats?.processed_tickets || 0} / {stats?.total_tickets || 0})</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 4 Pipeline Stage Queues */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stage 1: Fetch Queue */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-500" />
                  <span>Fetch Queue</span>
                </span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{stats?.fetch_queue_size || 0}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Active Workers: <strong className="text-slate-800 dark:text-slate-200">{stats?.active_fetch_workers || 0}</strong>
              </p>
            </div>

            {/* Stage 2: Parse Queue */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  <span>Parse Queue</span>
                </span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{stats?.parse_queue_size || 0}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Active Workers: <strong className="text-slate-800 dark:text-slate-200">{stats?.active_parse_workers || 0}</strong>
              </p>
            </div>

            {/* Stage 3: DB Queue */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-emerald-500" />
                  <span>DB Batch Queue</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{stats?.db_queue_size || 0}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Batch Size: <strong className="text-slate-800 dark:text-slate-200">5 records/commit</strong>
              </p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-100/70 dark:bg-slate-800/30 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Throughput</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{stats?.items_per_minute || 0} <span className="text-xs font-normal">/ min</span></span>
            </div>

            <div className="p-3 bg-slate-100/70 dark:bg-slate-800/30 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Elapsed</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">{stats?.elapsed_seconds || 0}s</span>
            </div>

            <div className="p-3 bg-slate-100/70 dark:bg-slate-800/30 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">EST Remaining</span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{stats?.estimated_seconds_remaining || 0}s</span>
            </div>

            <div className="p-3 bg-slate-100/70 dark:bg-slate-800/30 rounded-xl">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Raw HTML Cache</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{stats?.cached_html_count || 0} <span className="text-[10px] font-normal">files</span></span>
            </div>
          </div>

          {/* Config Controls */}
          {stats?.status !== 'running' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pipeline Execution Range</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Prefix</label>
                  <input
                    type="text"
                    value={runConfig.prefix}
                    onChange={e => setRunConfig({ ...runConfig, prefix: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Start Ticket</label>
                  <input
                    type="text"
                    value={runConfig.start_num}
                    onChange={e => setRunConfig({ ...runConfig, start_num: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">End Ticket</label>
                  <input
                    type="text"
                    value={runConfig.end_num}
                    onChange={e => setRunConfig({ ...runConfig, end_num: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Offline Re-parse Trigger */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Offline HTML Re-parser</span>
              <p className="text-[11px]">Re-extract records from local `storage/raw/*.html` without network requests.</p>
            </div>

            <button
              onClick={handleReparseCachedHtml}
              disabled={reparsing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{reparsing ? 'Re-parsing...' : 'Re-parse Cached HTML'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
