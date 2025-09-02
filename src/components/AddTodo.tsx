'use client';

import { useState, useRef, useEffect } from 'react';
import { useTodoContext } from '@/contexts/TodoContext';

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export default function AddTodo() {
  const { 
    lists, 
    selectedListId, 
    addTodo, 
    setSelectedList, 
    createList 
  } = useTodoContext();

  const [todoText, setTodoText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedList = lists.find(list => list.id === selectedListId);

  // Get the next available color that hasn't been used
  const getNextAvailableColor = () => {
    const usedColors = lists.map(list => list.color);
    const availableColor = COLORS.find(color => !usedColors.includes(color));
    return availableColor || COLORS[0]; // Fallback to first color if all are used
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsCreatingList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (todoText.trim()) {
      addTodo(todoText.trim(), selectedListId);
      setTodoText('');
    }
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName.trim(), selectedColor);
      setNewListName('');
      setIsCreatingList(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div 
      className="rounded-xl shadow-lg p-6 mb-6"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 md:items-center">
        <input
          type="text"
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
          placeholder="What needs to be done? ..."
          className="flex-1 p-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        />
        
        <div className="flex justify-end md:justify-start gap-4 items-center">
          <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: selectedList?.color }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedList?.name}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-10"
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)'
              }}
            >
              <div ref={scrollContainerRef} className="p-2 max-h-48 overflow-y-auto no-scrollbar-arrows">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => {
                      setSelectedList(list.id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-2 text-left rounded-md transition-colors duration-200"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: list.color }}
                    />
                    <span className="text-sm">{list.name}</span>
                  </button>
                ))}
                
                <div className="border-t mt-2 pt-2" style={{ borderColor: 'var(--border-secondary)' }}>
                  {!isCreatingList ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingList(true);
                        setSelectedColor(getNextAvailableColor());
                        setTimeout(() => {
                          scrollContainerRef.current?.scrollTo({
                            top: scrollContainerRef.current.scrollHeight,
                            behavior: 'smooth'
                          });
                        }, 100);
                      }}
                      className="w-full flex items-center gap-2 p-2 text-left rounded-md text-sm transition-colors duration-200"
                      style={{ color: 'var(--interactive-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create new list
                    </button>
                  ) : (
                    <div className="p-2 space-y-3">
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newListName.trim()) {
                            handleCreateList();
                          }
                        }}
                        placeholder="List name"
                        className="w-full p-2 text-sm rounded-md focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className="w-6 h-6 rounded-full transition-all duration-200"
                            style={{ 
                              backgroundColor: color,
                              border: selectedColor === color ? '2px solid var(--color-picker-border)' : 'none'
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCreateList}
                          className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingList(false);
                            setNewListName('');
                          }}
                          className="flex-1 px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>
          
          <button
            type="submit"
            disabled={!todoText.trim()}
            className="px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              backgroundColor: todoText.trim() ? `${selectedList?.color}40` : 'var(--bg-tertiary)',
              color: todoText.trim() ? selectedList?.color : 'var(--text-muted)',
              border: todoText.trim() ? `1px solid ${selectedList?.color}60` : '1px solid var(--border-primary)'
            }}
            onMouseEnter={(e) => {
              if (todoText.trim()) {
                e.currentTarget.style.backgroundColor = `${selectedList?.color}60`;
              }
            }}
            onMouseLeave={(e) => {
              if (todoText.trim()) {
                e.currentTarget.style.backgroundColor = `${selectedList?.color}40`;
              }
            }}
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}