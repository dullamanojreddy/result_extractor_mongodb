import React, { useState, useEffect } from 'react';
import { GraduationCap, User, Mail, Lock, Building2, UserPlus } from 'lucide-react';
import { register, setAuthData } from '../services/auth';
import API_URL from '../config/api';

interface RegisterProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [colleges, setColleges] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [collegesLoading, setCollegesLoading] = useState(true);

  useEffect(() => {
    // Fetch existing colleges for dropdown
    setCollegesLoading(true);
    fetch(`${API_URL}/api/colleges`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const names = data.map((c: any) => c.name || c.collegeName).filter(Boolean);
          setColleges(names);
        }
      })
      .catch(err => {
        console.error('Failed to fetch colleges:', err);
      })
      .finally(() => {
        setCollegesLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await register(name, email, password, college);
      setAuthData(token, user);
      onRegister();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="px-5 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-3">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-sm text-purple-100 mt-1">Register your college account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-sm text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@college.edu"
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">College Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <select
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  required
                  disabled={collegesLoading}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-60"
                >
                  <option value="" className="text-slate-400">
                    {collegesLoading ? 'Loading colleges...' : `-- Select your college (${colleges.length} available) --`}
                  </option>
                  {colleges.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-bold transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <button type="button" onClick={onSwitchToLogin} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
