import React from 'react';
import { Menu, X, Shield, Database, Lock } from 'lucide-react';
import { useAppState } from '../../lib/useAppState';
import { useAuth } from '../../context/AuthContext';
import { RoleSwitcher } from './RoleSwitcher';
import { UserChip } from './UserChip';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const { isDbConnected, isLoadingDb } = useAppState();
  const { user } = useAuth();

  return (
    <header className="h-14 w-full bg-bg-surface border-b border-border-subtle sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile menu toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label={isMobileSidebarOpen ? "Close navigation" : "Open navigation"}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised transition-colors md:hidden"
        >
          {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex items-center gap-2.5 font-semibold text-sm tracking-tight text-text-primary">
          <div className="w-7 h-7 rounded-lg bg-accent-primary/15 border border-accent-primary/30 flex items-center justify-center text-accent-primary">
            <Shield size={16} />
          </div>
          <span className="hidden sm:inline">Student Data Manager</span>
          <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-bg-surface-raised border border-border-subtle text-text-muted font-mono">
            v1.0
          </span>
        </div>

        {/* MongoDB Atlas Real-Time Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-base border border-border-subtle text-[11px] font-mono">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDbConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                : isLoadingDb
                ? 'bg-amber-400 animate-pulse'
                : 'bg-text-muted'
            }`}
          />
          <Database size={11} className={isDbConnected ? 'text-emerald-400' : 'text-text-muted'} />
          <span className={isDbConnected ? 'text-emerald-400 font-medium' : 'text-text-muted'}>
            {isDbConnected ? 'MongoDB Atlas' : isLoadingDb ? 'Connecting Atlas...' : 'Local Cache Mode'}
          </span>
        </div>
      </div>

      {/* Center/Right: Session Controls & User Profile */}
      <div className="flex items-center gap-3">
        {user?.role === 'teacher' ? (
          <RoleSwitcher />
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-base border border-border-subtle text-[11px] font-mono text-emerald-400">
            <Lock size={12} className="text-emerald-400" />
            <span>Vault: {user?.studentId}</span>
          </div>
        )}
        <UserChip />
      </div>
    </header>
  );
};
