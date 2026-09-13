import React from 'react';
import { Student } from '../../types';
import { Avatar } from '../ui/Avatar';
import { StatusBadge } from '../ui/StatusBadge';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export interface RosterRowProps {
  student: Student;
  onView?: (studentId: string) => void;
  onEdit?: (studentId: string) => void;
  onDelete?: (studentId: string) => void;
}

export const RosterRow: React.FC<RosterRowProps> = ({
  student,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <tr className="hover:bg-bg-surface-raised/70 transition-colors group">
      {/* Student Identity */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <Avatar initials={student.avatarInitials} size="md" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-text-primary group-hover:text-accent-primary transition-colors truncate">
              {student.name}
            </div>
            <div className="text-[11px] text-text-muted truncate">
              {student.email}
            </div>
          </div>
        </div>
      </td>

      {/* Student ID */}
      <td className="py-3.5 px-4 font-mono text-xs text-accent-primary font-medium">
        {student.id}
      </td>

      {/* Class Section */}
      <td className="py-3.5 px-4 text-xs text-text-secondary">
        <span className="px-2 py-0.5 rounded bg-bg-base border border-border-subtle font-mono text-[11px]">
          {student.section}
        </span>
      </td>

      {/* GPA (4.0 Scale) */}
      <td className="py-3.5 px-4 text-right">
        <span className="font-mono text-xs font-semibold tabular-nums text-text-primary">
          {student.gpa.toFixed(2)}
        </span>
        <span className="text-[10px] text-text-muted font-mono ml-1">/ 4.00</span>
      </td>

      {/* Attendance % */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Mini progress track */}
          <div className="w-12 h-1.5 rounded-full bg-bg-base border border-border-subtle overflow-hidden hidden sm:block">
            <div
              className={`h-full rounded-full ${
                student.attendancePct >= 90
                  ? 'bg-status-success'
                  : student.attendancePct >= 75
                    ? 'bg-status-warning'
                    : 'bg-status-danger'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, student.attendancePct))}%` }}
            />
          </div>
          <span className="font-mono text-xs font-semibold tabular-nums text-text-primary">
            {student.attendancePct.toFixed(1)}%
          </span>
        </div>
      </td>

      {/* Academic Status Badge */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <StatusBadge status={student.status} />
      </td>

      {/* Row Actions Affordance */}
      <td className="py-3.5 px-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onView?.(student.id)}
            title={`View ${student.name}'s profile`}
            aria-label={`View ${student.name}'s profile`}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-base border border-transparent hover:border-border-subtle transition-colors"
          >
            <Eye size={14} />
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(student.id)}
            title={`Edit ${student.name}`}
            aria-label={`Edit ${student.name}`}
            className="p-1.5 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-bg-base border border-transparent hover:border-border-subtle transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(student.id)}
            title={`Delete ${student.name}`}
            aria-label={`Delete ${student.name}`}
            className="p-1.5 rounded-lg text-text-secondary hover:text-rose-400 hover:bg-bg-base border border-transparent hover:border-border-subtle transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};
