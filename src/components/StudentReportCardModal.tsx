import React, { useState } from 'react';
import { X, Search, Printer, Download, CheckCircle, AlertCircle, FileText, User } from 'lucide-react';
import { Student } from '../types';

interface StudentReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  isOpen,
  onClose
}) => {
  const [hallTicket, setHallTicket] = useState<string>('');
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hallTicket.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/${encodeURIComponent(hallTicket.trim())}`);
      if (!res.ok) {
        throw new Error(`Student ${hallTicket} not found`);
      }
      const data = await res.json();
      setStudent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to find student');
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                🎓 Candidate Grade Card & Result Inspector
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct database lookup & official memo layout preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={hallTicket}
                onChange={e => setHallTicket(e.target.value)}
                placeholder="Enter Hall Ticket No..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
            >
              {loading ? <Search className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Find Result</span>
            </button>
          </form>
        </div>

        {/* Grade Memo Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!student && !error && !loading && (
            <div className="text-center py-12 space-y-3">
              <User className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs text-slate-500">Enter a valid Hall Ticket number above to view candidate grade card.</p>
            </div>
          )}

          {student && (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-6 print:border-none print:shadow-none">
              {/* Institution Header */}
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1">
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Academic Institution (Autonomous)
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Accredited by NBA & NAAC | Affiliated to University
                </p>
                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest pt-1">
                  {student.exam || 'B.E. II-Sem (Main) Examination Result'}
                </p>
              </div>

              {/* Bio Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Hall Ticket No</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">{student.hall_ticket}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Candidate Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Father Name</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{student.father_name}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Course / Branch</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{student.course}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-400">Status</span>
                  <span className={`inline-block font-bold text-[11px] ${student?.is_missing ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {student?.is_missing ? 'RECORD NOT FOUND' : 'PASSED / PROMOTED'}
                  </span>
                </div>
              </div>

              {/* SGPA / CGPA Highlights */}
              {!student?.is_missing && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <span className="block text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">Semester SGPA</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{student.sgpa}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                    <span className="block text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400">Cumulative CGPA</span>
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">{student.cgpa}</span>
                  </div>
                </div>
              )}

              {/* Subjects Grade Table */}
              {!student?.is_missing && student.subjects && student.subjects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Subject Wise Grade Breakdown
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                          <th className="p-2.5">Subject Code</th>
                          <th className="p-2.5">Subject Name</th>
                          <th className="p-2.5 text-center">Credits</th>
                          <th className="p-2.5 text-center">Grade Awarded</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {student.subjects.map((sub, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="p-2.5 font-mono font-semibold text-slate-900 dark:text-white">{sub.subject_code}</td>
                            <td className="p-2.5 text-slate-700 dark:text-slate-300">{sub.subject_name}</td>
                            <td className="p-2.5 text-center text-slate-500 font-mono">{sub.credits}</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2.5 py-0.5 rounded-md font-bold font-mono text-xs ${
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
              {student.mandatory_requirements && student.mandatory_requirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                    Mandatory Requirements & Activities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {student.mandatory_requirements.map((req, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{req.activity}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
          >
            Close
          </button>

          {student && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Grade Memo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
