import React, { useState, useEffect } from "react";
import { X, History, Users, RefreshCw } from "lucide-react";
import { getActivityLogs } from "../services/api";

interface UserLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserLogsModal: React.FC<UserLogsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"activity" | "users">("activity");
  const [logs, setLogs] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getActivityLogs();
      setLogs(data.logs || []);
      setActiveUsers(data.active_users || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load user logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      // Poll every 5 seconds to keep it live!
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <History className="w-5 h-5 text-purple-400 shrink-0" />
            <h3 className="text-sm font-bold font-mono text-white">
              User Activity & Live Logins
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-4 sm:px-6 py-2 bg-slate-900/50 border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded transition ${
              activeTab === "activity"
                ? "bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Activity Logs ({logs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded transition ${
              activeTab === "users"
                ? "bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Active Users ({activeUsers.filter(u => u.is_live).length} live)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 font-mono text-xs overflow-y-auto flex-1 bg-slate-950">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-red-400 mb-4 text-center">
              {error}
            </div>
          )}

          {activeTab === "activity" ? (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic py-12 text-center">No user activities recorded.</div>
              ) : (
                logs.map((l: any) => (
                  <div key={l.id} className="flex flex-col sm:flex-row sm:items-start space-y-1 sm:space-y-0 sm:space-x-3 hover:bg-slate-900/50 p-2.5 rounded-xl border border-slate-900 hover:border-slate-800/80 transition">
                    <span className="text-slate-500 shrink-0 select-none w-36">
                      {new Date(l.timestamp).toLocaleString()}
                    </span>
                    <div className="flex-1">
                      <span className="text-purple-400 font-bold">{l.userName}</span>{" "}
                      <span className="text-slate-400 text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 ml-1 select-all">{l.email}</span>
                      <p className="text-slate-200 mt-1">{l.activity}</p>
                    </div>
                    {l.ipAddress && (
                      <span className="text-slate-600 text-[10px] font-mono shrink-0 select-all self-end sm:self-auto">
                        IP: {l.ipAddress}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeUsers.length === 0 ? (
                <div className="text-slate-600 italic py-12 text-center col-span-2">No users registered in this college.</div>
              ) : (
                activeUsers.map((u: any) => (
                  <div key={u.id} className={`p-4 rounded-2xl border transition ${
                    u.is_live 
                      ? "bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40 shadow-xs" 
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-800"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-sm">{u.name}</h4>
                        <p className="text-slate-400 text-xs mt-0.5 select-all">{u.email}</p>
                      </div>
                      {u.is_live ? (
                        <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.1)]">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                          <span>LIVE</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-800 border border-slate-700/60 rounded-full">
                          OFFLINE
                        </span>
                      )}
                    </div>
                    
                    <div className="border-t border-slate-800/80 dark:border-slate-800/40 my-3" />
                    
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Role: <strong className="text-purple-400 font-bold uppercase">{u.role}</strong></span>
                      <span>Last Login: <strong className="text-slate-300 font-semibold">{new Date(u.last_login).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

