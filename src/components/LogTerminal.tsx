import React, { useState } from 'react';
import { X, Terminal, Trash2, Copy, Check } from 'lucide-react';
import { LogEntry } from '../types';

interface LogTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const LogTerminal: React.FC<LogTerminalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(l => filterType === 'all' || l.type === filterType);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <Terminal className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold font-mono text-white">
              System Runtime Logs (Terminal)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Copy all logs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClearLogs}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-900/50 border-b border-slate-800/80 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono">
          <span className="text-slate-500">Filter:</span>
          {['all', 'info', 'success', 'warning', 'error'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-0.5 rounded capitalize ${
                filterType === t ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Console Output Window */}
        <div className="p-4 sm:p-6 font-mono text-xs overflow-y-auto space-y-1.5 flex-1 bg-slate-950">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-600 italic py-12 text-center">No log entries recorded.</div>
          ) : (
            filteredLogs.map(l => (
              <div key={l.id} className="flex items-start space-x-3 hover:bg-slate-900/50 p-1 rounded transition">
                <span className="text-slate-500 shrink-0 select-none">{l.timestamp}</span>
                <span
                  className={`shrink-0 font-bold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                    l.type === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    l.type === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    l.type === 'error' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-slate-800 text-slate-300'
                  }`}
                >
                  {l.type}
                </span>
                <span className="text-slate-300 leading-relaxed break-all">{l.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
