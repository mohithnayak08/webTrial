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

        </div>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-text-muted leading-relaxed font-mono">
          All authentication attempts are hashed via bcrypt and validated strictly on the Express + MongoDB Atlas backend.
        </p>
      </div>
    </div>
  );
};
