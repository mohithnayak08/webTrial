import React from 'react';
import { Student } from '../../../types';
import { Avatar } from '../../ui/Avatar';
import { StatusBadge } from '../../ui/StatusBadge';
import {
  ArrowLeft,
  CalendarCheck,
  GraduationCap,
  Mail,
  Pencil,
  BookOpen,
} from 'lucide-react';

export interface ProfileHeaderProps {
  student: Student;
  onBack?: () => void;
  onEditProfile?: () => void;
  badgeLabel?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  student,
  onBack,
  onEditProfile,
  badgeLabel,
}) => {
  const hasTopRow = Boolean(onBack || onEditProfile || badgeLabel);

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-6">
      {/* Top Breadcrumb & Action Row */}
      {hasTopRow && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors self-start"
            >
              <ArrowLeft size={14} />
              <span>Back to Student Roster</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{badgeLabel || 'Student Performance Telemetry • Read-Only'}</span>
            </div>
          )}

          {onEditProfile && (
            <button
              type="button"
              onClick={onEditProfile}
              className="px-3 py-1.5 rounded-lg bg-bg-surface-raised hover:bg-bg-base border border-border-subtle hover:border-border-focus text-xs font-medium text-text-primary flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Pencil size={13} className="text-accent-primary" />
              <span>Edit Student Info</span>
            </button>
          )}
        </div>
      )}

      {/* Main Identity & Large Stats Grid */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2 border-t border-border-subtle">
        {/* Left: Avatar & Basic Information */}
        <div className="flex items-start gap-4">
          <Avatar initials={student.avatarInitials} size="lg" className="w-16 h-16 text-xl border-2 border-border-focus" />

          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                {student.name}
              </h1>
              <StatusBadge status={student.status} />
            </div>

            <div className="flex items-center gap-3 text-xs text-text-muted font-mono flex-wrap">
              <span className="text-accent-primary font-semibold">
                {student.id}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-bg-base border border-border-subtle text-text-secondary">
                {student.section}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-text-secondary">
                <Mail size={12} className="text-text-muted" />
                {student.email}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Key Performance Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
          {/* GPA Card */}
          <div className="p-3 rounded-xl bg-bg-base border border-border-subtle">
            <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase">
              <GraduationCap size={12} className="text-accent-primary" />
              <span>Cumulative GPA</span>
            </div>
            <div className="text-xl font-bold text-text-primary tabular-nums mt-1 font-sans">
              {student.gpa.toFixed(2)}{' '}
              <span className="text-xs text-text-muted font-normal">/ 4.00</span>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="p-3 rounded-xl bg-bg-base border border-border-subtle">
            <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase">
              <CalendarCheck size={12} className="text-emerald-400" />
              <span>Attendance Rate</span>
            </div>
            <div className="text-xl font-bold text-text-primary tabular-nums mt-1 font-sans">
              {student.attendancePct.toFixed(1)}%
            </div>
          </div>

          {/* Courses Evaluated */}
          <div className="p-3 rounded-xl bg-bg-base border border-border-subtle col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-text-muted text-[10px] uppercase">
              <BookOpen size={12} className="text-sky-400" />
              <span>Courses Logged</span>
            </div>
            <div className="text-xl font-bold text-text-primary tabular-nums mt-1 font-sans">
              {student.grades.length}{' '}
              <span className="text-xs text-text-muted font-normal">Subjects</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
