import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../lib/useAppState';
import { Shield, GraduationCap, LogOut } from 'lucide-react';

export const UserChip: React.FC = () => {
  const { user, logout } = useAuth();
  const { state } = useAppState();

  const currentRole = user?.role || state.currentRole;
  const currentStudent = state.currentStudentId
    ? state.students.find((s) => s.id === state.currentStudentId)
    : null;

  const displayName = user?.name || (currentRole === 'teacher' ? state.teacher.name : currentStudent?.name || 'Student');
  const displayEmail = user?.email || (currentRole === 'teacher' ? state.teacher.email : currentStudent?.email || '');

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="flex items-center gap-3 pl-2 border-l border-border-subtle">
      <div className="flex items-center gap-2">
        {currentRole === 'teacher' ? (
          <div className="w-7 h-7 rounded-full bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center text-xs font-medium text-accent-primary">
            <Shield size={14} />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-medium text-emerald-400 font-mono">
            {initials || <GraduationCap size={14} />}
          </div>
        )}

        <div className="hidden md:block text-left text-xs leading-tight">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-text-primary truncate max-w-[130px]">{displayName}</p>
            <span
              className={`text-[9px] uppercase font-mono px-1 py-0.2 rounded border ${
                currentRole === 'teacher'
                  ? 'bg-accent-primary/15 text-accent-primary border-accent-primary/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {currentRole === 'teacher' ? 'Faculty' : 'Student'}
            </span>
          </div>
          <p className="text-[11px] text-text-muted truncate max-w-[130px]">{displayEmail}</p>
        </div>
      </div>

      {/* Sign Out Action Button */}
      <button
        type="button"
        onClick={() => logout()}
        title="Sign out of system"
        className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors flex items-center gap-1 text-xs"
      >
        <LogOut size={14} />
        <span className="hidden xl:inline text-[11px]">Sign Out</span>
      </button>
    </div>
  );
};
