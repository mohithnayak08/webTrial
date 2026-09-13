import React, { useState } from 'react';
import { useMyProfile } from '../../lib/useMyProfile';
import { useAuth } from '../../context/AuthContext';
import { ProfileHeader } from '../teacher/detail/ProfileHeader';
import { StatRow } from './StatRow';
import { AttendanceHeatmap } from './AttendanceHeatmap';
import { GradesTable } from '../teacher/detail/GradesTable';
import { FeedbackTimeline } from '../teacher/detail/FeedbackTimeline';
import {
  BookOpen,
  CalendarCheck,
  MessageSquare,
  ShieldAlert,
  Layers,
  Lock,
} from 'lucide-react';

export type StudentDashboardTab = 'overview' | 'grades' | 'attendance' | 'feedback';

export interface StudentDashboardPageProps {
  initialTab?: StudentDashboardTab;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  initialTab = 'overview',
}) => {
  const { student, isAuthorized, isLoading, error } = useMyProfile();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<StudentDashboardTab>(initialTab);

  if (isLoading) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center space-y-4 max-w-lg mx-auto mt-8">
        <div className="w-8 h-8 border-2 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-text-muted">Loading student performance telemetry...</p>
      </div>
    );
  }

  // Hard Boundary Check (§3.4)
  if (!isAuthorized || !student) {
    return (
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-12 text-center space-y-4 max-w-lg mx-auto mt-8">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-text-primary">
            Student Access Boundary Guard
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            {error || 'No active student session found. Please sign in with your student account.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-medium inline-flex items-center gap-2 transition-colors"
        >
          <span>Sign In as Another User</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Profile Header (strictly read-only, no edit or back buttons) */}
      <ProfileHeader
        student={student}
        badgeLabel="Student Performance Telemetry • Read-Only Session"
      />

      {/* 2. Three-Card Key Metric StatRow (§2.3) */}
      <StatRow student={student} />

      {/* 3. Section Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-bg-surface border border-border-subtle overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50 shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Layers size={13} className={activeTab === 'overview' ? 'text-accent-primary' : 'text-text-muted'} />
            <span>Overview &amp; All Records</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grades')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'grades'
                ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50 shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen size={13} className={activeTab === 'grades' ? 'text-accent-primary' : 'text-text-muted'} />
            <span>Subject Grades ({student.grades.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'attendance'
                ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50 shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CalendarCheck size={13} className={activeTab === 'attendance' ? 'text-emerald-400' : 'text-text-muted'} />
            <span>Attendance Heatmap ({student.attendance.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'feedback'
                ? 'bg-bg-surface-raised text-text-primary border border-border-focus/50 shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <MessageSquare size={13} className={activeTab === 'feedback' ? 'text-accent-primary' : 'text-text-muted'} />
            <span>Teacher Notes ({student.feedback.length})</span>
          </button>
        </div>

        {/* Read-only Security Indicator (§2.3 & §3.4) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted font-mono px-3 py-1 rounded-lg bg-bg-base border border-border-subtle">
          <Lock size={12} className="text-text-muted" />
          <span>Student Vault Intact</span>
        </div>
      </div>

      {/* 4. Sub-Section Content Panes */}
      <div className="space-y-6">
        {(activeTab === 'overview' || activeTab === 'grades') && (
          <GradesTable
            grades={student.grades}
            onSaveGrades={() => {}}
            editable={false}
          />
        )}

        {(activeTab === 'overview' || activeTab === 'attendance') && (
          <AttendanceHeatmap attendance={student.attendance} />
        )}

        {(activeTab === 'overview' || activeTab === 'feedback') && (
          <FeedbackTimeline
            feedback={student.feedback}
            onSaveFeedback={() => {}}
            editable={false}
          />
        )}
      </div>
    </div>
  );
};
