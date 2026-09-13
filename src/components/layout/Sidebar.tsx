import React from 'react';
import { useAppState } from '../../lib/useAppState';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeView: string;
  onSelectView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  activeView,
  onSelectView,
}) => {
  const { state } = useAppState();
  const { user } = useAuth();

  const isTeacher = user ? user.role === 'teacher' : state.currentRole === 'teacher';
  const activeStudentId = user?.studentId || state.currentStudentId;

  const currentStudent = activeStudentId
    ? state.students.find((s) => s.id === activeStudentId)
    : null;

  const handleNavClick = (view: string) => {
    onSelectView(view);
    onCloseMobile();
  };

  const atRiskCount = state.students.filter((s) => s.status === 'critical').length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* 240px Fixed Sidebar */}
      <aside
        className={`
          fixed md:sticky top-14 bottom-0 left-0 z-40
          w-sidebar h-[calc(100vh-3.5rem)]
          bg-bg-surface border-r border-border-subtle
          flex flex-col justify-between
          transition-transform duration-200 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-3 space-y-6 overflow-y-auto">
          {isTeacher ? (
            /* =========================================
               TEACHER NAVIGATION CONSOLE (§2.2)
               ========================================= */
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-medium tracking-wider uppercase text-text-muted">
                  Faculty Console
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                  CRUD
                </span>
              </div>

              <nav className="space-y-1">
                {/* Overview / Dashboard */}
                <button
                  type="button"
                  onClick={() => handleNavClick('overview')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeView === 'overview'
                      ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
                  }`}
                >
                  <LayoutDashboard
                    size={16}
                    className={
                      activeView === 'overview'
                        ? 'text-accent-primary'
                        : 'text-text-muted'
                    }
                  />
                  <span>Overview</span>
                  {activeView === 'overview' && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-primary" />
                  )}
                </button>

                {/* Student Roster */}
                <button
                  type="button"
                  onClick={() => handleNavClick('roster')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeView === 'roster'
                      ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
                  }`}
                >
                  <Users
                    size={16}
                    className={
                      activeView === 'roster'
                        ? 'text-accent-primary'
                        : 'text-text-muted'
                    }
                  />
                  <span>Student Roster</span>
                  <span className="ml-auto text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-bg-base border border-border-subtle text-text-secondary">
                    {state.students.length}
                  </span>
                </button>
              </nav>

              {/* Faculty Telemetry Card */}
              <div className="mt-6 p-3 rounded-xl bg-bg-base border border-border-subtle space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-[11px]">System Status</span>
                  <span className="flex items-center gap-1.5 text-status-success font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                    Online
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  <div className="p-1.5 rounded bg-bg-surface border border-border-subtle">
                    <div className="text-text-muted text-[10px]">Total Enrolled</div>
                    <div className="font-mono tabular-nums font-semibold text-text-primary">
                      {state.students.length}
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-bg-surface border border-border-subtle">
                    <div className="text-text-muted text-[10px]">At-Risk Cases</div>
                    <div className="font-mono tabular-nums font-semibold text-rose-400">
                      {atRiskCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================
               STUDENT NAVIGATION PORTAL (§2.3)
               Strictly read-only, no cross-student affordances
               ========================================= */
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-medium tracking-wider uppercase text-text-muted">
                  Student Portal
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-bg-base text-text-muted border border-border-subtle">
                  <Lock size={10} /> Read-Only
                </span>
              </div>

              <nav className="space-y-1">
                {/* My Performance */}
                <button
                  type="button"
                  onClick={() => handleNavClick('my-performance')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeView === 'my-performance'
                      ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
                  }`}
                >
                  <GraduationCap
                    size={16}
                    className={
                      activeView === 'my-performance'
                        ? 'text-accent-primary'
                        : 'text-text-muted'
                    }
                  />
                  <span>My Performance</span>
                  {activeView === 'my-performance' && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-primary" />
                  )}
                </button>

                {/* Grades & Remarks */}
                <button
                  type="button"
                  onClick={() => handleNavClick('grades')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeView === 'grades'
                      ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
                  }`}
                >
                  <BookOpen
                    size={16}
                    className={
                      activeView === 'grades'
                        ? 'text-accent-primary'
                        : 'text-text-muted'
                    }
                  />
                  <span>Subject Grades</span>
                  <span className="ml-auto text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-bg-base border border-border-subtle text-text-secondary">
                    {currentStudent?.grades.length || 0}
                  </span>
                </button>

                {/* Attendance Tracker */}
                <button
                  type="button"
                  onClick={() => handleNavClick('attendance')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeView === 'attendance'
                      ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
                  }`}
                >
                  <CalendarCheck
                    size={16}
                    className={
                      activeView === 'attendance'
                        ? 'text-accent-primary'
                        : 'text-text-muted'
                    }
                  />
                  <span>Attendance Log</span>
                  <span className="ml-auto text-[11px] font-mono tabular-nums text-text-muted">
                    {currentStudent?.attendancePct.toFixed(0)}%
                  </span>
                </button>

                {/* Teacher Feedback */}
                <button
                  type="button"
                  onClick={() => handleNavClick('feedback')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeView === 'feedback'
                      ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
                  }`}
                >
                  <MessageSquare
                    size={16}
                    className={
                      activeView === 'feedback'
                        ? 'text-accent-primary'
                        : 'text-text-muted'
                    }
                  />
                  <span>Teacher Notes</span>
                  <span className="ml-auto text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-bg-base border border-border-subtle text-text-secondary">
                    {currentStudent?.feedback.length || 0}
                  </span>
                </button>
              </nav>

              {/* Student Identity Card in Sidebar */}
              {currentStudent && (
                <div className="mt-6 p-3 rounded-xl bg-bg-base border border-border-subtle space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-bg-surface-raised border border-border-subtle flex items-center justify-center font-mono font-bold text-[10px] text-text-primary">
                      {currentStudent.avatarInitials}
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-text-primary truncate">
                        {currentStudent.name}
                      </div>
                      <div className="text-[10px] text-text-muted font-mono">
                        {currentStudent.id}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-border-subtle text-[11px]">
                    <span className="text-text-muted">Current Standing</span>
                    {currentStudent.status === 'good' && (
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <CheckCircle2 size={11} /> Good
                      </span>
                    )}
                    {currentStudent.status === 'warning' && (
                      <span className="flex items-center gap-1 text-amber-400 font-medium">
                        <AlertTriangle size={11} /> Warning
                      </span>
                    )}
                    {currentStudent.status === 'critical' && (
                      <span className="flex items-center gap-1 text-rose-400 font-medium">
                        <AlertOctagon size={11} /> Critical
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="p-3 border-t border-border-subtle text-xs text-text-muted flex items-center justify-between">
          <span className="tabular-nums font-mono text-[11px]">
            {isTeacher ? 'Faculty Mode' : 'Student Mode'}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-text-muted">
            <ShieldCheck size={13} className="text-accent-primary" /> Guarded
          </span>
        </div>
      </aside>
    </>
  );
};
