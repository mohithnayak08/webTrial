import React from 'react';
import { ParsedSpreadsheetResult } from '../../../lib/excelParser';
import { StatusBadge } from '../../ui/StatusBadge';
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  BookOpen,
  CalendarCheck,
} from 'lucide-react';

export interface ImportSummaryProps {
  parseResult: ParsedSpreadsheetResult;
}

export const ImportSummary: React.FC<ImportSummaryProps> = ({ parseResult }) => {
  const { totalRawRows, mappedStudents, errors } = parseResult;
  const errorCount = errors.length;

  return (
    <div className="space-y-4">
      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-bg-base border border-border-subtle">
          <div className="text-[10px] text-text-muted uppercase">Spreadsheet Rows</div>
          <div className="text-xl font-bold font-sans text-text-primary tabular-nums mt-1">
            {totalRawRows}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-bg-base border border-border-subtle">
          <div className="text-[10px] text-text-muted uppercase">Students Grouped</div>
          <div className="text-xl font-bold font-sans text-accent-primary tabular-nums mt-1">
            {mappedStudents.length}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-bg-base border border-border-subtle">
          <div className="text-[10px] text-text-muted uppercase">Valid Records</div>
          <div className="text-xl font-bold font-sans text-emerald-400 tabular-nums mt-1 flex items-center gap-1.5">
            <CheckCircle2 size={16} />
            <span>{totalRawRows - errorCount}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-bg-base border border-border-subtle">
          <div className="text-[10px] text-text-muted uppercase">Row Warnings / Errors</div>
          <div
            className={`text-xl font-bold font-sans tabular-nums mt-1 flex items-center gap-1.5 ${
              errorCount > 0 ? 'text-amber-400' : 'text-text-muted'
            }`}
          >
            {errorCount > 0 ? (
              <>
                <AlertTriangle size={16} />
                <span>{errorCount}</span>
              </>
            ) : (
              <span>0</span>
            )}
          </div>
        </div>
      </div>

      {/* Validation Errors Table (if any) */}
      {errorCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <AlertTriangle size={15} />
            <span>
              {errorCount} Row Validation Issue{errorCount === 1 ? '' : 's'} Identified (§3.5)
            </span>
          </div>
          <p className="text-xs text-text-secondary">
            The following rows had validation anomalies. Valid rows for other students will still be processed.
          </p>

          <div className="max-h-40 overflow-y-auto rounded-lg border border-border-subtle bg-bg-base divide-y divide-border-subtle font-mono text-xs">
            {errors.map((err, idx) => (
              <div
                key={`err-${idx}`}
                className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.2 rounded bg-bg-surface text-text-muted text-[10px] font-bold">
                    Row {err.rowNumber}
                  </span>
                  {err.studentId && (
                    <span className="text-accent-primary font-medium">
                      [{err.studentId}]
                    </span>
                  )}
                  <span className="text-rose-400 font-semibold">{err.field}:</span>
                  <span className="text-text-secondary">{err.message}</span>
                </div>
                {err.value !== undefined && err.value !== '' && (
                  <span className="text-[11px] text-text-muted px-2 py-0.5 rounded bg-bg-surface self-start sm:self-auto">
                    Value: "{String(err.value)}"
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students Ready for Upsert Preview */}
      <div className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden">
        <div className="p-4 border-b border-border-subtle bg-bg-base/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <FileCheck size={16} className="text-emerald-400" />
            <span>Student Entities Ready for Directory Upsert ({mappedStudents.length})</span>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Auto-calculated metrics
          </span>
        </div>

        <div className="max-h-56 overflow-y-auto divide-y divide-border-subtle">
          {mappedStudents.map((student) => (
            <div
              key={student.id}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bg-surface-raised/40 transition-colors text-xs"
            >
              {/* Identity */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-base border border-border-focus flex items-center justify-center font-mono font-bold text-xs text-text-primary">
                  {student.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{student.name}</span>
                    <span className="font-mono text-[11px] text-accent-primary">
                      {student.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-text-muted font-mono">
                    {student.section} • {student.email}
                  </div>
                </div>
              </div>

              {/* Data payload stats */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1 text-text-secondary" title="Coursework Subjects">
                  <BookOpen size={13} className="text-text-muted" />
                  <span>{student.grades.length} Courses</span>
                </div>

                <div className="flex items-center gap-1 text-text-secondary" title="Attendance Sessions">
                  <CalendarCheck size={13} className="text-emerald-400" />
                  <span>{student.attendance.length} Sessions</span>
                </div>

                <div className="flex items-center gap-1 text-text-primary font-bold">
                  <span>GPA {student.gpa.toFixed(2)}</span>
                </div>

                <StatusBadge status={student.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
