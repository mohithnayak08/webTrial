import React from 'react';

export interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-semibold',
  }[size];

  return (
    <div
      className={`rounded-full bg-bg-surface-raised border border-border-subtle flex items-center justify-center font-mono font-medium text-text-primary shrink-0 ${sizeClasses} ${className}`}
      aria-hidden="true"
    >
      {initials || '??'}
    </div>
  );
};
