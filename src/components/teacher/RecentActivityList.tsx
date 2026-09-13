import React, { useMemo, useState } from 'react';
import { Student } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import {
  Activity,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'feedback' | 'grade' | 'attendance';
  date: string;
  studentName: string;
  studentId: string;
  studentInitials: string;
  section: string;
  title: string;
  detail: string;
  badgeText: string;
  badgeTone: 'info' | 'success' | 'warning' | 'danger';
}

interface RecentActivityListProps {
  students: Student[];
  onSelectStudent?: (studentId: string) => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  students,
  onSelectStudent,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'feedback' | 'grade' | 'attendance'>('all');

  const activities = useMemo(() => {
    const list: ActivityItem[] = [];

    // Collect recent feedback entries
    for (const s of students) {
      for (const fb of s.feedback) {
        list.push({
          id: `fb-${fb.id}`,
          type: 'feedback',
          date: fb.date,
          studentName: s.name,
          studentId: s.id,
          studentInitials: s.avatarInitials,
          section: s.section,
          title: `Teacher Note logged by ${fb.teacherName}`,
          detail: fb.message,
          badgeText: 'Feedback',
          badgeTone: 'info',
        });
      }

      // Collect recent grade updates
      for (const gr of s.grades) {
        if (gr.updatedAt) {
          list.push({
            id: `gr-${s.id}-${gr.subject}`,
            type: 'grade',
            date: gr.updatedAt,
            studentName: s.name,
            studentId: s.id,
            studentInitials: s.avatarInitials,
            section: s.section,
            title: `${gr.subject} Grade Recorded (${gr.letter} • ${gr.score}%)`,
            detail: gr.remark || `Evaluated score on ${gr.subject} curriculum unit.`,
            badgeText: `${gr.letter} Grade`,
            badgeTone: gr.score >= 80 ? 'success' : gr.score >= 60 ? 'warning' : 'danger',
          });
        }
      }

      // Collect absence alerts
      for (const att of s.attendance) {
        if (att.status === 'absent') {
          list.push({
            id: `att-${s.id}-${att.date}`,
            type: 'attendance',
            date: `${att.date}T08:30:00Z`,
            studentName: s.name,
            studentId: s.id,
            studentInitials: s.avatarInitials,
            section: s.section,
            title: `Unexcused Absence Recorded`,
            detail: `Student was marked absent during morning roll call on ${att.date}.`,
            badgeText: 'Absence',
            badgeTone: 'danger',
          });
        }
      }
    }

    // Sort by timestamp descending
    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [students]);

  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities.slice(0, 10);
    return activities.filter((a) => a.type === filterType).slice(0, 10);
  }, [activities, filterType]);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const getToneBadge = (tone: string) => {
    switch (tone) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'danger':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feedback':
        return <MessageSquare size={14} className="text-sky-400" />;
      case 'grade':
        return <BookOpen size={14} className="text-emerald-400" />;
      case 'attendance':
        return <AlertTriangle size={14} className="text-rose-400" />;
      default:
        return <Clock size={14} className="text-text-muted" />;
    }
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight flex items-center gap-2">
            <Clock size={18} className="text-accent-primary" />
            <span>Recent Academic Activity</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time feed of grade evaluations, attendance entries, and faculty notes.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-bg-base border border-border-subtle text-xs">
          <Filter size={12} className="text-text-muted ml-1.5 mr-0.5" />
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-bg-surface-raised text-text-primary font-medium shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            All ({activities.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('grade')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterType === 'grade'
                ? 'bg-bg-surface-raised text-text-primary font-medium shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Grades
          </button>
          <button
            type="button"
            onClick={() => setFilterType('feedback')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterType === 'feedback'
                ? 'bg-bg-surface-raised text-text-primary font-medium shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Notes
          </button>
          <button
            type="button"
            onClick={() => setFilterType('attendance')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filterType === 'attendance'
                ? 'bg-bg-surface-raised text-text-primary font-medium shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Absences
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-border-subtle">
        {filteredActivities.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Activity}
              title="No activity recorded"
              description="No recent activity items match the selected category filter."
              className="border-none bg-transparent p-6"
            />
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              onClick={() => onSelectStudent?.(act.studentId)}
              className="p-4 hover:bg-bg-surface-raised transition-colors flex items-start justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-start gap-3 min-w-0">
                {/* Monogram Avatar */}
                <div className="w-8 h-8 rounded-full bg-bg-base border border-border-subtle flex items-center justify-center text-xs font-mono font-semibold text-text-primary shrink-0 mt-0.5 group-hover:border-accent-primary/40 transition-colors">
                  {act.studentInitials}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                      {act.studentName}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {act.studentId} • {act.section}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-medium border ${getToneBadge(
                        act.badgeTone,
                      )}`}
                    >
                      {getTypeIcon(act.type)}
                      <span>{act.badgeText}</span>
                    </span>
                  </div>

                  <p className="text-xs font-medium text-text-secondary">
                    {act.title}
                  </p>

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    "{act.detail}"
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="shrink-0 text-right text-[11px] font-mono text-text-muted tabular-nums whitespace-nowrap pt-0.5">
                {formatDate(act.date)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Meta */}
      <div className="p-3 bg-bg-base/40 border-t border-border-subtle px-6 flex items-center justify-between text-xs text-text-muted">
        <span>Showing latest 10 events</span>
        <span className="font-mono">Auto-synced from student entities</span>
      </div>
    </div>
  );
};
