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
import { getStats, getLogs, getRecentStudents, runClassResult, clearDatabase, clearLogs } from './services/api';
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
              />
            }
          />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/student-search" element={<StudentSearch />} />
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
    </div>
  );
}
