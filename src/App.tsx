import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ClassResultModal } from './components/ClassResultModal';
import { SubjectResultModal } from './components/SubjectResultModal';
import { StatsPanel } from './components/StatsPanel';
import { LogTerminal } from './components/LogTerminal';
import { DocsViewerModal } from './components/DocsViewerModal';
import { SettingsModal } from './components/SettingsModal';
import { PipelineMonitorModal } from './components/PipelineMonitorModal';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/Analytics';
import StudentSearch from './pages/StudentSearch';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import { Student, ScrapeConfig, DatabaseStats, LogEntry, PipelineStats } from './types';
import { getStats, getLogs, getRecentStudents, runClassResult, runSubjectResult, clearDatabase, clearLogs } from './services/api';
import { isAuthenticated, getStoredUser, logout as authLogout, type AuthUser } from './services/auth';
import API_URL from './config/api';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Auth State
  const [authed, setAuthed] = useState<boolean>(isAuthenticated());
  const [showLogin, setShowLogin] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  
  // Secret Analytics Unlock & Onboarding
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  // Core Data States
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Config State
  const [config, setConfig] = useState<ScrapeConfig>({
    portal_url: '',
    prefix: '',
    start_num: '',
    end_num: '',
    delay_seconds: 0.5,
    headless: true,
    export_excel: true,
    export_csv: true,
    retry_limit: 3,
    fetch_workers: 4,
    parse_workers: 2,
    db_batch_size: 5
  });

  // Modal Visibility States
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState<boolean>(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isLogsOpen, setIsLogsOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync Dark Mode with HTML class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle successful login/register
  const handleAuthSuccess = () => {
    setAuthed(true);
    setCurrentUser(getStoredUser());
    // Show onboarding popup on each new login (session-based)
    if (!sessionStorage.getItem('onboarding')) {
      setShowOnboarding(true);
    }
  };

  // Trigger onboarding modal on load if authenticated and session key is not set
  useEffect(() => {
    if (authed && !sessionStorage.getItem('onboarding')) {
      setShowOnboarding(true);
    }
  }, [authed]);

  // Secret analytics unlock via search
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value.toLowerCase().trim() === 'i love result analyzer') {
      setShowAnalytics(true);
    }
  };

  // Dismiss onboarding
  const handleOnboardingDone = () => {
    sessionStorage.setItem('onboarding', 'done');
    setShowOnboarding(false);
  };

  // Handle logout
  const handleLogout = async () => {
    await authLogout();
    setAuthed(false);
    setCurrentUser(null);
    setShowLogin(true);
  };

  // Load stats, logs & pipeline stats dynamically
  const fetchStatsAndLogs = useCallback(async () => {
    try {
      const [statsData, logsData, pipeData] = await Promise.all([
        getStats(),
        getLogs(),
        fetch(`${API_URL}/api/pipeline/stats`).then(res => res.ok ? res.json() : null)
      ]);

      setStats(statsData);
      setLogs(logsData);
      if (pipeData) setPipelineStats(pipeData);
    } catch (err) {
      console.error('Failed to load stats or logs', err);
    }
  }, []);

  // Load recent students on mount
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await getRecentStudents();
        setRecentStudents(data);
      } catch (err) {
        console.error('Failed to load recent students', err);
      }
    };
    fetchRecent();
  }, []);

  useEffect(() => {
    fetchStatsAndLogs();

    // Live update stats every 2 seconds for real-time responsiveness
    const interval = setInterval(() => {
      fetchStatsAndLogs();
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchStatsAndLogs]);

  // Handlers
  const handleRunClassResult = async (runConfig: ScrapeConfig): Promise<Student[]> => {
    const data = await runClassResult({
      prefix: runConfig.prefix,
      start: runConfig.start_num,
      end: runConfig.end_num,
      portal_url: runConfig.portal_url,
      delay: Math.round(runConfig.delay_seconds * 1000)
    });

    setStudents(data.students || []);
    await fetchStatsAndLogs();
    return data.students || [];
  };

  const handleSearchSubject = async (
    subjectName: string,
    reqPrefix?: string,
    reqStart?: string,
    reqEnd?: string
  ) => {
    const data = await runSubjectResult({
      subject_name: subjectName,
      prefix: reqPrefix || config.prefix,
      start: reqStart || config.start_num,
      end: reqEnd || config.end_num,
      auto_fetch_missing: !!(reqPrefix && reqStart && reqEnd)
    });

    await fetchStatsAndLogs();
    return {
      matches: data.results || [],
      autoFetched: !!(reqPrefix && reqStart && reqEnd)
    };
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all student records from database?')) return;
    setLoading(true);
    try {
      await clearDatabase();
      setStudents([]);
      await fetchStatsAndLogs();
    } catch (err) {
      console.error('Failed to clear DB', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await clearLogs();
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs', err);
    }
  };

  const handleDownloadExcel = () => {
    window.location.href = `${API_URL}/api/export/excel?prefix=${config.prefix}&start=${config.start_num}&end=${config.end_num}`;
  };

  const handleDownloadCsv = () => {
    window.location.href = `${API_URL}/api/export/csv?prefix=${config.prefix}&start=${config.start_num}&end=${config.end_num}`;
  };

  // Show login/register page if not authenticated
  if (!authed) {
    return showLogin ? (
      <LoginPage 
        onLogin={handleAuthSuccess} 
        onSwitchToRegister={() => setShowLogin(false)} 
      />
    ) : (
      <RegisterPage 
        onRegister={handleAuthSuccess} 
        onSwitchToLogin={() => setShowLogin(true)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col transition-colors duration-200 print:bg-white">
      {/* Outer Window Container (Desktop App Style) */}
      <div className="flex flex-1 min-h-screen w-full">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenClassResult={() => setIsClassModalOpen(true)}
          onOpenSubjectResult={() => setIsSubjectModalOpen(true)}
          onOpenStudentSearch={() => {}}
          onOpenAnalytics={() => {}}
          onOpenLogs={() => setIsLogsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          role={currentUser?.role}
          showAnalytics={showAnalytics}
          collegeName={currentUser?.collegeName}
          userName={currentUser?.name}
        />

        {/* Main Content View Container with Routing */}
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                pipelineStats={pipelineStats}
                dbStats={stats}
                logs={logs}
                config={config}
                students={recentStudents}
                onOpenClassResult={() => setIsClassModalOpen(true)}
                onOpenSubjectResult={() => setIsSubjectModalOpen(true)}
                onOpenPipelineMonitor={() => setIsPipelineOpen(true)}
                onOpenLogs={() => setIsLogsOpen(true)}
                onDownloadExcel={handleDownloadExcel}
                onDownloadCsv={handleDownloadCsv}
                onSearchChange={handleSearchChange}
                searchValue={searchValue}
              />
            }
          />
          {(currentUser?.role === 'admin' || showAnalytics) && (
            <Route path="/analytics" element={<AnalyticsPage />} />
          )}
          <Route path="/student-search" element={<StudentSearch role={currentUser?.role} />} />
        </Routes>
      </div>

      {/* Modals & Dialogs */}
      <ClassResultModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onRunClassResult={handleRunClassResult}
        initialConfig={config}
      />

      <SubjectResultModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSearchSubject={handleSearchSubject}
      />

      <PipelineMonitorModal
        isOpen={isPipelineOpen}
        onClose={() => setIsPipelineOpen(false)}
        config={config}
      />

      <StatsPanel
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onClearDatabase={handleClearDatabase}
      />

      <LogTerminal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={logs}
        onClearLogs={handleClearLogs}
      />

      <DocsViewerModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={setConfig}
      />

      {/* Onboarding Popup */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <h3 className="text-lg font-bold">Welcome to Result Analyzer</h3>
            </div>
            <div className="p-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p>This platform does not store your result portal URL.</p>
              <p>You must enter after each login:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Result URL</li>
                <li>Hall Ticket Prefix</li>
                <li>Start Number</li>
                <li>End Number</li>
              </ul>
              <p className="text-xs text-slate-500">Your data is isolated to your college.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={handleOnboardingDone}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
