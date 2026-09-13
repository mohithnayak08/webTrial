import React from 'react';
import { LucideIcon } from 'lucide-react';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  icon: Icon,
  children,
  className = '',
}) => {
  const getToneClasses = (t: BadgeTone) => {
    switch (t) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'danger':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'info':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-bg-surface-raised text-text-secondary border-border-subtle';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getToneClasses(
        tone,
      )} ${className}`}
    >
      {Icon && <Icon size={12} className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
