import React from 'react';
import { Student } from '../../types';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

export interface TrendIndicatorProps {
  student: Student;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ student }) => {
  const { status, grades, attendancePct } = student;

  // Best subject
  const bestSubject =
    grades.length > 0
      ? [...grades].sort((a, b) => b.score - a.score)[0]
      : null;

  // Focus subject (lowest)
  const lowestSubject =
    grades.length > 0
      ? [...grades].sort((a, b) => a.score - b.score)[0]
      : null;

  const getTrendData = () => {
    if (status === 'good') {
      return {
        label: 'Upward Trajectory',
        badge: 'Honor Standing',
        icon: TrendingUp,
        color: 'text-emerald-400',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        summary:
          'Consistent academic performance with high attendance compliance across all coursework.',
      };
    }

    if (status === 'warning') {
      return {
        label: 'Stable Trajectory',
        badge: 'Monitoring',
        icon: Minus,
        color: 'text-amber-400',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        summary:
          attendancePct < 90
            ? 'Coursework performance is on track, but attendance needs reinforcement to reach Honor standing.'
            : 'Attendance is steady, with opportunities to boost coursework scores in upcoming assessments.',
      };
    }

    return {
      label: 'Intervention Needed',
      badge: 'Academic Alert',
      icon: TrendingDown,
      color: 'text-rose-400',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      summary:
        'Immediate faculty review recommended to address attendance gaps and coursework deadlines.',
    };
  };

  const trend = getTrendData();
  const IconComponent = trend.icon;

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-secondary text-xs">
          <Sparkles size={16} className="text-accent-primary" />
          <span className="uppercase tracking-wider font-mono font-medium text-[11px]">
            Performance Trajectory
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${trend.badgeColor}`}
        >
          {trend.badge}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-bg-base border border-border-subtle ${trend.color}`}>
            <IconComponent size={18} />
          </div>
          <span className={`text-lg font-bold font-sans ${trend.color}`}>
            {trend.label}
          </span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed pt-1">
          {trend.summary}
        </p>
      </div>

      <div className="pt-3 border-t border-border-subtle grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2 rounded-lg bg-bg-base border border-border-subtle">
          <div className="text-[10px] text-text-muted">Top Subject</div>
          <div className="font-bold text-text-primary truncate mt-0.5">
            {bestSubject ? `${bestSubject.subject} (${bestSubject.score}%)` : '—'}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-bg-base border border-border-subtle">
          <div className="text-[10px] text-text-muted">Focus Area</div>
          <div className="font-bold text-text-primary truncate mt-0.5">
            {lowestSubject ? `${lowestSubject.subject} (${lowestSubject.score}%)` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
};
