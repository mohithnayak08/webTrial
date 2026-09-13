import React from 'react';
import { useAppState } from '../../lib/useAppState';
import { Shield } from 'lucide-react';

export const UserChip: React.FC = () => {
  const { state } = useAppState();

  const currentStudent = state.currentStudentId
    ? state.students.find((s) => s.id === state.currentStudentId)
    : null;

  if (state.currentRole === 'teacher') {
    return (
      <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
        <div className="w-7 h-7 rounded-full bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center text-xs font-medium text-accent-primary">
          <Shield size={14} />
        </div>
        <div className="hidden md:block text-left text-xs leading-tight">
          <div className="flex items-center gap-1.5">
            <p className="font-medium text-text-primary">{state.teacher.name}</p>
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-accent-primary/15 text-accent-primary border border-accent-primary/30">
              Teacher
            </span>
          </div>
          <p className="text-[11px] text-text-muted">{state.teacher.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
      <div className="w-7 h-7 rounded-full bg-bg-surface-raised border border-border-subtle flex items-center justify-center text-xs font-medium text-text-primary font-mono">
        {currentStudent?.avatarInitials || 'ST'}
      </div>
      <div className="hidden md:block text-left text-xs leading-tight">
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-text-primary truncate max-w-[120px]">
            {currentStudent?.name || 'Student'}
          </p>
          <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-bg-surface-raised text-text-secondary border border-border-subtle">
            Student
          </span>
        </div>
        <p className="text-[11px] text-text-muted font-mono">
          {currentStudent?.id || ''} • {currentStudent?.section || ''}
        </p>
      </div>
    </div>
  );
};
