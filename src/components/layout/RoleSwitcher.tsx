import React from 'react';
import { GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RoleSwitcher: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-base border border-border-subtle text-xs"
      aria-label={`Signed in as ${user?.role || 'unknown'}`}
    >
      <span className={`w-2 h-2 rounded-full ${isTeacher ? 'bg-accent-primary' : 'bg-status-success'}`} />
      {isTeacher ? (
        <Shield size={13} className="text-accent-primary" />
      ) : (
        <GraduationCap size={13} className="text-accent-primary" />
      )}
      <span className="font-medium text-text-primary">
        {isTeacher ? 'Teacher Console' : user?.name || 'Student'}
      </span>
    </div>
  );
};
