import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, Clock } from 'lucide-react';

export const FooterBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setTimeStr(`${time} • ${day}-${month}-${year}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
      {/* Left */}
      <div className="flex items-center space-x-1.5 font-bold text-purple-700 dark:text-purple-300">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>System Healthy</span>
      </div>

      {/* Center */}
      <div className="flex items-center space-x-1 font-medium text-slate-500 text-[11px]">
        <span>Result Analyzer v1.0.0</span>
        <span>•</span>
        <span>Built with</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        <span>for Academic Institution</span>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-1.5 font-medium text-slate-400 text-[11px]">
        <Clock className="w-3.5 h-3.5" />
        <span>{timeStr}</span>
      </div>
    </footer>
  );
};
