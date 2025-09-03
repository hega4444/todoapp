'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FilterType, Todo, type TodoList } from '@/types';
import TodoItem from './TodoItem';

interface FilteredTodosData {
  todos: Todo[];
  pendingCount: number;
  completedCount: number;
  totalCount: number;
}

interface TodoListProps {
  todos: Todo[];
  lists: TodoList[];
  completionFilter: FilterType;
  listFilter: string;
  onToggleTodo: (id: string) => Promise<void>;
  onEditTodo: (id: string, text: string) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  onDeleteList: (listId: string) => Promise<void>;
  onSetCompletionFilter: (filter: FilterType) => void;
  onSetListFilter: (filter: string) => void;
}

export default function TodoList({
  todos,
  lists,
  completionFilter,
  listFilter,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onDeleteList,
  onSetCompletionFilter,
  onSetListFilter
}: TodoListProps) {
  
  const [isListDropdownOpen, setIsListDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const listDropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Memoized filtered todos data with efficient filtering
   */
  const filteredData = useMemo((): FilteredTodosData => {
    const filteredTodos = todos.filter(todo => {
      const matchesCompletion = 
        completionFilter === 'all' || 
        (completionFilter === 'completed' && todo.completed) ||
        (completionFilter === 'pending' && !todo.completed);
      
      const matchesList = listFilter === 'all' || todo.listId === listFilter;
      
      return matchesCompletion && matchesList;
    });

    return {
      todos: filteredTodos,
      pendingCount: filteredTodos.filter(todo => !todo.completed).length,
      completedCount: filteredTodos.filter(todo => todo.completed).length,
      totalCount: filteredTodos.length
    };
  }, [todos, completionFilter, listFilter]);

  const { todos: filteredTodos, pendingCount, completedCount, totalCount } = filteredData;
  
  const selectedList = useMemo(
    () => lists.find(list => list.id === listFilter),
    [lists, listFilter]
  );

  const listTodosCount = useMemo(
    () => todos.filter(todo => todo.listId === listFilter).length,
    [todos, listFilter]
  );

  // Memoized event handlers
  const handleDeleteList = useCallback(() => {
    if (selectedList) {
      onDeleteList(selectedList.id);
      onSetListFilter('all');
      setShowDeleteConfirm(false);
    }
  }, [selectedList, onDeleteList, onSetListFilter]);

  const handleDropdownToggle = useCallback(() => {
    setIsListDropdownOpen(prev => !prev);
  }, []);

  const handleFilterChange = useCallback((filter: FilterType) => {
    onSetCompletionFilter(filter);
  }, [onSetCompletionFilter]);

  const handleListFilterChange = useCallback((listId: string) => {
    onSetListFilter(listId);
    setIsListDropdownOpen(false);
  }, [onSetListFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listDropdownRef.current && !listDropdownRef.current.contains(event.target as Node)) {
        setIsListDropdownOpen(false);
      }
    };

    if (isListDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isListDropdownOpen]);

  return (
    <div 
      className="rounded-xl shadow-lg p-6 relative"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Header with stats and filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Tasks</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-blue-600 font-medium">{pendingCount} pending</span>
            <span className="text-green-600 font-medium">{completedCount} completed</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Completion filter */}
          <div className="flex rounded-lg flex-1 sm:flex-none" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
            {(['all', 'pending', 'completed'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className="px-2 sm:px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 capitalize flex-1"
                style={{
                  backgroundColor: completionFilter === filter ? 'var(--bg-primary)' : 'transparent',
                  color: completionFilter === filter ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: completionFilter === filter ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
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

          {/* List filter */}
          <div className="relative flex-1 sm:flex-none" ref={listDropdownRef}>
            <button
              type="button"
              onClick={handleDropdownToggle}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 w-full sm:min-w-[120px] transition-colors duration-200"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            >
              {listFilter === 'all' ? (
                <>
                  <div className="w-3 h-3 rounded-full" style={{background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ef4444)', mask: 'radial-gradient(circle, transparent 25%, black 40%)', WebkitMask: 'radial-gradient(circle, transparent 25%, black 40%)'}}></div>
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
                className={`w-4 h-4 transition-transform ml-auto ${isListDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isListDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-10"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="p-2 max-h-48 overflow-y-auto no-scrollbar-arrows">
                  <button
                    type="button"
                    onClick={() => handleListFilterChange('all')}
                    className="w-full flex items-center gap-3 p-2 text-left rounded-md transition-colors duration-200"
                    style={{
                      backgroundColor: listFilter === 'all' ? 'var(--bg-secondary)' : 'transparent',
                      color: listFilter === 'all' ? 'var(--interactive-primary)' : 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      if (listFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (listFilter !== 'all') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ef4444)', mask: 'radial-gradient(circle, transparent 25%, black 40%)', WebkitMask: 'radial-gradient(circle, transparent 25%, black 40%)'}}></div>
                    <span className="text-sm font-medium">All tasks</span>
                  </button>
                  
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => handleListFilterChange(list.id)}
                      className="w-full flex items-center gap-3 p-2 text-left rounded-md transition-colors duration-200"
                      style={{
                        backgroundColor: listFilter === list.id ? 'var(--bg-secondary)' : 'transparent',
                        color: listFilter === list.id ? 'var(--interactive-primary)' : 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => {
                        if (listFilter !== list.id) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
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
        </div>
      </div>

      {/* Todo items */}
      <div className="space-y-2 md:max-h-96 md:overflow-y-auto md:pr-2 md:scroll-smooth scrollbar-no-arrows">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No tasks found</h3>
            <p className="text-gray-500">
              {completionFilter === 'all' && listFilter === 'all'
                ? "Get started by adding your first task above!"
                : "Try adjusting your filters to see more tasks."
              }
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const list = lists.find(l => l.id === todo.listId);
            return list ? (
              <TodoItem
                key={todo.id}
                todo={todo}
                list={list}
                onToggle={onToggleTodo}
                onEdit={onEditTodo}
                onDelete={onDeleteTodo}
              />
            ) : null;
          })
        )}
      </div>

      {/* Footer summary */}
      {totalCount > 0 && (
        <div 
          className="mt-6 pt-4 border-t text-sm text-center"
          style={{ 
            borderColor: 'var(--border-secondary)', 
            color: 'var(--text-secondary)' 
          }}
        >
          Showing {totalCount} of {todos.length} tasks
        </div>
      )}

      {/* Delete List Button - only show when a specific list is selected */}
      {listFilter !== 'all' && selectedList && (
        <div className="mt-4 flex justify-center sm:justify-end max-[600px]:justify-center">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={`Delete "${selectedList.name}" list and all its tasks`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
            Delete List
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedList && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div 
            className="rounded-xl p-6 max-w-md mx-4 shadow-2xl"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedList.color }}
              />
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Delete "{selectedList.name}" List?
              </h3>
            </div>
            
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              This will permanently delete the list and all <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{listTodosCount} task{listTodosCount !== 1 ? 's' : ''}</span> in it. 
              This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteList}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}