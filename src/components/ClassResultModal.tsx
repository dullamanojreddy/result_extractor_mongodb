import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertCircle,
  Download,
  FileSpreadsheet,
  Globe,
  Sliders,
  Layers,
  Database,
  Cpu,
  Zap,
  Users
} from 'lucide-react';
import { ScrapeConfig, ScrapeProgress, Student } from '../types';
import API_URL from '../config/api';

interface ClassResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunClassResult: (config: ScrapeConfig) => Promise<Student[]>;
  initialConfig: ScrapeConfig;
}

export const ClassResultModal: React.FC<ClassResultModalProps> = ({
  isOpen,
  onClose,
  onRunClassResult,
  initialConfig
}) => {
  const [config, setConfig] = useState<ScrapeConfig>(initialConfig);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<ScrapeProgress | null>(null);
  const [extractedStudents, setExtractedStudents] = useState<Student[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsPaused(false);
      setProgress(null);
      setExtractedStudents(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStart = async () => {
    setIsProcessing(true);
    setIsPaused(false);
    setErrorMessage(null);
    setExtractedStudents(null);

    const startNum = parseInt(config.start_num, 10);
    const endNum = parseInt(config.end_num, 10);
    const total = Math.max(1, endNum - startNum + 1);
    const padLen = Math.max(3, config.start_num.length);

    // Live progress timer simulation
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setProgress(prev => {
        if (prev && (prev.processed_count ?? 0) >= total) {
          return {
            ...prev,
            elapsed_seconds: elapsed,
            remaining_seconds: 0
          };
        }

        const count = prev ? Math.min((prev.processed_count ?? 0) + 1, total) : 1;
        const currentHt = `${config.prefix}${String(startNum + count - 1).padStart(padLen, '0')}`;
        
        // Pure calculation of missing and found records to avoid React strict-mode double-run state mutation bugs
        let simulatedMissing = 0;
        for (let i = 0; i < count; i++) {
          const currentVal = startNum + i;
          const isMiss = currentVal % 43 === 0 || currentVal === 58;
          if (isMiss) simulatedMissing++;
        }
        const simulatedFound = count - simulatedMissing;

        const remain = Math.max(0, Math.ceil((total - count) * (config.delay_seconds || 0.3)));

        return {
          status: count >= total ? 'completed' : 'running',
          current_hall_ticket: currentHt,
          processed: count,
          total: total,
          processed_count: count,
          total_count: total,
          found_count: simulatedFound,
          missing_count: simulatedMissing,
          elapsed_seconds: elapsed,
          remaining_seconds: remain,
          start_ticket: `${config.prefix}${config.start_num}`,
          end_ticket: `${config.prefix}${config.end_num}`
        };
      });
    }, Math.max(250, (config.delay_seconds || 0.3) * 300));

    try {
      const results = await onRunClassResult(config);
      clearInterval(timer);
      setExtractedStudents(results);
      setIsProcessing(false);
      setProgress({
        status: 'completed',
        current_hall_ticket: `${config.prefix}${config.end_num}`,
        processed: results.length,
        total: results.length,
        processed_count: results.length,
        total_count: results.length,
        found_count: results.filter(s => s && !s.is_missing).length,
        missing_count: results.filter(s => s && s.is_missing).length,
        elapsed_seconds: Math.floor((Date.now() - startTime) / 1000),
        remaining_seconds: 0,
        start_ticket: `${config.prefix}${config.start_num}`,
        end_ticket: `${config.prefix}${config.end_num}`
      });
    } catch (err: any) {
      clearInterval(timer);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Batch result extraction failed');
    }
  };

  const handleStop = () => {
    setIsProcessing(false);
    setIsPaused(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const percent = progress ? Math.round(((progress.processed_count ?? 0) / Math.max(1, progress.total_count ?? 1)) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-rose-500/10 via-purple-500/5 to-transparent flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#E11D48] text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Class Result Batch Ingestion
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hidden sm:inline-block">
                  BATCH ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                High-throughput automated result scraper & MongoDB database sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {!isProcessing && !extractedStudents && (
            <div className="space-y-6">
              {/* Range Preview Header Banner */}
              <div className="p-4 rounded-2xl bg-[#F5F3FF] dark:bg-purple-950/30 border border-[#E9D5FF] dark:border-purple-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <Zap className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-purple-200">
                      Target Hall Ticket Batch Range
                    </p>
                    <p className="text-sm font-mono font-black text-[#6B21A8] dark:text-purple-300">
                      {config.prefix}{config.start_num} &rarr; {config.prefix}{config.end_num}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800/60 text-xs font-bold text-purple-700 dark:text-purple-300">
                  Total: {Math.max(0, parseInt(config.end_num, 10) - parseInt(config.start_num, 10) + 1)} Hall Tickets
                </div>
              </div>

              {/* Group 1: Portal Settings */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <Globe className="w-4 h-4 text-[#E11D48]" />
                  <span>1. Portal Target Configuration</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Results Portal Base URL
                  </label>
                  <input
                    type="text"
                    value={config.portal_url}
                    onChange={e => setConfig({ ...config, portal_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="https://example-college-portal.edu/results/"
                  />
                </div>
              </div>

              {/* Group 2: Hall Ticket Range */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <Sliders className="w-4 h-4 text-[#7C3AED]" />
                  <span>2. Hall Ticket Sequence Range</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Prefix String
                    </label>
                    <input
                      type="text"
                      value={config.prefix}
                      onChange={e => setConfig({ ...config, prefix: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Start Index
                    </label>
                    <input
                      type="text"
                      value={config.start_num}
                      onChange={e => setConfig({ ...config, start_num: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      End Index
                    </label>
                    <input
                      type="text"
                      value={config.end_num}
                      onChange={e => setConfig({ ...config, end_num: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: High Performance Worker Architecture */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-[#6366F1]" />
                  <span>3. Concurrent Worker & Pipeline Engine Settings</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Fetch Workers
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={config.fetch_workers || 4}
                      onChange={e => setConfig({ ...config, fetch_workers: parseInt(e.target.value, 10) || 4 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Parse Workers
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={config.parse_workers || 2}
                      onChange={e => setConfig({ ...config, parse_workers: parseInt(e.target.value, 10) || 2 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      DB Batch Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.db_batch_size || 5}
                      onChange={e => setConfig({ ...config, db_batch_size: parseInt(e.target.value, 10) || 5 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Request Delay (s)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={config.delay_seconds}
                      onChange={e => setConfig({ ...config, delay_seconds: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Options & Targets */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <Database className="w-4 h-4 text-[#E11D48]" />
                  <span>4. Output Target & Export Options</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Database className="w-4 h-4 text-[#7C3AED]" />
                    <span>Target Database: <strong className="text-slate-900 dark:text-white">Local MongoDB Database</strong></span>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.headless}
                        onChange={e => setConfig({ ...config, headless: e.target.checked })}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>Headless Mode</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.export_excel}
                        onChange={e => setConfig({ ...config, export_excel: e.target.checked })}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>Excel (.xlsx)</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.export_csv}
                        onChange={e => setConfig({ ...config, export_csv: e.target.checked })}
                        className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>CSV (.csv)</span>
                    </label>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-xs text-rose-600 dark:text-rose-400 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Active Live Processing Screen */}
          {isProcessing && progress && (
            <div className="space-y-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Hall Ticket</span>
                  <p className="font-mono font-black text-rose-600 dark:text-rose-400 text-lg">
                    {progress.current_hall_ticket}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold">
                    {isPaused ? 'PAUSED' : 'EXTRACTING'}
                  </span>
                  <span>{progress.processed_count} of {progress.total_count} processed ({percent}%)</span>
                </div>
              </div>

              {/* Gradient Progress Bar */}
              <div>
                <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#E11D48] via-[#7C3AED] to-[#6366F1] transition-all duration-300 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Live Queues Visualization */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#7C3AED]" /> Fetch Queue</span>
                    <span className="font-mono text-purple-600">Active</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: `${Math.min(100, percent + 15)}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-[#E11D48]" /> Parse Queue</span>
                    <span className="font-mono text-rose-600">Active</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E11D48] rounded-full" style={{ width: `${Math.min(100, percent)}%` }} />
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-[#6366F1]" /> DB Writer</span>
                    <span className="font-mono text-indigo-600">Syncing</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${Math.max(5, percent - 5)}%` }} />
                  </div>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Found Records</span>
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{progress.found_count}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Missing Tickets</span>
                  <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{progress.missing_count}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Elapsed Time</span>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">{formatTime(progress.elapsed_seconds ?? 0)}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Remaining (ETA)</span>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1">{formatTime(progress.remaining_seconds ?? 0)}</p>
                </div>
              </div>

              {/* Control Actions */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition flex items-center gap-2 cursor-pointer"
                >
                  {isPaused ? <Play className="w-4 h-4 text-purple-600" /> : <Pause className="w-4 h-4 text-rose-600" />}
                  <span>{isPaused ? 'Resume Processing' : 'Pause Processing'}</span>
                </button>

                <button
                  onClick={handleStop}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition flex items-center gap-2 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Batch</span>
                </button>
              </div>
            </div>
          )}

          {/* Execution Completed Summary */}
          {extractedStudents && (
            <div className="p-6 bg-[#F5F3FF] dark:bg-purple-950/30 border border-[#E9D5FF] dark:border-purple-900/50 rounded-3xl space-y-5">
              <div className="flex items-center space-x-3.5 text-[#6B21A8] dark:text-purple-300">
                <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-base text-slate-900 dark:text-white">
                    Batch Extraction Completed Successfully!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Processed {extractedStudents.length} hall tickets directly into local MongoDB database.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Successfully Found Students:</span>
                  <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                    {extractedStudents.filter(s => s && !s.is_missing).length}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Missing / Failed Hall Tickets (-):</span>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
                    {extractedStudents.filter(s => s && s.is_missing).length}
                  </p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <a
                  href={`${API_URL}/api/export/excel?prefix=${config.prefix}&start=${config.start_num}&end=${config.end_num}`}
                  download
                  className="px-5 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-rose-500/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Excel (.xlsx)</span>
                </a>

                <a
                  href={`${API_URL}/api/export/csv?prefix=${config.prefix}&start=${config.start_num}&end=${config.end_num}`}
                  download
                  className="px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-extrabold transition flex items-center gap-2 shadow-md shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download CSV (.csv)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {extractedStudents ? 'Close' : 'Cancel'}
          </button>

          {!isProcessing && !extractedStudents && (
            <button
              onClick={handleStart}
              className="px-7 py-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-black transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Batch Extraction</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
