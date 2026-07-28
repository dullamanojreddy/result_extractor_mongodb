import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Search,
  BarChart3,
  FileText,
  Settings,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenClassResult: () => void;
  onOpenSubjectResult: () => void;
  onOpenStudentSearch: () => void;
  onOpenAnalytics: () => void;
  onOpenLogs: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenClassResult,
  onOpenSubjectResult,
  onOpenStudentSearch,
  onOpenAnalytics,
  onOpenLogs,
  onOpenSettings
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (id: string, action?: () => void) => {
    setActiveTab(id);
    if (id === 'dashboard') {
      navigate('/');
    } else if (id === 'analytics') {
      navigate('/analytics');
    } else if (id === 'student-search') {
      navigate('/student-search');
    }
    if (action) action();
  };

  return (
    <aside className="print:hidden w-64 bg-white dark:bg-[#0D0D0D] border-r border-slate-200/80 dark:border-neutral-900/50 flex flex-col justify-between shrink-0 select-none py-4 px-3">
      <div>
        {/* Top Logo */}
        <div className="flex items-center space-x-3 px-3 py-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-black text-xs shadow-md shadow-purple-500/20 tracking-wider">
            RA
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              Result Analyzer
            </h1>
            <p className="text-[11px] font-medium text-slate-400">v1.0.0</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1 text-xs font-semibold">
          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              location.pathname === '/'
                ? 'bg-[#F3E8FF] dark:bg-purple-950/50 text-[#6B21A8] dark:text-purple-300 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${location.pathname === '/' ? 'text-[#6B21A8] dark:text-purple-400' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNav('class-result', onOpenClassResult)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#7C3AED]" />
            <span>Class Result</span>
          </button>

          <button
            onClick={() => handleNav('subject-result', onOpenSubjectResult)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#7C3AED]" />
            <span>Subject Wise Result</span>
          </button>

          <button
            onClick={() => handleNav('student-search', onOpenStudentSearch)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              location.pathname === '/student-search'
                ? 'bg-[#F3E8FF] dark:bg-purple-950/50 text-[#6B21A8] dark:text-purple-300 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className={`w-4 h-4 ${location.pathname === '/student-search' ? 'text-[#6B21A8] dark:text-purple-400' : 'text-slate-400'}`} />
            <span>Student Search</span>
          </button>

          <button
            onClick={() => handleNav('analytics', onOpenAnalytics)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              location.pathname === '/analytics'
                ? 'bg-[#F3E8FF] dark:bg-purple-950/50 text-[#6B21A8] dark:text-purple-300 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${location.pathname === '/analytics' ? 'text-[#6B21A8] dark:text-purple-400' : 'text-slate-400'}`} />
            <span>Analytics</span>
          </button>


          <div className="pt-2 pb-1">
            <div className="border-t border-slate-200/80 dark:border-slate-800 my-1" />
          </div>

          <button
            onClick={() => handleNav('logs', onOpenLogs)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Logs</span>
          </button>

          <button
            onClick={() => handleNav('settings', onOpenSettings)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>



        </nav>
      </div>

      <div className="p-3 bg-[#F5F3FF] dark:bg-slate-800/50 rounded-2xl border border-purple-100 dark:border-slate-800 flex items-center space-x-3 mt-4">
        <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
          🎓
        </div>
        <div className="overflow-hidden">
          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
            Academic
          </h4>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            Institution
          </p>
          <span className="inline-block text-[9px] font-bold text-[#6B21A8] dark:text-purple-400 mt-0.5">
            Local System
          </span>
        </div>
      </div>
    </aside>
  );
};
