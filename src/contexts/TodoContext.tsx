'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Todo, TodoList, FilterType } from '@/types';
import { apiService } from '@/lib/api';
import { useConnection } from './ConnectionContext';

const DEFAULT_LISTS: TodoList[] = [
  { id: 'personal', name: 'Personal', color: '#3B82F6', createdAt: new Date() },
  { id: 'work', name: 'Work', color: '#EF4444', createdAt: new Date() },
  { id: 'shopping', name: 'Shopping', color: '#10B981', createdAt: new Date() }
];

interface TodoContextType {
  // State
  todos: Todo[];
  lists: TodoList[];
  selectedListId: string;
  completionFilter: FilterType;
  listFilter: string;
  loading: boolean;

  // Actions
  addTodo: (text: string, listId: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  editTodo: (id: string, text: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  createList: (name: string, color: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  
  // Filters
  setSelectedList: (listId: string) => void;
  setCompletionFilter: (filter: FilterType) => void;
  setListFilter: (filter: string) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
}

export function TodoProvider({ children }: TodoProviderProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lists, setLists] = useState<TodoList[]>(DEFAULT_LISTS);
  const [selectedListId, setSelectedListId] = useState(DEFAULT_LISTS[0].id);
  const [completionFilter, setCompletionFilter] = useState<FilterType>('all');
  const [listFilter, setListFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  const { setOnline, setError, setOffline } = useConnection();

  // Set up connection callback for API service
  useEffect(() => {
    apiService.setConnectionCallback({ setOnline, setError, setOffline });
  }, [setOnline, setError, setOffline]);

  // Load data from API on mount, with local cache for fast loading
  useEffect(() => {
    // First load from cache for immediate display
    loadFromLocalStorage();
    // Then load fresh data from API
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { todos: apiTodos, lists: apiLists } = await apiService.getTodosAndLists();
      
      // Convert date strings back to Date objects
      const processedTodos = apiTodos.map(todo => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt)
      }));
      
      const processedLists = apiLists.map(list => ({
        ...list,
        createdAt: new Date(list.createdAt)
      }));

      setTodos(processedTodos);
      setLists(processedLists);
      
      // Set default selected list if none exists
      if (processedLists.length > 0 && !processedLists.find(l => l.id === selectedListId)) {
        setSelectedListId(processedLists[0].id);
      }
    } catch (error) {
      console.error('Error loading data from server:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const savedTodos = localStorage.getItem('todos_cache');
    const savedLists = localStorage.getItem('lists_cache');
    
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos);
        setTodos(parsedTodos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        })));
      } catch (error) {
        console.error('Error loading cached todos:', error);
      }
    }
    
    if (savedLists) {
      try {
        const parsedLists = JSON.parse(savedLists);
        setLists(parsedLists.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt)
        })));
      } catch (error) {
        console.error('Error loading cached lists:', error);
      }
    }
  };

  // Cache to localStorage for fast refreshes
  useEffect(() => {
    localStorage.setItem('todos_cache', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('lists_cache', JSON.stringify(lists));
  }, [lists]);

  const addTodo = async (text: string, listId: string) => {
    // Check if the target list is empty before adding
    const listTodos = todos.filter(todo => todo.listId === listId);
    const isEmptyList = listTodos.length === 0;

    try {
      const newTodo = await apiService.createTodo(text, listId);
      setTodos(prev => [...prev, {
        ...newTodo,
        createdAt: new Date(newTodo.createdAt),
        updatedAt: new Date(newTodo.updatedAt)
      }]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }

    // If we added to an empty list, automatically filter to show that list
    if (isEmptyList) {
      setListFilter(listId);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistically update UI first
    setTodos(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date() } : t
      )
    );

    try {
      await apiService.updateTodo(id, { completed: !todo.completed });
    } catch (error) {
      console.error('Error toggling todo:', error);
      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, completed: todo.completed } : t
        )
      );
    }
  };

  const editTodo = async (id: string, text: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistically update UI first
    setTodos(prev =>
      prev.map(t =>
        t.id === id ? { ...t, text, updatedAt: new Date() } : t
      )
    );

    try {
      await apiService.updateTodo(id, { text });
    } catch (error) {
      console.error('Error editing todo:', error);
      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, text: todo.text } : t
        )
      );
    }
  };

  const deleteTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistically update UI first
    setTodos(prev => prev.filter(t => t.id !== id));

    try {
      await apiService.deleteTodo(id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      setTodos(prev => [...prev, todo]);
    }
  };

  const createList = async (name: string, color: string) => {
    try {
      const createdList = await apiService.createList(name, color);
      setLists(prev => [...prev, {
        ...createdList,
        createdAt: new Date(createdList.createdAt)
      }]);
      setSelectedListId(createdList.id);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const deleteList = async (listId: string) => {
    // Check if we're deleting the currently selected list
    const isCurrentlySelected = selectedListId === listId;
    
    // Optimistically update UI first
    const originalLists = lists;
    const originalTodos = todos;
    
    try {
      // Remove list and todos from local state
      setLists(prev => {
        const newLists = prev.filter(list => list.id !== listId);
        
        // If we deleted the currently selected list, set a new selection
        if (isCurrentlySelected && newLists.length > 0) {
          // Try to find 'personal' list first, otherwise use the oldest list
          const personalList = newLists.find(list => list.id === 'personal');
          const fallbackList = personalList || newLists.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
          setSelectedListId(fallbackList.id);
        } else if (isCurrentlySelected && newLists.length === 0) {
          // No lists left, set a default state
          setSelectedListId('');
        }
        
        return newLists;
      });
      setTodos(prev => prev.filter(todo => todo.listId !== listId));
      
      // Delete from database (this handles both list and todos deletion)
      await apiService.deleteList(listId);
    } catch (error) {
      console.error('Error deleting list:', error);
      // Revert optimistic updates on error
      setLists(originalLists);
      setTodos(originalTodos);
      if (isCurrentlySelected) {
        setSelectedListId(listId);
      }
    }
  };

  const setSelectedList = (listId: string) => {
    setSelectedListId(listId);
  };

  const value: TodoContextType = {
    // State
    todos,
    lists,
    selectedListId,
    completionFilter,
    listFilter,
    loading,

    // Actions
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    createList,
    deleteList,

    // Filters
    setSelectedList,
    setCompletionFilter,
    setListFilter,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}