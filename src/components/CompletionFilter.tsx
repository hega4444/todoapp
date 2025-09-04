'use client';

import { FilterType } from '@/types';

interface CompletionFilterProps {
  completionFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function CompletionFilter({
  completionFilter,
  onFilterChange,
}: CompletionFilterProps) {
  return (
    <div
      className="flex rounded-lg flex-1 sm:flex-none"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
      }}
    >
      {(['all', 'pending', 'completed'] as FilterType[]).map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className="px-2 sm:px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 capitalize flex-1"
          style={{
            backgroundColor:
              completionFilter === filter
                ? 'var(--bg-primary)'
                : 'transparent',
            color:
              completionFilter === filter
                ? 'var(--text-primary)'
                : 'var(--text-secondary)',
            boxShadow:
              completionFilter === filter
                ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                : 'none',
          }}
          onMouseEnter={(e) => {
            if (completionFilter !== filter) {
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (completionFilter !== filter) {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}