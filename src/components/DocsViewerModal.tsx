import React, { useState, useEffect } from 'react';
import { X, FileText, ChevronRight, BookOpen } from 'lucide-react';
import API_URL from '../config/api';

interface DocsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsViewerModal: React.FC<DocsViewerModalProps> = ({ isOpen, onClose }) => {
  const [docList, setDocList] = useState<string[]>([
    'PROJECT_CONTEXT',
    'ARCHITECTURE',
    'DATABASE_SCHEMA',
    'DATA_MODEL',
    'SCRAPER_FLOW',
    'API_ANALYSIS',
    'DATA_FLOW',
    'UI_SPEC',
    'DEVELOPMENT_RULES',
    'TOKEN_OPTIMIZATION',
    'ERROR_HANDLING',
    'TEST_PLAN',
    'ROADMAP',
    'CHANGELOG'
  ]);

  const [activeDoc, setActiveDoc] = useState<string>('PROJECT_CONTEXT');
  const [docContent, setDocContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && activeDoc) {
      loadDoc(activeDoc);
    }
  }, [isOpen, activeDoc]);

  const loadDoc = async (docName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/docs/${docName}`);
      if (res.ok) {
        const data = await res.json();
        setDocContent(data.content);
      } else {
        setDocContent('# File Not Found\nThe requested documentation file could not be loaded.');
      }
    } catch (err) {
      setDocContent('# Error\nFailed to load documentation file.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <BookOpen className="w-5 h-5 text-rose-500 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                Project Documentation Suite ({docList.length} Files)
              </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Doc Selector */}
          <div className="w-full md:w-64 md:border-r border-b md:border-b-0 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto md:overflow-y-auto p-3 md:space-y-1">
            <div className="hidden md:block text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 mb-1">
              Specification Docs
            </div>
            <div className="flex md:flex-col gap-1 md:space-y-1">
              {docList.map(doc => (
                <button
                  key={doc}
                  onClick={() => setActiveDoc(doc)}
                  className={`shrink-0 md:w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                    activeDoc === doc
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{doc}.md</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Markdown Content Viewer */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                Loading documentation file...
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {docContent}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-500">
          <span className="truncate">Active File: <strong className="font-mono text-slate-700 dark:text-slate-300">/docs/{activeDoc}.md</strong></span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
