import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus } from '../../../types';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState';

export interface AttendanceLogProps {
  attendance: AttendanceRecord[];
  onSaveAttendance?: (updatedAttendance: AttendanceRecord[]) => void;
  editable?: boolean;
}

export const AttendanceLog: React.FC<AttendanceLogProps> = ({
  attendance,
  onSaveAttendance,
  editable = true,
}) => {
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newDate, setNewDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('present');

  // Metrics summary
  const total = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;
  const excusedCount = attendance.filter((a) => a.status === 'excused').length;

  const handleStatusChange = (index: number, nextStatus: AttendanceStatus) => {
    if (!onSaveAttendance) return;
    const nextRecords = [...attendance];
    nextRecords[index] = {
      ...nextRecords[index],
      status: nextStatus,
    };
    onSaveAttendance(nextRecords);
  };

  const handleDeleteRecord = (index: number) => {
    if (!onSaveAttendance) return;
    const nextRecords = attendance.filter((_, idx) => idx !== index);
    onSaveAttendance(nextRecords);
  };

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveAttendance || !newDate) return;

    const newRecord: AttendanceRecord = {
      date: newDate,
      status: newStatus,
    };

    // Prepend new record so newest appears at top
    onSaveAttendance([newRecord, ...attendance]);
    setIsAddingSession(false);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={12} />
            <span>Present</span>
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock size={12} />
            <span>Late</span>
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle size={12} />
            <span>Absent</span>
          </span>
        );
      case 'excused':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <HelpCircle size={12} />
            <span>Excused</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
      {/* Card Header */}
      <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight flex items-center gap-2">
            <CalendarCheck size={18} className="text-emerald-400" />
            <span>Attendance Log &amp; Session History</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Historical day-by-day attendance records with status modifications.
          </p>
        </div>

        {editable && (
          <button
            type="button"
            onClick={() => setIsAddingSession((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg bg-bg-surface-raised hover:bg-bg-base border border-border-subtle hover:border-border-focus text-xs font-medium text-text-primary flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus size={13} className="text-accent-primary" />
            <span>{isAddingSession ? 'Cancel' : 'Log New Session'}</span>
          </button>
        )}
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border-subtle bg-bg-base/50 text-xs font-mono">
        <div className="p-3 border-r border-b sm:border-b-0 border-border-subtle flex items-center justify-between">
          <span className="text-text-muted flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-400" /> Present:
          </span>
          <span className="font-bold tabular-nums text-text-primary">
            {presentCount} <span className="text-[10px] text-text-muted font-normal">/ {total}</span>
          </span>
        </div>

        <div className="p-3 border-b sm:border-b-0 sm:border-r border-border-subtle flex items-center justify-between">
          <span className="text-text-muted flex items-center gap-1.5">
            <Clock size={13} className="text-amber-400" /> Late:
          </span>
          <span className="font-bold tabular-nums text-text-primary">
            {lateCount}
          </span>
        </div>

        <div className="p-3 border-r border-border-subtle flex items-center justify-between">
          <span className="text-text-muted flex items-center gap-1.5">
            <XCircle size={13} className="text-rose-400" /> Absent:
          </span>
          <span className="font-bold tabular-nums text-text-primary">
            {absentCount}
          </span>
        </div>

        <div className="p-3 flex items-center justify-between" title="Excused days are excluded from the attendance rate denominator per institutional policy §3.6">
          <span className="text-text-muted flex items-center gap-1.5">
            <HelpCircle size={13} className="text-sky-400" /> Excused*:
          </span>
          <span className="font-bold tabular-nums text-sky-400">
            {excusedCount}
          </span>
        </div>
      </div>

      {/* Add New Session Drawer */}
      {editable && isAddingSession && (
        <form
          onSubmit={handleAddSession}
          className="p-4 bg-bg-base/70 border-b border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="flex items-center gap-2 flex-1">
            <Calendar size={14} className="text-accent-primary" />
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-bg-surface border border-border-subtle focus:border-accent-primary rounded-lg px-3 py-1.5 text-xs text-text-primary font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Status:</span>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
              className="bg-bg-surface border border-border-subtle focus:border-accent-primary rounded-lg px-2.5 py-1.5 text-xs text-text-primary font-medium focus:outline-none"
            >
              <option value="present">Present (Full Day)</option>
              <option value="late">Late (Half Credit)</option>
              <option value="absent">Absent (Zero Credit)</option>
              <option value="excused">Excused (Neutral)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-medium transition-colors"
            >
              Add Record
            </button>
            <button
              type="button"
              onClick={() => setIsAddingSession(false)}
              className="px-2.5 py-1.5 rounded-lg bg-bg-surface text-text-secondary text-xs hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Attendance Records List */}
      {attendance.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            description="No historical attendance sessions logged for this student yet."
            className="border-none bg-transparent p-6"
          />
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle">
          {attendance.map((record, index) => (
            <div
              key={`${record.date}-${index}`}
              className="px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bg-surface-raised/40 transition-colors text-xs"
            >
              {/* Date & Day Indicator */}
              <div className="flex items-center gap-3 font-mono">
                <span className="text-text-primary font-medium">
                  {record.date}
                </span>
                <span className="text-text-muted text-[11px]">
                  Session #{attendance.length - index}
                </span>
              </div>

              {/* Status Display & Quick Toggles */}
              <div className="flex items-center gap-3">
                {getStatusBadge(record.status)}

                {editable && (
                  <div className="flex items-center gap-1 ml-2 border-l border-border-subtle pl-3">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(index, 'present')}
                      title="Set to Present"
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-colors ${
                        record.status === 'present'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-bg-base text-text-muted hover:text-emerald-400 hover:bg-bg-surface-raised'
                      }`}
                    >
                      P
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(index, 'late')}
                      title="Set to Late"
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-colors ${
                        record.status === 'late'
                          ? 'bg-amber-500 text-black'
                          : 'bg-bg-base text-text-muted hover:text-amber-400 hover:bg-bg-surface-raised'
                      }`}
                    >
                      L
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(index, 'absent')}
                      title="Set to Absent"
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-colors ${
                        record.status === 'absent'
                          ? 'bg-rose-500 text-white'
                          : 'bg-bg-base text-text-muted hover:text-rose-400 hover:bg-bg-surface-raised'
                      }`}
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(index, 'excused')}
                      title="Set to Excused"
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono text-[10px] font-bold transition-colors ${
                        record.status === 'excused'
                          ? 'bg-sky-500 text-white'
                          : 'bg-bg-base text-text-muted hover:text-sky-400 hover:bg-bg-surface-raised'
                      }`}
                    >
                      E
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(index)}
                      title="Delete this session record"
                      className="p-1 ml-1 text-text-muted hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info Note */}
      <div className="p-3 bg-bg-base/30 border-t border-border-subtle text-[11px] text-text-muted px-6 flex items-center justify-between">
        <span>*Excused absence records are excluded from attendance rate denominator (§3.6).</span>
        <span className="font-mono tabular-nums">{attendance.length} Total Sessions</span>
      </div>
    </div>
  );
};
