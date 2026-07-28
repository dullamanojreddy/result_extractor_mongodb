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
import { Student, ScrapeConfig, DatabaseStats, LogEntry, PipelineStats } from './types';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(false);

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

  // Load stats, logs & pipeline stats dynamically
  const fetchStatsAndLogs = useCallback(async () => {
    try {
      const [statsRes, logsRes, pipeRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/logs'),
        fetch('/api/pipeline/stats')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }
      if (pipeRes.ok) {
        const pipeData = await pipeRes.json();
        setPipelineStats(pipeData);
      }
    } catch (err) {
      console.error('Failed to load stats or logs', err);
    }
  }, []);

  // Load recent students on mount
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/recent-students');
        if (res.ok) {
          const data = await res.json();
          setRecentStudents(data);
        }
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
    const res = await fetch('/api/class-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prefix: runConfig.prefix,
        start: runConfig.start_num,
        end: runConfig.end_num,
        portal_url: runConfig.portal_url,
        delay: Math.round(runConfig.delay_seconds * 1000)
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Class result extraction failed');
    }

    const data = await res.json();
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
    const res = await fetch('/api/subject-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject_name: subjectName,
        prefix: reqPrefix || config.prefix,
        start: reqStart || config.start_num,
        end: reqEnd || config.end_num,
        auto_fetch_missing: !!(reqPrefix && reqStart && reqEnd)
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Subject search failed');
    }

    const data = await res.json();
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
      const res = await fetch('/api/db/clear', { method: 'POST' });
      if (res.ok) {
        setStudents([]);
        await fetchStatsAndLogs();
      }
    } catch (err) {
      console.error('Failed to clear DB', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (err) {
      console.error('Failed to clear logs', err);
    }
  };

  const handleDownloadExcel = () => {
    window.location.href = `/api/export/excel?prefix=${config.prefix}&start=${config.start_num}&end=${config.end_num}`;
  };

  const handleDownloadCsv = () => {
    window.location.href = `/api/export/csv?prefix=${config.prefix}&start=${config.start_num}&end=${config.end_num}`;
  };

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
