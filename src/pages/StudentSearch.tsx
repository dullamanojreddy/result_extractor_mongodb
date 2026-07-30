import React, { useState, useEffect, useMemo } from 'react';
import { Search, Printer, AlertCircle, FileText, User, ArrowUpDown, X, ArrowDownAz, SlidersHorizontal } from 'lucide-react';
import { Student } from '../types';
import { FooterBar } from '../components/FooterBar';
import { getStudents, deleteStudents } from '../services/api';
import API_URL from '../config/api';

export default function StudentSearch({ role }: { role?: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'roll' | 'name' | 'sgpa' | 'cgpa'>('roll');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'distinction' | 'pass' | 'support' | 'backlogs'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isMemoOpen, setIsMemoOpen] = useState<boolean>(false);

  const [selectedRolls, setSelectedRolls] = useState<string[]>([]);

  const handleDeleteSelected = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/students/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hall_tickets: selectedRolls })
      });
      
      if (res.ok) {
        const refreshRes = await fetch(`${API_URL}/api/students`);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setStudents(data);
        }
        setSelectedRolls([]);
      } else {
        let errMsg = 'Failed to delete students';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch (_) {}
        alert(errMsg);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all students on mount
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/students`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch students from database');
        return res.json();
      })
      .then(data => {
        setStudents(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'An error occurred while loading student records.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Pre-calculate ranks of all students before filtering
  const studentRanks = useMemo(() => {
    // Filter out missing students for rank calculation
    const validStudents = students.filter(s => !s.is_missing);

    // SGPA ranking (standard competition ranking with ties)
    const sortedBySgpa = [...validStudents].sort((a, b) => (parseFloat(b.sgpa) || 0) - (parseFloat(a.sgpa) || 0));
    const sgpaRanks: Record<string, number> = {};
    let currentSgpaRank = 1;
    sortedBySgpa.forEach((st, idx) => {
      if (idx > 0 && parseFloat(st.sgpa) !== parseFloat(sortedBySgpa[idx - 1].sgpa)) {
        currentSgpaRank = idx + 1;
      }
      sgpaRanks[st.hall_ticket] = currentSgpaRank;
    });

    // CGPA ranking (standard competition ranking with ties)
    const sortedByCgpa = [...validStudents].sort((a, b) => (parseFloat(b.cgpa) || 0) - (parseFloat(a.cgpa) || 0));
    const cgpaRanks: Record<string, number> = {};
    let currentCgpaRank = 1;
    sortedByCgpa.forEach((st, idx) => {
      if (idx > 0 && parseFloat(st.cgpa) !== parseFloat(sortedByCgpa[idx - 1].cgpa)) {
        currentCgpaRank = idx + 1;
      }
      cgpaRanks[st.hall_ticket] = currentCgpaRank;
    });

    return { sgpaRanks, cgpaRanks };
  }, [students]);

  // Filter & Sort Students
  const processedStudents = useMemo(() => {
    let result = [...students];

    // 1. Text Search Filter (Name or Roll Number)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        st => st.name.toLowerCase().includes(q) || st.hall_ticket.toLowerCase().includes(q)
      );
    }

    // 2. Grade/Status Filter
    if (gradeFilter !== 'all') {
      result = result.filter(st => {
        if (st.is_missing) return false;
        const sgpaVal = parseFloat(st.sgpa);
        if (isNaN(sgpaVal)) return false;

        switch (gradeFilter) {
          case 'distinction':
            return sgpaVal >= 9.0;
          case 'pass':
            return sgpaVal >= 5.0;
          case 'support':
            return sgpaVal < 6.0;
          case 'backlogs':
            return st.subjects?.some(sub => sub.grade === 'F' || sub.grade === 'FAIL' || sub.grade === 'AB');
          default:
            return true;
        }
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'roll') {
        comparison = a.hall_ticket.localeCompare(b.hall_ticket);
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'sgpa') {
        const valA = parseFloat(a.sgpa) || 0;
        const valB = parseFloat(b.sgpa) || 0;
        comparison = valA - valB;
      } else if (sortBy === 'cgpa') {
        const valA = parseFloat(a.cgpa) || 0;
        const valB = parseFloat(b.cgpa) || 0;
        comparison = valA - valB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, searchQuery, sortBy, sortOrder, gradeFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-white dark:bg-black transition-colors duration-200">
      <div className="p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6 flex-1 flex flex-col print:hidden">
        
        {/* 1. Header Section */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200 dark:border-neutral-800">
            <Search size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">Student Search & Directory</h1>
            <p className="text-slate-500 dark:text-slate-400">Search student records, sort by performance, and view full grade cards</p>
          </div>
        </div>

        {/* 2. Controls Section */}
        <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl border border-slate-200/85 dark:border-neutral-800 shadow-xs space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name or hall ticket number..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-sm"
            />
          </div>

          {/* Filtering & Sorting Controls */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {/* Sort Criteria */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-black px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-800">
              <span className="text-slate-400 flex items-center gap-1"><ArrowDownAz className="w-3.5 h-3.5" /> Sort By:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="roll">Roll Number</option>
                <option value="name">Alphabetical (Name)</option>
                <option value="sgpa">SGPA (Semester Grade)</option>
                <option value="cgpa">CGPA (Cumulative Grade)</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center space-x-1 bg-slate-50 dark:bg-black px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-900 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>

            {/* Grade filter */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-black px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-800">
              <span className="text-slate-400 flex items-center gap-1"><SlidersHorizontal className="w-3.5 h-3.5" /> Filter:</span>
              <select
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value as any)}
                className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Records</option>
                <option value="distinction">Distinction (SGPA ≥ 9.0)</option>
                <option value="pass">Passed (SGPA ≥ 5.0)</option>
                <option value="support">Needs Support (SGPA &lt; 6.0)</option>
                <option value="backlogs">Has Backlogs / F-Grades</option>
              </select>
            </div>
            
            <div className="text-slate-400 ml-auto font-mono text-[11px]">
              Found {processedStudents.length} of {students.length} students
            </div>
          </div>
        </div>

        {/* 3. Full-Width Table Layout */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 flex-1 space-y-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading student directory...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[500px]">
            <div className="px-5 py-4 bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Student Directory List</span>
                {role === 'admin' && selectedRolls.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-3.5 py-1.5 rounded-xl bg-[#DC2626] dark:bg-[#EF4444] text-white hover:bg-[#B91C1C] dark:hover:bg-[#DC2626] text-[11px] font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-500/30"
                  >
                    <span>🗑 Delete Selected ({selectedRolls.length})</span>
                  </button>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">Click any row or button to view report memo</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-neutral-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-neutral-800 font-bold uppercase tracking-wider text-[10px]">
                    {role === 'admin' && (
                      <th className="p-4 text-left font-bold w-12" rowSpan={2}>
                        <input
                          type="checkbox"
                          checked={processedStudents.length > 0 && processedStudents.every(st => selectedRolls.includes(st.hall_ticket))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRolls(processedStudents.map(st => st.hall_ticket));
                            } else {
                              setSelectedRolls([]);
                            }
                          }}
                          className="w-4 h-4 rounded text-red-650 focus:ring-red-500 border-slate-300 dark:border-neutral-800 bg-white dark:bg-black cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="p-4 text-left font-bold" rowSpan={2}>S.No</th>
                    <th className="p-4 text-left font-bold" rowSpan={2}>Hall Ticket</th>
                    <th className="p-4 text-left font-bold" rowSpan={2}>Student Name</th>
                    <th className="p-2 text-center border-b border-slate-200 dark:border-neutral-800" colSpan={2}>Rank</th>
                    <th className="p-4 text-center font-bold" rowSpan={2}>SGPA</th>
                    <th className="p-4 text-center font-bold" rowSpan={2}>CGPA</th>
                    <th className="p-4 text-right font-bold" rowSpan={2}>Details</th>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-neutral-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-neutral-800 font-bold uppercase tracking-wider text-[9px]">
                    <th className="p-2 text-center border-r border-slate-200 dark:border-neutral-800">SGPA</th>
                    <th className="p-2 text-center">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {processedStudents.map((st, idx) => (
                    <tr
                      key={st.hall_ticket}
                      onClick={() => {
                        setSelectedStudent(st);
                        setIsMemoOpen(true);
                      }}
                      className="hover:bg-slate-500/5 dark:hover:bg-neutral-900 cursor-pointer transition"
                    >
                      {role === 'admin' && (
                        <td className="p-4 w-12" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRolls.includes(st.hall_ticket)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                  setSelectedRolls(prev => [...prev, st.hall_ticket]);
                              } else {
                                  setSelectedRolls(prev => prev.filter(roll => roll !== st.hall_ticket));
                              }
                            }}
                            className="w-4 h-4 rounded text-red-650 focus:ring-red-500 border-slate-300 dark:border-neutral-800 bg-white dark:bg-black cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="p-4 font-bold text-slate-400 font-mono">#{idx + 1}</td>
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{st.hall_ticket}</td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{st.name}</td>
                      <td className="p-2 text-center font-mono font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-neutral-800">
                        {st.is_missing ? '-' : `#${studentRanks.sgpaRanks[st.hall_ticket] ?? '-'}`}
                      </td>
                      <td className="p-2 text-center font-mono font-semibold text-slate-500 dark:text-slate-400">
                        {st.is_missing ? '-' : `#${studentRanks.cgpaRanks[st.hall_ticket] ?? '-'}`}
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-purple-600 dark:text-purple-400">{st.sgpa}</td>
                      <td className="p-4 text-center font-mono font-bold text-cyan-600 dark:text-cyan-400">{st.cgpa}</td>
                      <td className="p-4 text-right">
                        <button className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-450 hover:bg-purple-500/25 text-[11px] font-bold transition cursor-pointer">
                          View Memo
                        </button>
                      </td>
                    </tr>
                  ))}
                  {processedStudents.length === 0 && (
                    <tr>
                      <td colSpan={role === 'admin' ? 9 : 8} className="text-center py-24 text-slate-400 dark:text-slate-500 italic space-y-2">
                        <User className="w-12 h-12 mx-auto opacity-30 mb-2" />
                        <p>No matching student records found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      <FooterBar />

      {/* 4. Student Memo Modal Popup */}
      {isMemoOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:absolute print:inset-0 print:bg-white print:p-0 print:z-50 print:block">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:w-full print:max-w-full print:h-screen print:max-h-screen print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-neutral-850 bg-slate-50 dark:bg-neutral-900 flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    🎓 Student Grade Card Memo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official grade card memo for {selectedStudent.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMemoOpen(false);
                  setSelectedStudent(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Body (The actual Academic Memo Layout) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 print:p-0 print:overflow-visible">
              <div className="p-6 bg-slate-50/50 dark:bg-neutral-900/50 border border-slate-200/50 dark:border-neutral-800 rounded-2xl shadow-2xs space-y-6 print:border-none print:bg-white print:shadow-none print:p-0">
                
                {/* Institution Header */}
                <div className="text-center pb-4 border-b border-slate-200 dark:border-neutral-800 space-y-1">
                  <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Academic Institution (Autonomous)
                  </h2>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Accredited by NBA & NAAC | Affiliated to University
                  </p>
                  <p className="text-[10px] font-bold text-purple-500 dark:text-purple-400 uppercase tracking-widest pt-1">
                    {selectedStudent.exam || 'B.E. IV-SEM (MAIN) JUNE 2026'}
                  </p>
                </div>

                {/* Bio Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-white dark:bg-black rounded-xl border border-slate-200/80 dark:border-neutral-800 text-xs print:border print:border-slate-200">
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-400">Hall Ticket No</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{selectedStudent.hall_ticket}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-400">Candidate Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedStudent.name}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-400">Father Name</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedStudent.father_name}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-[9px] font-bold uppercase text-slate-400">Course / Branch</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedStudent.course}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-400">Status</span>
                    <span className={`inline-block font-bold text-[10px] ${selectedStudent?.is_missing ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {selectedStudent?.is_missing ? 'RECORD NOT FOUND' : 'PASSED / PROMOTED'}
                    </span>
                  </div>
                </div>

                {/* SGPA / CGPA Highlights */}
                {!selectedStudent?.is_missing && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-purple-550/5 border border-purple-500/10 text-center shadow-3xs print:border print:border-slate-100 print:bg-slate-50">
                      <span className="block text-[9px] font-bold uppercase text-purple-600 dark:text-purple-400 mb-0.5">Semester SGPA</span>
                      <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{selectedStudent.sgpa}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-center shadow-3xs print:border print:border-slate-100 print:bg-slate-50">
                      <span className="block text-[9px] font-bold uppercase text-cyan-600 dark:text-cyan-400 mb-0.5">Cumulative CGPA</span>
                      <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{selectedStudent.cgpa}</span>
                    </div>
                  </div>
                )}

                {/* Subjects Grade Table */}
                {!selectedStudent?.is_missing && selectedStudent.subjects && selectedStudent.subjects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      Subject Wise Grade Breakdown
                    </h4>
                    <div className="overflow-hidden border border-slate-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-black max-h-52 overflow-y-auto print:max-h-none print:overflow-visible print:border print:border-slate-250">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-neutral-900 z-10 print:bg-slate-50">
                          <tr className="text-slate-600 dark:text-slate-350 border-b border-slate-200 dark:border-neutral-800 font-bold">
                            <th className="p-2">Subject Code</th>
                            <th className="p-2">Subject Name</th>
                            <th className="p-2 text-center">Credits</th>
                            <th className="p-2 text-center">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                          {selectedStudent.subjects.map((sub, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-neutral-900/30">
                              <td className="p-2 font-mono font-semibold text-slate-900 dark:text-white">{sub.subject_code}</td>
                              <td className="p-2 text-slate-700 dark:text-slate-300 truncate max-w-[240px] print:max-w-none">{sub.subject_name}</td>
                              <td className="p-2 text-center text-slate-500 font-mono">{sub.credits}</td>
                              <td className="p-2 text-center">
                                <span className={`px-2 py-0.5 rounded-md font-bold font-mono text-[10px] ${
                                  sub.grade === 'O' || sub.grade === 'A+' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                  sub.grade === 'A' || sub.grade === 'B+' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                                  sub.grade === 'F' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {sub.grade}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Mandatory Requirements */}
                {!selectedStudent?.is_missing && selectedStudent.mandatory_requirements && selectedStudent.mandatory_requirements.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider print:hidden">
                      Mandatory Requirements
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:hidden">
                      {selectedStudent.mandatory_requirements.map((req, idx) => (
                        <div key={idx} className="p-2 bg-white dark:bg-black rounded-lg border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[200px]">{req.activity}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-neutral-850 bg-slate-50 dark:bg-neutral-900 flex justify-between items-center print:hidden">
              <button
                onClick={() => {
                  setIsMemoOpen(false);
                  setSelectedStudent(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Student Memo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
