import React from 'react';
import { Student } from '../../types';
import { calculateOverallGradeBand } from '../../lib/derived';
import { GraduationCap, Award, BookOpen } from 'lucide-react';

export interface GpaCardProps {
  student: Student;
}

export const GpaCard: React.FC<GpaCardProps> = ({ student }) => {
  const gradeBand = calculateOverallGradeBand(student.grades);

  const getBandBadge = (band: string) => {
    switch (band) {
      case 'A':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          label: 'Honor Tier (A)',
        };
      case 'B':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          label: 'Commendable (B)',
        };
      case 'C':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          label: 'Satisfactory (C)',
        };
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          label: 'Intervention Required (D/F)',
        };
    }
  };

  const badge = getBandBadge(gradeBand);

  // Subject average
  const avgScore =
    student.grades.length > 0
      ? Math.round(
          student.grades.reduce((sum, g) => sum + g.score, 0) /
            student.grades.length,
        )
      : 0;

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-secondary text-xs">
          <GraduationCap size={16} className="text-accent-primary" />
          <span className="uppercase tracking-wider font-mono font-medium text-[11px]">
            Cumulative GPA
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${badge.bg}`}
        >
          {badge.label}
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-sans text-text-primary tabular-nums tracking-tight">
            {student.gpa.toFixed(2)}
          </span>
          <span className="text-sm font-mono text-text-muted">/ 4.00</span>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Weighted across{' '}
          <strong className="text-text-primary font-mono tabular-nums">
            {student.grades.length}
          </strong>{' '}
          coursework evaluation{student.grades.length === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Award size={13} className="text-accent-primary" />
          <span>Cohort Avg Score:</span>
          <strong className="text-text-primary tabular-nums">{avgScore}%</strong>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-text-muted">
          <BookOpen size={12} />
          <span>{student.grades.filter((g) => g.letter === 'A').length} A's</span>
        </div>
      </div>
    </div>
  );
};
