import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ScrapeConfig, MySQLConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScrapeConfig;
  onSaveConfig: (newConfig: ScrapeConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'mysql'>('general');
  const [formData, setFormData] = useState<ScrapeConfig>(config);

  const [mysqlForm, setMysqlForm] = useState<MySQLConfig>({
    host: '',
    port: 3306,
    user: '',
    password: '',
    database: '',
    enabled: false
  });

  const [testingMysql, setTestingMysql] = useState<boolean>(false);
  const [mysqlResult, setMysqlResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/mysql/status')
        .then(res => res.json())
        .then(data => {
          if (data?.config) {
            setMysqlForm(data.config);
          }
          if (data?.connected) {
            setMysqlResult({ success: true, message: `Connected to MySQL (${data.config.database})` });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnectMySQL = async () => {
    setTestingMysql(true);
    setMysqlResult(null);
    try {
      const res = await fetch('/api/mysql/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mysqlForm)
      });
      const data = await res.json();
      setMysqlResult(data);
    } catch (err: any) {
      setMysqlResult({ success: false, message: err.message || 'Failed to connect' });
    } finally {
      setTestingMysql(false);
    }
  };

  const handleSave = () => {
    const updated = {
      ...formData,
      mysql: mysqlForm
    };
    onSaveConfig(updated);
    onClose();
  };

  const handleReset = () => {
    const defaultConfig: ScrapeConfig = {
      portal_url: '',
      prefix: '',
      start_num: '',
      end_num: '',
      delay_seconds: 2.0,
      headless: true,
      export_excel: true,
      export_csv: true,
      retry_limit: 3,
      mysql: {
        host: '',
        port: 3306,
        user: '',
        password: '',
        database: '',
        enabled: false
      }
    };
    setFormData(defaultConfig);
    setMysqlForm(defaultConfig.mysql!);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>⚙ Application & Database Settings</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            General Defaults
          </button>
          <button
            onClick={() => setActiveTab('mysql')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'mysql'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>MySQL Local Database</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'general' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Portal URL
                </label>
                <input
                  type="text"
                  value={formData.portal_url}
                  onChange={e => setFormData({ ...formData, portal_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prefix
                  </label>
                  <input
                    type="text"
                    value={formData.prefix}
                    onChange={e => setFormData({ ...formData, prefix: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Start
                  </label>
                  <input
                    type="text"
                    value={formData.start_num}
                    onChange={e => setFormData({ ...formData, start_num: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default End
                  </label>
                  <input
                    type="text"
                    value={formData.end_num}
                    onChange={e => setFormData({ ...formData, end_num: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Request Delay (Seconds)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.delay_seconds}
                    onChange={e => setFormData({ ...formData, delay_seconds: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.retry_limit}
                    onChange={e => setFormData({ ...formData, retry_limit: parseInt(e.target.value, 10) || 3 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.headless}
                    onChange={e => setFormData({ ...formData, headless: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Run Browser Automation in Headless Mode</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.export_excel}
                    onChange={e => setFormData({ ...formData, export_excel: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Enable Automatic Excel (.xlsx) Exports</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.export_csv}
                    onChange={e => setFormData({ ...formData, export_csv: e.target.checked })}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Enable Automatic CSV (.csv) Exports</span>
                </label>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/50 rounded-xl text-xs text-cyan-800 dark:text-cyan-300">
                <p className="font-semibold mb-1">🐬 Local MySQL Database Connection</p>
                <p>
                  Connect your local MySQL instance (e.g., MySQL Workbench, XAMPP, Docker MySQL).
                  The app automatically creates tables (`students`, `logs`, `checkpoints`) upon connection.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    MySQL Host
                  </label>
                  <input
                    type="text"
                    value={mysqlForm.host}
                    onChange={e => setMysqlForm({ ...mysqlForm, host: e.target.value })}
                    placeholder="localhost or 127.0.0.1"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={mysqlForm.port}
                    onChange={e => setMysqlForm({ ...mysqlForm, port: parseInt(e.target.value, 10) || 3306 })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={mysqlForm.user}
                    onChange={e => setMysqlForm({ ...mysqlForm, user: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={mysqlForm.password || ''}
                    onChange={e => setMysqlForm({ ...mysqlForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  value={mysqlForm.database}
                  onChange={e => setMysqlForm({ ...mysqlForm, database: e.target.value })}
                  placeholder="vce_results"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {mysqlResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    mysqlResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {mysqlResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block">{mysqlResult.success ? 'MySQL Connected' : 'Connection Failed'}</strong>
                    <span>{mysqlResult.message}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestConnectMySQL}
                  disabled={testingMysql}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingMysql ? 'animate-spin' : ''}`} />
                  <span>{testingMysql ? 'Testing...' : 'Test & Save MySQL Connection'}</span>
                </button>

                <a
                  href="/database/schema.sql"
                  download="vce_mysql_schema.sql"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  📄 Download MySQL schema.sql
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
