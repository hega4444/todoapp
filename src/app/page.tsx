'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AddTodo from '@/components/AddTodo';
import TodoListComponent from '@/components/TodoList';
import ThemeToggle from '@/components/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConnectionBadge } from '@/components/ConnectionBadge';
import { Todo, TodoList, FilterType, ConnectionStatus } from '@/types';
import { apiService } from '@/lib/api';
import {
  STORAGE_KEYS,
  ERROR_MESSAGES,
  DEFAULT_LISTS,
  CONNECTION_BADGE_TIMER,
} from '@/lib/constants';

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lists, setLists] = useState<TodoList[]>([...DEFAULT_LISTS]);
  const [selectedListId, setSelectedListId] = useState<string>(
    DEFAULT_LISTS[0].id
  );

  const [completionFilter, setCompletionFilter] = useState<FilterType>('all');
  const [listFilter, setListFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('online');

  // Connection status management
  const setOnline = useCallback(() => {
    setConnectionStatus('online');
  }, []);

  const setConnectionError = useCallback(() => {
    setConnectionStatus('error');
  }, []);

  const setOffline = useCallback(() => {
    setConnectionStatus('offline');
  }, []);

  // Reset connection health after 5 seconds
  useEffect(() => {
    if (connectionStatus === 'error') {
      const timer = setTimeout(() => {
        setConnectionStatus('online');
      }, CONNECTION_BADGE_TIMER);

      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  // Set up connection callback for API service
  useEffect(() => {
    apiService.setConnectionCallback({
      setOnline,
      setError: setConnectionError,
      setOffline,
    });
  }, [setOnline, setConnectionError, setOffline]);


  const loadData = useCallback(
    async (showLoader: boolean = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }
        const data = await apiService.getTodosAndLists();
        setTodos(data.todos);
        setLists(data.lists);
        
        setSelectedListId(currentId => {
          if (data.lists.length > 0 && !data.lists.find(l => l.id === currentId)) {
            return data.lists[0].id;
          }
          return currentId;
        });
      } catch (error) {
        console.error(ERROR_MESSAGES.ERROR_LOADING_DATA, error);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    []
  );

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedTodos = localStorage.getItem(STORAGE_KEYS.TODOS_CACHE);
      const savedLists = localStorage.getItem(STORAGE_KEYS.LISTS_CACHE);

      if (savedTodos && savedLists) {
        const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        }));

        const parsedLists = JSON.parse(savedLists).map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
        }));

        setTodos(parsedTodos);
        setLists(parsedLists);
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.ERROR_LOADING_CACHE, error);
    }
  }, []);

  // Load data on mount with optimized loading states
  useEffect(() => {
    const initializeApp = async () => {
      // Try to load cached data first (instant)
      loadFromLocalStorage();

      // If we have cached data, hide spinner immediately and load fresh data silently
      const savedTodos = localStorage.getItem(STORAGE_KEYS.TODOS_CACHE);
      const savedLists = localStorage.getItem(STORAGE_KEYS.LISTS_CACHE);

      if (savedTodos && savedLists) {
        // We have cached data, so hide spinner and load fresh data silently
        setLoading(false);
        await loadData(false); // Don't show loader since we have cached data
      } else {
        // No cached data, show spinner while loading
        await loadData(true);
      }
    };

    initializeApp();
  }, [loadData, loadFromLocalStorage]);

  // Cache to localStorage for fast refreshes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TODOS_CACHE, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTS_CACHE, JSON.stringify(lists));
  }, [lists]);

  // Todo actions
  const addTodo = useCallback(
    async (text: string, listId: string) => {
      try {
        const newTodo = await apiService.createTodo(text, listId);
        setTodos((prev) => [...prev, newTodo]);

        // Update filters to show last added todo
        if (listFilter !== 'all' && listFilter !== listId) {
          setListFilter('all');
        }
      } catch (error) {
        console.error(ERROR_MESSAGES.ERROR_ADDING_TODO, error);
      }
    },
    [listFilter]
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      // Optimistically update UI
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, completed: !t.completed, updatedAt: new Date() }
            : t
        )
      );

      try {
        await apiService.updateTodo(id, { completed: !todo.completed });
      } catch (error) {
        console.error(ERROR_MESSAGES.ERROR_TOGGLING_TODO, error);
        // Rollback optimistic update
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, completed: todo.completed } : t
          )
        );
      }
    },
    [todos]
  );

  const editTodo = useCallback(
    async (id: string, text: string) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      // Optimistically update UI
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, text, updatedAt: new Date() } : t
        )
      );

      try {
        await apiService.updateTodo(id, { text });
      } catch (error) {
        console.error(ERROR_MESSAGES.ERROR_EDITING_TODO, error);
        // Rollback optimistic update
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, text: todo.text } : t))
        );
      }
    },
    [todos]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      // Optimistically update UI
      setTodos((prev) => prev.filter((t) => t.id !== id));

      try {
        await apiService.deleteTodo(id);
      } catch (error) {
        console.error(ERROR_MESSAGES.ERROR_DELETING_TODO, error);
        // Rollback optimistic update
        setTodos((prev) => [...prev, todo]);
      }
    },
    [todos]
  );

  const createList = useCallback(async (name: string, color: string) => {
    try {
      const createdList = await apiService.createList(name, color);
      setLists((prev) => [...prev, createdList]);
      setSelectedListId(createdList.id);
    } catch (error) {
      console.error(ERROR_MESSAGES.ERROR_CREATING_LIST, error);
    }
  }, []);

  const deleteList = useCallback(
    async (listId: string) => {
      const originalLists = lists;
      const originalTodos = todos;
      const isCurrentlySelected = selectedListId === listId;

      try {
        // Optimistically update UI first
        const newLists = lists.filter((list) => list.id !== listId);
        
        // Determine new selection before updating state
        let newSelectedListId = selectedListId;
        if (isCurrentlySelected) {
          if (newLists.length > 0) {
            const personalList = newLists.find((list) => list.id === 'personal');
            const fallbackList =
              personalList ||
              newLists.sort(
                (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
              )[0];
            newSelectedListId = fallbackList.id;
          } else {
            newSelectedListId = '';
          }
        }

        // Update all state together to prevent race conditions
        setLists(newLists);
        setTodos((prev) => prev.filter((todo) => todo.listId !== listId));
        if (newSelectedListId !== selectedListId) {
          setSelectedListId(newSelectedListId);
        }
        
        // If user was viewing the deleted list, switch to 'all' to avoid showing stale data
        if (listFilter === listId) {
          setListFilter('all');
        }

        // Delete from database
        await apiService.deleteList(listId);
      } catch (error) {
        console.error(ERROR_MESSAGES.ERROR_DELETING_LIST, error);
        // Rollback optimistic updates
        setLists(originalLists);
        setTodos(originalTodos);
        if (isCurrentlySelected) {
          setSelectedListId(listId);
        }
      }
    },
    [lists, todos, selectedListId]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--interactive-primary)' }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>
            Loading your tasks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial">
      <ThemeToggle />
      <ConnectionBadge status={connectionStatus} />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            # TodoApp
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Organize your tasks efficiently
          </p>
        </div>

        <AddTodo
          lists={lists}
          selectedListId={selectedListId}
          onAddTodo={addTodo}
          onCreateList={createList}
          onSelectList={setSelectedListId}
        />
        <TodoListComponent
          todos={todos}
          lists={lists}
          completionFilter={completionFilter}
          listFilter={listFilter}
          onToggleTodo={toggleTodo}
          onEditTodo={editTodo}
          onDeleteTodo={deleteTodo}
          onDeleteList={deleteList}
          onSetCompletionFilter={setCompletionFilter}
          onSetListFilter={setListFilter}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <TodoApp />
    </ThemeProvider>
  );
}
