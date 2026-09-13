import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by student name or ID (e.g. STU-1001)...',
  className = '',
}) => {
  // Local state for instant input responsiveness, debouncing downstream update (~150ms per §2.2)
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 150); // ~150ms debounce specified in §2.2

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={14}
        className="absolute left-3 text-text-muted pointer-events-none"
      />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-surface border border-border-subtle hover:border-border-focus focus:border-accent-primary rounded-lg pl-9 pr-8 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          title="Clear search"
          aria-label="Clear search"
          className="absolute right-2.5 p-1 rounded hover:bg-bg-surface-raised text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};
