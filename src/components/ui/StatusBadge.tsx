import React from 'react';
import { StudentStatus } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export interface StatusBadgeProps {
  status: StudentStatus;
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  className = '',
}) => {
  switch (status) {
    case 'good':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${className}`}
        >
          {showIcon && <CheckCircle2 size={12} className="shrink-0" />}
          <span>Good</span>
        </span>
      );
    case 'warning':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 ${className}`}
        >
          {showIcon && <AlertTriangle size={12} className="shrink-0" />}
          <span>Warning</span>
        </span>
      );
    case 'critical':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 ${className}`}
        >
          {showIcon && <AlertOctagon size={12} className="shrink-0" />}
          <span>Critical</span>
        </span>
      );
    default:
      return null;
  }
};
