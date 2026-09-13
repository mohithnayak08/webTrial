import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'accent';
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`p-12 text-center bg-bg-surface border border-border-subtle rounded-xl space-y-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted mx-auto shadow-xs">
        <Icon size={22} className="text-text-muted" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-text-primary tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {action.icon && <action.icon size={13} />}
              <span>{action.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-3.5 py-1.5 rounded-lg bg-bg-surface-raised hover:bg-bg-base border border-border-subtle hover:border-border-focus text-text-secondary hover:text-text-primary text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              {secondaryAction.icon && <secondaryAction.icon size={13} />}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
