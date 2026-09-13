import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import {
  CalendarCheck,
  Info,
} from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

export interface AttendanceHeatmapProps {
  attendance: AttendanceRecord[];
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ attendance }) => {
  const [hoveredSession, setHoveredSession] = useState<AttendanceRecord | null>(null);

  // Chronological order: oldest to newest for calendar timeline
  const sortedSessions = [...attendance].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500/20 border-emerald-500/40 hover:border-emerald-400 text-emerald-400';
      case 'late':
        return 'bg-amber-500/20 border-amber-500/40 hover:border-amber-400 text-amber-400';
      case 'absent':
        return 'bg-rose-500/20 border-rose-500/40 hover:border-rose-400 text-rose-400';
      case 'excused':
        return 'bg-sky-500/20 border-sky-500/40 hover:border-sky-400 text-sky-400';
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'Present (Full Day)';
      case 'late':
        return 'Late (Half Credit)';
      case 'absent':
        return 'Absent (Zero Credit)';
      case 'excused':
        return 'Excused (Neutral)';
    }
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight flex items-center gap-2">
            <CalendarCheck size={18} className="text-emerald-400" />
            <span>Attendance Calendar Heatmap</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Visual session density and compliance history across enrolled academic dates.
          </p>
        </div>

        {/* Dynamic Tooltip / Inspect Banner */}
        <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-bg-base border border-border-subtle flex items-center gap-2 self-start sm:self-auto min-h-[34px]">
          {hoveredSession ? (
            <>
              <span className="text-text-primary font-bold">{hoveredSession.date}:</span>
              <span className="capitalize text-accent-primary">
                {getStatusLabel(hoveredSession.status)}
              </span>
            </>
          ) : (
            <span className="text-text-muted flex items-center gap-1.5">
              <Info size={13} />
              <span>Hover over a session block to inspect</span>
            </span>
          )}
        </div>
      </div>

      {/* Grid of Calendar Heatmap Blocks */}
      {sortedSessions.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={CalendarCheck}
            title="No attendance sessions"
            description="No attendance records registered for this student account yet."
            className="border-none bg-transparent p-6"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider flex items-center justify-between">
            <span>Logged Timeline ({sortedSessions.length} sessions)</span>
            <span>Chronological (Oldest → Newest)</span>
          </div>

          <div className="flex flex-wrap gap-2.5 p-4 rounded-xl bg-bg-base/60 border border-border-subtle">
            {sortedSessions.map((session, index) => {
              const colorClass = getStatusColor(session.status);
              const isHovered = hoveredSession?.date === session.date;

              return (
                <button
                  key={`${session.date}-${index}`}
                  type="button"
                  onMouseEnter={() => setHoveredSession(session)}
                  onMouseLeave={() => setHoveredSession(null)}
                  onClick={() => setHoveredSession(session)}
                  className={`w-9 h-9 rounded-lg border flex flex-col items-center justify-center transition-all duration-150 font-mono text-[10px] select-none ${colorClass} ${
                    isHovered ? 'ring-2 ring-accent-primary scale-105' : ''
                  }`}
                  title={`${session.date}: ${session.status}`}
                >
                  <span className="font-bold">
                    {session.date.split('-')[2]}
                  </span>
                  <span className="text-[8px] opacity-70 uppercase">
                    {session.status[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Heatmap Legend Bar */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono border-t border-border-subtle">
        <div className="flex flex-wrap items-center gap-4 text-text-secondary text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block" />
            <span>Present</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40 inline-block" />
            <span>Late</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40 inline-block" />
            <span>Absent</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-500/20 border border-sky-500/40 inline-block" />
            <span>Excused*</span>
          </span>
        </div>

        <div className="text-[11px] text-text-muted">
          *Excused absences do not count against attendance percentage
        </div>
      </div>
    </div>
  );
};
