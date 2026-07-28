import React from 'react';
import { Users, BookOpen, ArrowRight } from 'lucide-react';

interface FeaturedActionCardsProps {
  onOpenClassResult: () => void;
  onOpenSubjectResult: () => void;
}

export const FeaturedActionCards: React.FC<FeaturedActionCardsProps> = ({
  onOpenClassResult,
  onOpenSubjectResult
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      {/* CARD 1: CLASS RESULT */}
      <div className="relative overflow-hidden bg-[#F5F3FF] dark:bg-[#121212] border border-[#E9D5FF] dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between transition-all hover:shadow-md">
        {/* Background Decorative Bar Chart Graphics */}
        <div className="absolute right-4 bottom-12 pointer-events-none opacity-20 flex items-end gap-1.5 h-16">
          <div className="w-3.5 bg-[#7C3AED] rounded-t-xs h-8"></div>
          <div className="w-3.5 bg-[#7C3AED] rounded-t-xs h-12"></div>
          <div className="w-3.5 bg-[#7C3AED] rounded-t-xs h-16"></div>
          <div className="w-3.5 bg-[#7C3AED] rounded-t-xs h-10"></div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3E8FF] dark:bg-purple-900/60 text-[#6B21A8] dark:text-purple-200">
              BATCH INGESTION
            </span>
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Class Result
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6 max-w-xs">
            Scrape or fetch a range of hall tickets. Checks database before scraping missing tickets.
          </p>
        </div>

        <button
          onClick={onOpenClassResult}
          className="w-full py-3 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs flex items-center justify-between shadow-xs transition-all active:scale-[0.99] cursor-pointer"
        >
          <span>Start Class Result Batch</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* CARD 2: SUBJECT WISE RESULT */}
      <div className="relative overflow-hidden bg-[#F5F3FF] dark:bg-[#121212] border border-[#E9D5FF] dark:border-neutral-800 rounded-3xl p-6 flex flex-col justify-between transition-all hover:shadow-md">
        {/* Background Decorative Pie Chart SVG */}
        <div className="absolute right-[-10px] bottom-[-10px] pointer-events-none opacity-20">
          <svg width="110" height="110" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#7C3AED" strokeWidth="18" fill="none" strokeDasharray="180 250" />
          </svg>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F3E8FF] dark:bg-purple-900/60 text-[#6B21A8] dark:text-purple-200">
              FAST QUERY
            </span>
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Subject Wise Result
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6 max-w-xs">
            Query student grades by subject name. Auto-fetch if data not available.
          </p>
        </div>

        <button
          onClick={onOpenSubjectResult}
          className="w-full py-3 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs flex items-center justify-between shadow-xs transition-all active:scale-[0.99] cursor-pointer"
        >
          <span>Query Subject Grades</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
