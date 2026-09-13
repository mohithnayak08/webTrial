import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../../lib/useAppState';
import { useAuth } from '../../context/AuthContext';
import {
  Check,
  ChevronDown,
  GraduationCap,
  Search,
  Shield,
  Loader2,
} from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { state } = useAppState();
  const { user, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeRole = user ? user.role : state.currentRole;
  const activeStudentId = user?.studentId || state.currentStudentId;

  const currentStudent = activeStudentId
    ? state.students.find((s) => s.id === activeStudentId)
    : null;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key and focus search on open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTeacher = async () => {
    setIsSwitching(true);
    setIsOpen(false);
    try {
      await login('e.vance@school.edu', 'Teacher123!');
    } catch (err) {
      console.error('Failed to switch to teacher account:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleSelectStudent = async (studentId: string) => {
    setIsSwitching(true);
    setIsOpen(false);
    try {
      await login(studentId, 'Student123!');
    } catch (err) {
      console.error(`Failed to switch to student account ${studentId}:`, err);
    } finally {
      setIsSwitching(false);
    }
  };

  const filteredStudents = state.students.filter(
    (s) =>
      s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.section.toLowerCase().includes(filterQuery.toLowerCase()),
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-base hover:bg-bg-surface-raised border border-border-subtle hover:border-border-focus text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-accent-primary"
      >
        {isSwitching ? (
          <div className="flex items-center gap-1.5 text-text-muted">
            <Loader2 size={13} className="animate-spin text-accent-primary" />
            <span>Switching...</span>
          </div>
        ) : activeRole === 'teacher' ? (
          <>
            <span className="w-2 h-2 rounded-full bg-accent-primary" />
            <span className="text-text-muted hidden sm:inline">Role:</span>
            <span className="font-medium text-text-primary flex items-center gap-1.5">
              <Shield size={13} className="text-accent-primary" />
              <span>Teacher (Console)</span>
            </span>
          </>
        ) : (
          <>
            <span
              className={`w-2 h-2 rounded-full ${
                currentStudent?.status === 'good'
                  ? 'bg-status-success'
                  : currentStudent?.status === 'warning'
                    ? 'bg-status-warning'
                    : 'bg-status-danger'
              }`}
            />
            <span className="text-text-muted hidden sm:inline">Student:</span>
            <span className="font-medium text-text-primary flex items-center gap-1.5">
              <GraduationCap size={13} className="text-accent-primary" />
              <span className="max-w-[110px] truncate">{currentStudent?.name || 'Selected Student'}</span>
            </span>
          </>
        )}
        <ChevronDown
          size={14}
          className={`text-text-muted transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-bg-surface border border-border-subtle shadow-xl shadow-black/50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-border-subtle">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-2 py-1">
              Simulated Identity Switcher
            </div>
            {/* Quick search input */}
            <div className="relative mt-1">
              <Search size={13} className="absolute left-2.5 top-2.5 text-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter identity or ID..."
                className="w-full bg-bg-base border border-border-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
            {/* Teacher Option */}
            <div className="px-2 pt-1 pb-0.5 text-[10px] font-mono uppercase text-text-muted tracking-wider">
              Faculty / Staff
            </div>
            <button
              type="button"
              onClick={handleSelectTeacher}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                activeRole === 'teacher'
                  ? 'bg-accent-primary/15 text-text-primary border border-accent-primary/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent-primary/20 text-accent-primary flex items-center justify-center font-medium">
                  <Shield size={14} />
                </div>
                <div>
                  <div className="font-medium text-text-primary flex items-center gap-1.5">
                    <span>{state.teacher.name}</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-bg-base border border-border-subtle text-accent-primary">
                      TCH
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted">{state.teacher.email}</div>
                </div>
              </div>
              {activeRole === 'teacher' && (
                <Check size={14} className="text-accent-primary" />
              )}
            </button>

            {/* Students List */}
            <div className="px-2 pt-3 pb-0.5 text-[10px] font-mono uppercase text-text-muted tracking-wider flex items-center justify-between">
              <span>Student Records</span>
              <span className="tabular-nums font-mono text-[10px] text-text-muted">
                {filteredStudents.length} available
              </span>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-xs text-text-muted">
                No matching students found
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isSelected =
                  activeRole === 'student' &&
                  activeStudentId === student.id;

                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectStudent(student.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-accent-primary/15 text-text-primary border border-accent-primary/30'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-bg-surface-raised border border-border-subtle text-text-primary flex items-center justify-center font-mono text-[11px] font-medium shrink-0">
                        {student.avatarInitials}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="font-medium text-text-primary truncate flex items-center gap-1.5">
                          <span className="truncate">{student.name}</span>
                          <span className="font-mono text-[10px] text-text-muted">
                            {student.id}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted truncate">
                          {student.section} • GPA {student.gpa.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          student.status === 'good'
                            ? 'bg-status-success'
                            : student.status === 'warning'
                              ? 'bg-status-warning'
                              : 'bg-status-danger'
                        }`}
                      />
                      {isSelected && (
                        <Check size={14} className="text-accent-primary" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
