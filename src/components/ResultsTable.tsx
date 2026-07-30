import React, { useState } from 'react';
import { Search, Download, FileSpreadsheet, CheckCircle2, UserX, ChevronDown, ChevronUp } from 'lucide-react';
import { Student } from '../types';
import { getStudents } from '../services/api';

interface ResultsTableProps {
  students: Student[];
  onDownloadExcel: () => void;
  onDownloadCsv: () => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  students,
  onDownloadExcel,
  onDownloadCsv
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'found' | 'missing'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [dbStudents, setDbStudents] = useState<Student[]>([]);
  const [hasLoadedDb, setHasLoadedDb] = useState<boolean>(false);

  // Lazy-load all database students on search query input to support full DB search from dashboard
  React.useEffect(() => {
    if (searchTerm.trim() && !hasLoadedDb) {
      getStudents()
        .then(data => {
          if (Array.isArray(data)) {
            setDbStudents(data);
            setHasLoadedDb(true);
          }
        })
        .catch(err => console.error('Failed to load full student list for search', err));
    }
  }, [searchTerm, hasLoadedDb]);

  const activeSourceList = hasLoadedDb && searchTerm.trim() ? dbStudents : students;

  const toggleRow = (hallTicket: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(hallTicket)) {
      newExpandedRows.delete(hallTicket);
    } else {
      newExpandedRows.add(hallTicket);
    }
    setExpandedRows(newExpandedRows);
  };

  const filteredStudents = activeSourceList.filter(s => {
    if (!s) return false;
    
    const matchesSearch =
      s.hall_ticket.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'found') return !s.is_missing;
    if (filterType === 'missing') return s.is_missing;
    return true;
  });

  const foundCount = activeSourceList.filter(s => s && !s.is_missing).length;
  const missingCount = activeSourceList.filter(s => s && s.is_missing).length;

  return (
    <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-850 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden mb-8">
      {/* Controls Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Hall Ticket or Name..."
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white w-full sm:w-64 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'all' ? 'bg-white dark:bg-[#121212] text-slate-900 dark:text-white shadow-sm' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({activeSourceList.length})
            </button>
            <button
              onClick={() => setFilterType('found')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'found' ? 'bg-white dark:bg-[#121212] text-emerald-600 dark:text-emerald-400 shadow-sm' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Found ({foundCount})
            </button>
            <button
              onClick={() => setFilterType('missing')}
              className={`px-3 py-1 rounded-lg transition ${
                filterType === 'missing' ? 'bg-white dark:bg-[#121212] text-amber-600 dark:text-amber-400 shadow-sm' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Missing ({missingCount})
            </button>
          </div>
        </div>

        {/* Downloads */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onDownloadExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onDownloadCsv}
            className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-6">Hall Ticket Number</th>
              <th className="py-3.5 px-6">Student Name</th>
              <th className="py-3.5 px-6 text-center">SGPA</th>
              <th className="py-3.5 px-6 text-center">CGPA</th>
              <th className="py-3.5 px-6 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  No records match your criteria. Click "CLASS RESULT" to ingest data.
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => {
                const isMissing = student.is_missing;
                const isExpanded = expandedRows.has(student.hall_ticket);

                return (
                  <React.Fragment key={student.hall_ticket}>
                    {/* Main Student Row */}
                    <tr className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors ${
                      isExpanded 
                        ? 'bg-indigo-500/5 dark:bg-indigo-500/10' 
                        : isMissing 
                          ? 'bg-amber-500/5 dark:bg-amber-500/10 hover:bg-amber-500/10 dark:hover:bg-amber-500/15' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}>
                      <td className="py-3 px-6 font-mono font-bold text-slate-900 dark:text-white">
                        {student.hall_ticket}
                      </td>

                      <td className="py-3 px-6 font-semibold">
                        {isMissing ? (
                          <span className="text-slate-400 dark:text-slate-500">-</span>
                        ) : (
                          student.name
                        )}
                      </td>

                      <td className="py-3 px-6 text-center font-mono font-bold text-sm">
                        {isMissing ? (
                          <span className="text-slate-400 dark:text-slate-500">-</span>
                        ) : (
                          <span className="text-indigo-600 dark:text-indigo-400">{student.sgpa}</span>
                        )}
                      </td>

                      <td className="py-3 px-6 text-center font-mono font-bold text-sm">
                        {isMissing ? (
                          <span className="text-slate-400 dark:text-slate-500">-</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">{student.cgpa}</span>
                        )}
                      </td>

                      <td className="py-3 px-6 text-center">
                        {isMissing ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <UserX className="w-3 h-3" /> Missing (-)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Success
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {!isMissing && student.subjects && student.subjects.length > 0 ? (
                          <button
                            onClick={() => toggleRow(student.hall_ticket)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg border border-indigo-500/20 transition-all duration-200 text-xs font-semibold"
                          >
                            {isExpanded ? (
                              <><ChevronUp size={14} /> Hide</>
                            ) : (
                              <><ChevronDown size={14} /> View</>
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-500 italic text-xs">No data</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Subjects Row */}
                    {isExpanded && !isMissing && student.subjects && student.subjects.length > 0 && (
                      <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/60">
                        <td colSpan={6} className="px-8 py-6">
                          <div className="max-w-4xl mx-auto">
                            {/* Divider header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Subject Wise Performance
                              </span>
                              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                            </div>

                            {/* Subjects Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
                              {student.subjects.map((sub, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                      {sub.subject_name}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                      {sub.subject_code} · {sub.credits} Credits
                                    </span>
                                  </div>
                                  <span className={`text-sm font-black px-3 py-1 rounded-md ${
                                    sub.grade === 'F' 
                                      ? 'text-red-500 bg-red-500/10 dark:bg-red-500/15' 
                                      : sub.grade === 'O' || sub.grade === 'A+' 
                                      ? 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15' 
                                      : 'text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/15'
                                  }`}>
                                    {sub.grade}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};