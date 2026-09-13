import React from 'react';
import { Student } from '../../types';
import { RosterRow } from './RosterRow';
import { EmptyState } from '../ui/EmptyState';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SearchX,
  RotateCcw,
} from 'lucide-react';

export type SortColumn = 'name' | 'id' | 'section' | 'gpa' | 'attendancePct' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface RosterTableProps {
  students: Student[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSortChange: (column: SortColumn) => void;
  onView?: (studentId: string) => void;
  onEdit?: (studentId: string) => void;
  onDelete?: (studentId: string) => void;
  onResetFilters?: () => void;
  totalUnfilteredCount: number;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  students,
  sortColumn,
  sortDirection,
  onSortChange,
  onView,
  onEdit,
  onDelete,
  onResetFilters,
  totalUnfilteredCount,
}) => {
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown size={12} className="text-text-muted opacity-60 ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-accent-primary ml-1" />
    ) : (
      <ArrowDown size={12} className="text-accent-primary ml-1" />
    );
  };

  // Empty state complying with §1.5
  if (students.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No matching students found"
        description="Zero records match your current search query or filter criteria. Try adjusting your filters or resetting them."
        action={
          onResetFilters
            ? {
                label: 'Reset Search & Filters',
                onClick: onResetFilters,
                icon: RotateCcw,
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-surface text-text-secondary text-[11px] uppercase tracking-wider select-none">
              {/* Student Identity Column */}
              <th
                onClick={() => onSortChange('name')}
                className="py-3.5 px-4 font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center">
                  <span>Student</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* ID Column */}
              <th
                onClick={() => onSortChange('id')}
                className="py-3.5 px-4 font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center">
                  <span>Student ID</span>
                  {renderSortIcon('id')}
                </div>
              </th>

              {/* Section Column */}
              <th
                onClick={() => onSortChange('section')}
                className="py-3.5 px-4 font-medium cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center">
                  <span>Section</span>
                  {renderSortIcon('section')}
                </div>
              </th>

              {/* GPA Column (Aligned Right) */}
              <th
                onClick={() => onSortChange('gpa')}
                className="py-3.5 px-4 font-medium cursor-pointer hover:text-text-primary transition-colors text-right"
              >
                <div className="flex items-center justify-end">
                  <span>GPA (4.0)</span>
                  {renderSortIcon('gpa')}
                </div>
              </th>

              {/* Attendance Column (Aligned Right) */}
              <th
                onClick={() => onSortChange('attendancePct')}
                className="py-3.5 px-4 font-medium cursor-pointer hover:text-text-primary transition-colors text-right"
              >
                <div className="flex items-center justify-end">
                  <span>Attendance</span>
                  {renderSortIcon('attendancePct')}
                </div>
              </th>

              {/* Status Column (Aligned Right) */}
              <th
                onClick={() => onSortChange('status')}
                className="py-3.5 px-4 font-medium cursor-pointer hover:text-text-primary transition-colors text-right"
              >
                <div className="flex items-center justify-end">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              {/* Actions Header */}
              <th className="py-3.5 px-4 font-medium text-right text-text-muted">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border-subtle bg-bg-surface">
            {students.map((student) => (
              <RosterRow
                key={student.id}
                student={student}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3.5 bg-bg-base/50 border-t border-border-subtle px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-text-primary tabular-nums font-mono">{students.length}</strong> of{' '}
            <strong className="text-text-primary tabular-nums font-mono">{totalUnfilteredCount}</strong> students
          </span>
          <span>•</span>
          <span className="font-mono text-[11px]">
            Sorted by {sortColumn} ({sortDirection.toUpperCase()})
          </span>
        </div>
        <div className="font-mono text-[11px] text-text-muted">
          Click any column header to toggle sort order
        </div>
      </div>
    </div>
  );
};
