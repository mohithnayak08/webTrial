import React from 'react';
import { Student } from '../../types';
import { CalendarCheck, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';

export interface AttendanceRingProps {
  student: Student;
}

export const AttendanceRing: React.FC<AttendanceRingProps> = ({ student }) => {
  const { attendance, attendancePct } = student;
  const total = attendance.length;
  const present = attendance.filter((a) => a.status === 'present').length;
  const late = attendance.filter((a) => a.status === 'late').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;
  const excused = attendance.filter((a) => a.status === 'excused').length;

  // SVG Circle calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, attendancePct));
  const strokeOffset = circumference - (clampedPct / 100) * circumference;

  const getRingColor = (pct: number) => {
    if (pct >= 90) return 'text-emerald-400 stroke-emerald-400';
    if (pct >= 75) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const ringColorClass = getRingColor(clampedPct);

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-secondary text-xs">
          <CalendarCheck size={16} className="text-emerald-400" />
          <span className="uppercase tracking-wider font-mono font-medium text-[11px]">
            Attendance Health
          </span>
        </div>
        <span className="text-[11px] font-mono text-text-muted">
          {total} Sessions
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* SVG Progress Ring */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-bg-base"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Value Ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className={`transition-all duration-500 ease-out ${ringColorClass}`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Centered Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-bold font-sans text-text-primary tabular-nums">
              {attendancePct.toFixed(0)}%
            </span>
            <span className="text-[9px] font-mono uppercase text-text-muted">Rate</span>
          </div>
        </div>

        {/* Detailed Count Grid */}
        <div className="flex-1 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded-lg bg-bg-base border border-border-subtle flex items-center justify-between">
            <span className="flex items-center gap-1 text-text-muted text-[11px]">
              <CheckCircle2 size={11} className="text-emerald-400" /> Pres:
            </span>
            <span className="font-bold text-text-primary tabular-nums">{present}</span>
          </div>

          <div className="p-2 rounded-lg bg-bg-base border border-border-subtle flex items-center justify-between">
            <span className="flex items-center gap-1 text-text-muted text-[11px]">
              <Clock size={11} className="text-amber-400" /> Late:
            </span>
            <span className="font-bold text-text-primary tabular-nums">{late}</span>
          </div>

          <div className="p-2 rounded-lg bg-bg-base border border-border-subtle flex items-center justify-between">
            <span className="flex items-center gap-1 text-text-muted text-[11px]">
              <XCircle size={11} className="text-rose-400" /> Abs:
            </span>
            <span className="font-bold text-rose-400 tabular-nums">{absent}</span>
          </div>

          <div
            className="p-2 rounded-lg bg-bg-base border border-border-subtle flex items-center justify-between"
            title="Excused days are excluded from the rate denominator per §3.6"
          >
            <span className="flex items-center gap-1 text-text-muted text-[11px]">
              <HelpCircle size={11} className="text-sky-400" /> Excd:
            </span>
            <span className="font-bold text-sky-400 tabular-nums">{excused}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border-subtle text-[11px] text-text-muted flex items-center justify-between">
        <span>Excused sessions excluded from denominator</span>
        <span className="font-mono text-emerald-400">
          {attendancePct >= 90 ? 'Compliant' : attendancePct >= 75 ? 'Warning' : 'At Risk'}
        </span>
      </div>
    </div>
  );
};
