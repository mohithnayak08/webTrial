import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  Database,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your identifier and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await login(identifier.trim(), password);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed');
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await login(demoId, demoPass);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col justify-center items-center p-4 sm:p-6 font-sans selection:bg-accent-primary/20 selection:text-white">
      {/* Background Ambience Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/30 text-accent-primary mb-2 shadow-sm">
            <Shield size={26} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Student Data Manager
          </h1>
          <p className="text-xs text-text-secondary">
            Role-Based Faculty &amp; Student Telemetry Portal
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-bg-surface border border-border-subtle text-[10px] font-mono text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            <Database size={10} className="text-emerald-400" />
            <span>MongoDB Atlas Secured</span>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          <div className="border-b border-border-subtle pb-4">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Lock size={16} className="text-accent-primary" />
              <span>Portal Authentication</span>
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Enter your institutional email or Student ID to continue.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400 animate-in fade-in duration-150">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="identifier"
                  className="block text-[11px] uppercase tracking-wider font-mono text-text-muted font-medium"
                >
                  Institutional Identifier
                </label>
                <span className="text-[10px] font-mono text-accent-primary">
                  Name, ID, or Email
                </span>
              </div>
              <div className="relative">
                <User size={15} className="absolute left-3 top-2.5 text-text-muted" />
                <input
                  id="identifier"
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. e.vance@school.edu, STU-1001, or Aisha Khan"
                  className="w-full bg-bg-base border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] uppercase tracking-wider font-mono text-text-muted font-medium"
                >
                  Password
                </label>
                <span className="text-[10px] font-mono text-text-muted">
                  Faculty: <strong className="text-text-secondary">Teacher123!</strong> | Student: <strong className="text-text-secondary">Student123!</strong>
                </span>
              </div>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-2.5 text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full bg-bg-base border border-border-subtle rounded-lg pl-9 pr-10 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-text-muted hover:text-text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-accent-primary hover:bg-accent-primary-hover disabled:opacity-50 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="pt-4 border-t border-border-subtle space-y-3">
            <div className="flex items-center justify-between text-[10px] uppercase font-mono text-text-muted tracking-wider">
              <span>Quick Demo Sign-In</span>
              <span className="text-accent-primary">1-Click Access</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Teacher One-Click */}
              <button
                type="button"
                onClick={() => handleQuickLogin('e.vance@school.edu', 'Teacher123!')}
                disabled={isSubmitting}
                className="text-left p-2.5 rounded-xl bg-bg-base hover:bg-bg-surface-raised border border-border-subtle hover:border-accent-primary/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-accent-primary/15 text-accent-primary flex items-center justify-center text-xs">
                    <Shield size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-text-primary group-hover:text-accent-primary transition-colors flex items-center gap-1.5">
                      <span>Faculty: Dr. Eleanor Vance</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-accent-primary/10 text-accent-primary">
                        CRUD
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-text-muted">
                      e.vance@school.edu • Teacher123!
                    </div>
                  </div>
                </div>
                <ArrowRight size={13} className="text-text-muted group-hover:text-accent-primary group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Top Student One-Click */}
              <button
                type="button"
                onClick={() => handleQuickLogin('STU-1001', 'Student123!')}
                disabled={isSubmitting}
                className="text-left p-2.5 rounded-xl bg-bg-base hover:bg-bg-surface-raised border border-border-subtle hover:border-emerald-500/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs">
                    <GraduationCap size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-text-primary group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      <span>Student: Aisha Khan</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400">
                        Top Rank
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-text-muted">
                      STU-1001 • Student123!
                    </div>
                  </div>
                </div>
                <ArrowRight size={13} className="text-text-muted group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* At-Risk Student One-Click */}
              <button
                type="button"
                onClick={() => handleQuickLogin('STU-1010', 'Student123!')}
                disabled={isSubmitting}
                className="text-left p-2.5 rounded-xl bg-bg-base hover:bg-bg-surface-raised border border-border-subtle hover:border-amber-500/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs">
                    <GraduationCap size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-text-primary group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      <span>Student: Marcus Bennett</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-400">
                        At-Risk
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-text-muted">
                      STU-1010 • Student123!
                    </div>
                  </div>
                </div>
                <ArrowRight size={13} className="text-text-muted group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Expandable All Accounts Dropdown */}
            <details className="group border border-border-subtle rounded-xl overflow-hidden bg-bg-base transition-colors">
              <summary className="p-2.5 text-xs text-text-secondary hover:text-text-primary cursor-pointer flex items-center justify-between select-none list-none">
                <span className="font-mono text-[11px]">View All 13 Enrolled Accounts (1 Faculty + 12 Students)</span>
                <span className="text-text-muted text-[10px] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-2 border-t border-border-subtle space-y-1 max-h-56 overflow-y-auto">
                {[
                  { id: 'e.vance@school.edu', name: 'Dr. Eleanor Vance', role: 'Faculty', pass: 'Teacher123!', note: 'CRUD' },
                  { id: 'STU-1001', name: 'Aisha Khan', role: 'Student', pass: 'Student123!', note: 'Top Rank' },
                  { id: 'STU-1002', name: 'Rohan Mehta', role: 'Student', pass: 'Student123!', note: 'Good' },
                  { id: 'STU-1003', name: 'Liam O\'Connor', role: 'Student', pass: 'Student123!', note: 'Good' },
                  { id: 'STU-1004', name: 'Maya Lin', role: 'Student', pass: 'Student123!', note: 'Good' },
                  { id: 'STU-1005', name: 'Carlos Rivera', role: 'Student', pass: 'Student123!', note: 'Good' },
                  { id: 'STU-1006', name: 'Priya Sharma', role: 'Student', pass: 'Student123!', note: 'Warning' },
                  { id: 'STU-1007', name: 'David Kim', role: 'Student', pass: 'Student123!', note: 'Warning' },
                  { id: 'STU-1008', name: 'Zoe Washington', role: 'Student', pass: 'Student123!', note: 'Warning' },
                  { id: 'STU-1009', name: 'Ethan Patel', role: 'Student', pass: 'Student123!', note: 'Warning' },
                  { id: 'STU-1010', name: 'Marcus Bennett', role: 'Student', pass: 'Student123!', note: 'At-Risk' },
                  { id: 'STU-1011', name: 'Sophia Chen', role: 'Student', pass: 'Student123!', note: 'At-Risk' },
                  { id: 'STU-1012', name: 'Tariq Al-Mansoor', role: 'Student', pass: 'Student123!', note: 'At-Risk' },
                ].map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => handleQuickLogin(account.id, account.pass)}
                    disabled={isSubmitting}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-bg-surface flex items-center justify-between text-xs transition-colors group/item"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-accent-primary">{account.id}</span>
                      <span className="text-text-primary text-[11px] group-hover/item:text-accent-primary transition-colors">{account.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
                      <span>{account.pass}</span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-bg-surface-raised border border-border-subtle">{account.note}</span>
                    </div>
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-text-muted leading-relaxed font-mono">
          All authentication attempts are hashed via bcrypt and validated strictly on the Express + MongoDB Atlas backend.
        </p>
      </div>
    </div>
  );
};
