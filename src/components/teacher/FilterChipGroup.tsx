import React from 'react';
import { StudentStatus } from '../../types';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface FilterChipGroupProps {
  selectedGradeBand: string | null;
  onSelectGradeBand: (band: string | null) => void;
  selectedAttendanceStatus: StudentStatus | null;
  onSelectAttendanceStatus: (status: StudentStatus | null) => void;
  statusCounts: { good: number; warning: number; critical: number };
  gradeBandCounts: Record<string, number>;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
  selectedGradeBand,
  onSelectGradeBand,
  selectedAttendanceStatus,
  onSelectAttendanceStatus,
  statusCounts,
  gradeBandCounts,
  onResetFilters,
  hasActiveFilters,
}) => {
  const gradeBands = ['A', 'B', 'C', 'D', 'F'];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Attendance Status Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium mr-1 flex items-center gap-1">
            <SlidersHorizontal size={11} />
            <span>Status:</span>
          </span>

          {/* All Statuses Chip */}
          <button
            type="button"
            onClick={() => onSelectAttendanceStatus(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              selectedAttendanceStatus === null
                ? 'bg-bg-surface-raised text-text-primary border-border-focus font-semibold'
                : 'bg-bg-surface text-text-secondary border-border-subtle hover:text-text-primary hover:border-border-focus'
            }`}
          >
            All Statuses
          </button>

          {/* Good Chip */}
          <button
            type="button"
            onClick={() =>
              onSelectAttendanceStatus(
                selectedAttendanceStatus === 'good' ? null : 'good',
              )
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              selectedAttendanceStatus === 'good'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold ring-1 ring-emerald-500/30'
                : 'bg-emerald-500/5 text-emerald-400/80 border-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40'
            }`}
          >
            <CheckCircle2 size={12} />
            <span>Good (≥90%)</span>
            <span className="text-[10px] font-mono tabular-nums opacity-75">
              ({statusCounts.good})
            </span>
          </button>

          {/* Warning Chip */}
          <button
            type="button"
            onClick={() =>
              onSelectAttendanceStatus(
                selectedAttendanceStatus === 'warning' ? null : 'warning',
              )
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              selectedAttendanceStatus === 'warning'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold ring-1 ring-amber-500/30'
                : 'bg-amber-500/5 text-amber-400/80 border-amber-500/20 hover:text-amber-300 hover:border-amber-500/40'
            }`}
          >
            <AlertTriangle size={12} />
            <span>Warning</span>
            <span className="text-[10px] font-mono tabular-nums opacity-75">
              ({statusCounts.warning})
            </span>
          </button>

          {/* Critical Chip */}
          <button
            type="button"
            onClick={() =>
              onSelectAttendanceStatus(
                selectedAttendanceStatus === 'critical' ? null : 'critical',
              )
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              selectedAttendanceStatus === 'critical'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold ring-1 ring-rose-500/30'
                : 'bg-rose-500/5 text-rose-400/80 border-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
            }`}
          >
            <AlertOctagon size={12} />
            <span>Critical (&lt;75%)</span>
            <span className="text-[10px] font-mono tabular-nums opacity-75">
              ({statusCounts.critical})
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border-subtle hidden md:block" />

        {/* Grade Band Filter Chips */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-text-muted font-medium mr-1">
            Grade:
          </span>

          <button
            type="button"
            onClick={() => onSelectGradeBand(null)}
            className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
              selectedGradeBand === null
                ? 'bg-bg-surface-raised text-text-primary border-border-focus font-semibold'
                : 'bg-bg-surface text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            All
          </button>

          {gradeBands.map((band) => {
            const isSelected = selectedGradeBand === band;
            const count = gradeBandCounts[band] || 0;

            return (
              <button
                key={band}
                type="button"
                onClick={() =>
                  onSelectGradeBand(isSelected ? null : band)
                }
                className={`px-2 py-0.5 rounded text-xs font-mono font-medium border transition-colors ${
                  isSelected
                    ? 'bg-accent-primary/20 text-accent-primary border-accent-primary font-bold ring-1 ring-accent-primary/30'
                    : 'bg-bg-surface text-text-secondary border-border-subtle hover:text-text-primary hover:border-border-focus'
                }`}
              >
                <span>{band}</span>
                <span className="text-[10px] text-text-muted ml-1">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters CTA if active */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors py-1 px-2 rounded hover:bg-bg-surface self-start md:self-auto"
        >
          <RotateCcw size={12} />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};
