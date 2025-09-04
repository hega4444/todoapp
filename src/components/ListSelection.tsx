'use client';

import { useState, useRef, useEffect } from 'react';
import { TodoList } from '@/types';

interface ListSelectionProps {
  listFilter: string;
  lists: TodoList[];
  onListFilterChange: (listId: string) => void;
}

export default function ListSelection({
  listFilter,
  lists,
  onListFilterChange,
}: ListSelectionProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedList = lists.find((list) => list.id === listFilter);

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleFilterChange = (listId: string) => {
    onListFilterChange(listId);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleDropdownToggle}
        className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 w-full sm:min-w-[120px] transition-colors duration-200"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')
        }
      >
        {listFilter === 'all' ? (
          <>
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ef4444)',
                mask: 'radial-gradient(circle, transparent 25%, black 40%)',
                WebkitMask:
                  'radial-gradient(circle, transparent 25%, black 40%)',
              }}
            ></div>
            <span className="font-medium">All tasks</span>
          </>
        ) : (
          selectedList && (
            <>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedList.color }}
              />
              <span className="font-medium">{selectedList.name}</span>
            </>
          )
        )}
        <svg
          className={`w-4 h-4 transition-transform ml-auto ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="p-2 max-h-48 overflow-y-auto no-scrollbar-arrows">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className="w-full flex items-center gap-3 p-2 text-left rounded-md transition-colors duration-200"
              style={{
                backgroundColor:
                  listFilter === 'all'
                    ? 'var(--bg-secondary)'
                    : 'transparent',
                color:
                  listFilter === 'all'
                    ? 'var(--interactive-primary)'
                    : 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                if (listFilter !== 'all') {
                  e.currentTarget.style.backgroundColor =
                    'var(--bg-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (listFilter !== 'all') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ef4444)',
                  mask: 'radial-gradient(circle, transparent 25%, black 40%)',
                  WebkitMask:
                    'radial-gradient(circle, transparent 25%, black 40%)',
                }}
              ></div>
              <span className="text-sm font-medium">All tasks</span>
            </button>

            {lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => handleFilterChange(list.id)}
                className="w-full flex items-center gap-3 p-2 text-left rounded-md transition-colors duration-200"
                style={{
                  backgroundColor:
                    listFilter === list.id
                      ? 'var(--bg-secondary)'
                      : 'transparent',
                  color:
                    listFilter === list.id
                      ? 'var(--interactive-primary)'
                      : 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (listFilter !== list.id) {
                    e.currentTarget.style.backgroundColor =
                      'var(--bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (listFilter !== list.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: list.color }}
                />
                <span className="text-sm">{list.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}