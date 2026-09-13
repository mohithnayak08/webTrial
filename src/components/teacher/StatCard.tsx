import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    icon?: LucideIcon;
  };
  footnote?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  badge,
  footnote,
  onClick,
}) => {
  const getBadgeClasses = (tone: string) => {
    switch (tone) {
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

  const BadgeIcon = badge?.icon;

  return (
    <div
      onClick={onClick}
      className={`
        bg-bg-surface border border-border-subtle rounded-xl p-6 flex flex-col justify-between
        transition-colors duration-150
        ${onClick ? 'cursor-pointer hover:border-border-focus hover:bg-bg-surface/90' : ''}
      `}
    >
      {/* Top Header: Label & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-bg-surface-raised border border-border-subtle flex items-center justify-center text-text-secondary">
          <Icon size={16} className="text-accent-primary" />
        </div>
      </div>

      {/* Main Metric Value: 700 weight, tabular numerals (§1.3) */}
      <div className="mt-4 mb-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-text-primary tabular-nums font-sans">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-mono text-text-muted tabular-nums">
            {subValue}
          </span>
        )}
      </div>

      {/* Bottom Metadata: Badge + Footnote */}
      <div className="mt-2 pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs">
        {badge ? (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${getBadgeClasses(
              badge.tone,
            )}`}
          >
            {BadgeIcon && <BadgeIcon size={12} />}
            <span>{badge.text}</span>
          </span>
        ) : (
          <span />
        )}

        {footnote && (
          <span className="text-[11px] text-text-muted truncate max-w-[180px]" title={footnote}>
            {footnote}
          </span>
        )}
      </div>
    </div>
  );
};
