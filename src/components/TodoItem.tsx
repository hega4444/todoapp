'use client';

import { useState } from 'react';
import { Todo, TodoList } from '@/types';

interface TodoItemProps {
  todo: Todo;
  list: TodoList;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({
  todo,
  list,
  onToggle,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditSubmit = () => {
    if (editText.trim() && editText.trim() !== todo.text) {
      onEdit(todo.id, editText.trim());
    }
    setIsEditing(false);
    setEditText(todo.text);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditText(todo.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <div
      className="group rounded-lg shadow-sm p-4 mb-3 flex items-center gap-4 hover:shadow-md transition-shadow relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-primary)',
        borderRight: `4px solid ${list.color}`,
        minHeight: '64px', // Fixed height to prevent movement
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 relative"
      >
        <div
          className="w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center"
          style={{
            borderColor: todo.completed
              ? 'var(--status-success)'
              : 'var(--border-secondary)',
            backgroundColor: todo.completed
              ? 'var(--status-success)'
              : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!todo.completed) {
              e.currentTarget.style.borderColor =
                'var(--interactive-secondary)';
            }
          }}
          onMouseLeave={(e) => {
            if (!todo.completed) {
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
            }
          }}
        >
          {todo.completed && (
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
            className="w-full p-1 bg-transparent border-b-2 focus:outline-none"
            style={{
              color: 'var(--text-primary)',
              borderColor: 'var(--interactive-primary)',
            }}
            autoFocus
          />
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            className="block cursor-pointer select-none transition-colors duration-200"
            style={{
              color: todo.completed
                ? 'var(--text-muted)'
                : 'var(--text-primary)',
              textDecoration: todo.completed ? 'line-through' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!todo.completed) {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!todo.completed) {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
          >
            {todo.text}
          </span>
        )}
      </div>

      {/* Delete button (appears on hover) - positioned absolutely to not affect layout */}
      <button
        onClick={() => onDelete(todo.id)}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
          isHovered && !isEditing
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'
        }`}
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          e.currentTarget.style.color = 'var(--status-error)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
        title="Delete task"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
