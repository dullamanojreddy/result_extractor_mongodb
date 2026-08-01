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
  HelpCircle,
  LogOut,
  History,
  X,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenClassResult: () => void;
  onOpenSubjectResult: () => void;
  onOpenStudentSearch: () => void;
  onOpenAnalytics: () => void;
  onOpenLogs: () => void;
  onOpenUserLogs: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
  role?: string;
  showAnalytics?: boolean;
  collegeName?: string;
  userName?: string;
  // Responsive navigation props
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenClassResult,
  onOpenSubjectResult,
  onOpenStudentSearch,
  onOpenAnalytics,
  onOpenLogs,
  onOpenUserLogs,
  onOpenSettings,
  onLogout,
  role,
  showAnalytics,
  collegeName,
  userName,
  isMobileOpen = false,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse
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
    // Close mobile drawer after navigation
    if (onCloseMobile) onCloseMobile();
  };

  // When collapsed (tablet icon rail), hide text labels on tablet but restore on desktop
  const labelCls = collapsed ? 'hidden lg:inline' : 'inline';
  const justifyCls = collapsed ? 'md:justify-center' : '';

  return (
    <aside
      className={`
        print:hidden fixed inset-y-0 left-0 z-50 flex flex-col justify-between select-none shrink-0
        bg-white dark:bg-[#0D0D0D] border-r border-slate-200/80 dark:border-neutral-900/50
        py-4 px-3 transition-all duration-300 ease-in-out
        w-64 ${collapsed ? 'md:w-20' : 'md:w-64'} lg:w-64
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}
    >
      <div>
        {/* Top Logo + collapse/close controls */}
        <div className="flex items-center justify-between px-3 py-2 mb-6">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-black text-xs shadow-md shadow-purple-500/20 tracking-wider shrink-0">
              RA
            </div>
            <div className={collapsed ? 'hidden lg:block' : 'block'}>
              <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                Result Analyzer
              </h1>
              <p className="text-[11px] font-medium text-slate-400">v1.0.0</p>
            </div>
          </div>

          <div className="flex items-center">
            {/* Mobile close (drawer only) */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Tablet collapse toggle (visible only between md and lg) */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1 text-xs font-semibold">
          <button
            onClick={() => handleNav('dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${justifyCls} ${
              location.pathname === '/'
                ? 'bg-[#F3E8FF] dark:bg-purple-950/50 text-[#6B21A8] dark:text-purple-300 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${location.pathname === '/' ? 'text-[#6B21A8] dark:text-purple-400' : 'text-slate-400'}`} />
            <span className={labelCls}>Dashboard</span>
          </button>

          <button
            onClick={() => handleNav('class-result', onOpenClassResult)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ${justifyCls}`}
          >
            <Users className="w-4 h-4 text-[#7C3AED] shrink-0" />
            <span className={labelCls}>Class Result</span>
          </button>

          <button
            onClick={() => handleNav('subject-result', onOpenSubjectResult)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ${justifyCls}`}
          >
            <BookOpen className="w-4 h-4 text-[#7C3AED] shrink-0" />
            <span className={labelCls}>Subject Wise Result</span>
          </button>

          <button
            onClick={() => handleNav('student-search', onOpenStudentSearch)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${justifyCls} ${
              location.pathname === '/student-search'
                ? 'bg-[#F3E8FF] dark:bg-purple-950/50 text-[#6B21A8] dark:text-purple-300 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className={`w-4 h-4 shrink-0 ${location.pathname === '/student-search' ? 'text-[#6B21A8] dark:text-purple-400' : 'text-slate-400'}`} />
            <span className={labelCls}>Student Search</span>
          </button>

          {(role === 'admin' || showAnalytics) && (
            <button
              onClick={() => handleNav('analytics', onOpenAnalytics)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${justifyCls} ${
                location.pathname === '/analytics'
                  ? 'bg-[#F3E8FF] dark:bg-purple-950/50 text-[#6B21A8] dark:text-purple-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className={`w-4 h-4 shrink-0 ${location.pathname === '/analytics' ? 'text-[#6B21A8] dark:text-purple-400' : 'text-slate-400'}`} />
              <span className={labelCls}>Analytics</span>
            </button>
          )}


          {role === 'admin' && (
            <>
              <div className="pt-2 pb-1">
                <div className="border-t border-slate-200/80 dark:border-slate-800 my-1" />
              </div>

              <button
                onClick={() => handleNav('logs', onOpenLogs)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ${justifyCls}`}
              >
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span className={labelCls}>System Logs</span>
              </button>

              <button
                onClick={() => handleNav('user-logs', onOpenUserLogs)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ${justifyCls}`}
              >
                <History className="w-4 h-4 text-slate-400 shrink-0" />
                <span className={labelCls}>User Logs</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleNav('settings', onOpenSettings)}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ${justifyCls}`}
          >
            <Settings className="w-4 h-4 text-slate-400 shrink-0" />
            <span className={labelCls}>Settings</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer mt-2 ${justifyCls}`}
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
              <span className={labelCls}>Logout</span>
            </button>
          )}
        </nav>
      </div>

      <div className={`p-3 bg-[#F5F3FF] dark:bg-slate-800/50 rounded-2xl border border-purple-100 dark:border-slate-800 flex items-center mt-4 ${collapsed ? 'md:justify-center md:px-2' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
          🎓
        </div>
        <div className={`overflow-hidden ml-3 ${collapsed ? 'hidden lg:block' : 'block'}`}>
          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
            {userName || 'Academic'}
          </h4>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
            {collegeName || 'Institution'}
          </p>
          <span className="inline-block text-[9px] font-bold text-[#6B21A8] dark:text-purple-400 mt-0.5">
            {role === 'admin' ? 'Administrator' : 'College Staff'}
          </span>
        </div>
      </div>
    </aside>
  );
};

