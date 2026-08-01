import React, { useState, useEffect } from 'react';
import { X, Search, Database, RefreshCw, AlertCircle, BookOpen, Beaker } from 'lucide-react';
import API_URL from '../config/api';
import { getUniqueSubjectNames } from '../services/api';

interface SubjectResultMatch {
  hall_ticket: string;
  name: string;
  grade: string;
  subject_code: string;
  subject_name: string;
  credits: number | string;
}

interface SubjectResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchSubject: (
    subjectName: string,
    prefix?: string,
    start?: string,
    end?: string
  ) => Promise<{ matches: SubjectResultMatch[]; autoFetched: boolean }>;
}

export const SubjectResultModal: React.FC<SubjectResultModalProps> = ({
  isOpen,
  onClose,
  onSearchSubject
}) => {
  const [category, setCategory] = useState<'Theory' | 'Lab'>('Theory');
  const [prefix, setPrefix] = useState<string>('');
  const [startNum, setStartNum] = useState<string>('');
  const [endNum, setEndNum] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [matches, setMatches] = useState<SubjectResultMatch[] | null>(null);
  const [allSubjects, setAllSubjects] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passFailFilter, setPassFailFilter] = useState<'all' | 'pass' | 'fail'>('all');

  // Reset filter when selectedSubject changes
  useEffect(() => {
    setPassFailFilter('all');
  }, [selectedSubject]);

  // Compute filtered matches
  const filteredMatches = React.useMemo(() => {
    if (!matches) return [];
    return matches.filter(m => {
      const isFail = m.grade === 'F' || m.grade === 'FAIL' || m.grade === 'AB';
      if (passFailFilter === 'pass') return !isFail;
      if (passFailFilter === 'fail') return isFail;
      return true;
    });
  }, [matches, passFailFilter]);

  // Fetch real subject names from database when modal opens
  useEffect(() => {
    if (isOpen) {
      getUniqueSubjectNames()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setAllSubjects(data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchRangeResults = async (subjectName: string) => {
    setSelectedSubject(subjectName);
    setLoading(true);
    setErrorMessage(null);

    try {
      // Use the filtered endpoint with range
      const res = await fetch(`${API_URL}/api/subject-filtered?subject=${encodeURIComponent(subjectName)}&prefix=${encodeURIComponent(prefix)}&start=${startNum}&end=${endNum}&_t=${Date.now()}`);
      
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      } else {
        // Fallback to the old search method
        const fallbackRes = await onSearchSubject(subjectName, prefix, startNum, endNum);
        setMatches(fallbackRes.matches);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Subject query failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter subjects by category
  const theorySubjects = allSubjects.filter(s => !s.toLowerCase().includes('lab'));
  const labSubjects = allSubjects.filter(s => s.toLowerCase().includes('lab'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-blue-500/5 dark:bg-blue-500/10 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-xl shrink-0">🔵</span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              Subject Wise Result
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Category Selection: Theory vs Lab */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={() => { setCategory('Theory'); setSelectedSubject(''); setMatches(null); }}
              className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                category === 'Theory' 
                  ? 'bg-[#7C3AED] border-purple-400 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              <BookOpen className="w-4 h-4 inline-block mr-2" />
              Theory Subjects ({theorySubjects.length})
            </button>
            <button 
              onClick={() => { setCategory('Lab'); setSelectedSubject(''); setMatches(null); }}
              className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                category === 'Lab' 
                  ? 'bg-[#7C3AED] border-purple-400 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              <Beaker className="w-4 h-4 inline-block mr-2" />
              Lab Subjects ({labSubjects.length})
            </button>
          </div>

          {/* Range Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-black rounded-xl border border-slate-200 dark:border-neutral-800">
            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black mb-1 block">Prefix</label>
              <input 
                value={prefix} 
                onChange={(e) => setPrefix(e.target.value)} 
                className="w-full bg-white dark:bg-[#121212] border border-slate-300 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono" 
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black mb-1 block">Start Ticket</label>
              <input 
                value={startNum} 
                onChange={(e) => setStartNum(e.target.value)} 
                className="w-full bg-white dark:bg-[#121212] border border-slate-300 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono" 
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black mb-1 block">End Ticket</label>
              <input 
                value={endNum} 
                onChange={(e) => setEndNum(e.target.value)} 
                className="w-full bg-white dark:bg-[#121212] border border-slate-300 dark:border-neutral-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-mono" 
              />
            </div>
          </div>

          {/* Subject Selection Buttons */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest font-bold">
              Select {category} Subject:
            </p>
            <div className="flex flex-wrap gap-2">
              {(category === 'Theory' ? theorySubjects : labSubjects).length === 0 ? (
                <p className="text-sm text-slate-400 italic">No {category.toLowerCase()} subjects found in database.</p>
              ) : (
                (category === 'Theory' ? theorySubjects : labSubjects).map(subName => (
                  <button 
                    key={subName}
                    onClick={() => fetchRangeResults(subName)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      selectedSubject === subName 
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-600/20' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {subName}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
              <span className="ml-3 text-sm text-slate-500">Loading results...</span>
            </div>
          )}

          {/* Results Table */}
          {matches && !loading && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium text-slate-650 dark:text-slate-400 px-1 pb-1">
                <span>
                  Results for <strong className="text-slate-900 dark:text-white">"{selectedSubject}"</strong> 
                  <span className="text-slate-400"> ({prefix}{startNum} to {prefix}{endNum})</span>:
                </span>
                
                {/* Pass/Fail Filter Group Buttons */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-neutral-800 self-start sm:self-auto shadow-xs">
                  <button
                    onClick={() => setPassFailFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                      passFailFilter === 'all'
                        ? 'bg-[#7C3AED] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    All ({matches.length})
                  </button>
                  <button
                    onClick={() => setPassFailFilter('pass')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                      passFailFilter === 'pass'
                        ? 'bg-[#059669] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    Passed ({matches.filter(m => !(m.grade === 'F' || m.grade === 'FAIL' || m.grade === 'AB')).length})
                  </button>
                  <button
                    onClick={() => setPassFailFilter('fail')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                      passFailFilter === 'fail'
                        ? 'bg-[#E11D48] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    Failed ({matches.filter(m => m.grade === 'F' || m.grade === 'FAIL' || m.grade === 'AB').length})
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[560px]">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-3 px-4">Hall Ticket</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Subject Code</th>
                        <th className="py-3 px-4">Subject Name</th>
                        <th className="py-3 px-4 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#121212] text-slate-800 dark:text-slate-200">
                      {filteredMatches.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold italic">
                            No matching records found for the selected grade filter.
                          </td>
                        </tr>
                      ) : (
                        filteredMatches.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                              {m.hall_ticket}
                            </td>
                            <td className="py-2.5 px-4 font-medium">{m.name}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">{m.subject_code}</td>
                            <td className="py-2.5 px-4">{m.subject_name}</td>
                            <td className="py-2.5 px-4 text-center">
                              <span className={`inline-block font-bold px-2.5 py-0.5 rounded-full text-xs ${
                                m.grade === 'O' || m.grade === 'A+' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                m.grade === 'A' || m.grade === 'B+' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                                m.grade === 'F' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {m.grade}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
</div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};