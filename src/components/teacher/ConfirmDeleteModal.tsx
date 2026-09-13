import React from 'react';
import { Student } from '../../types';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { StatusBadge } from '../ui/StatusBadge';
import { Trash2, AlertTriangle } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  student: Student | null;
  onConfirm: (studentId: string) => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  student,
  onConfirm,
  onCancel,
}) => {
  if (!student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Delete Student Record"
      description="Permanent removal from institutional database."
      size="md"
    >
      <div className="space-y-5 text-xs">
        {/* Warning Alert Banner (§1.2 & §2.2) */}
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={15} />
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-rose-400">
              Irreversible Action Confirmation
            </div>
            <p className="text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete this student? All course grades, attendance records, and faculty feedback notes will be wiped.
            </p>
          </div>
        </div>

        {/* Student Record Card Preview */}
        <div className="p-4 rounded-xl bg-bg-base border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar initials={student.avatarInitials} size="md" />
              <div>
                <h4 className="font-semibold text-text-primary text-sm">
                  {student.name}
                </h4>
                <p className="text-[11px] text-text-muted font-mono">
                  {student.id} • {student.section}
                </p>
              </div>
            </div>
            <StatusBadge status={student.status} />
          </div>

          <div className="pt-2 border-t border-border-subtle grid grid-cols-2 gap-2 text-text-secondary font-mono text-[11px]">
            <div>
              <span className="text-text-muted">GPA:</span>{' '}
              <strong className="text-text-primary tabular-nums">
                {student.gpa.toFixed(2)} / 4.00
              </strong>
            </div>
            <div>
              <span className="text-text-muted">Attendance:</span>{' '}
              <strong className="text-text-primary tabular-nums">
                {student.attendancePct.toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Action Buttons (§1.5: solid danger for destructive action, ghost for cancel) */}
        <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-bg-surface hover:bg-bg-surface-raised border border-border-subtle hover:border-border-focus text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(student.id)}
            className="px-4 py-2 rounded-lg bg-status-danger hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Trash2 size={14} />
            <span>Delete Student Record</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
