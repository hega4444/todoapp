export interface TodoList {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FilterType = 'all' | 'pending' | 'completed';

export interface User {
  id: string;
  sessionToken: string;
}

// MongoDB document interfaces
export interface TodoDocument {
  _id?: string;
  text: string;
  completed: boolean;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
  sessionToken: string;
}

export interface TodoListDocument {
  _id?: string;
  name: string;
  color: string;
  createdAt: Date;
  sessionToken: string;
}

// API response interfaces
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface GetTodosAndListsResponse {
  todos: Todo[];
  lists: TodoList[];
}

// Connection status types
export type ConnectionStatus = 'online' | 'offline' | 'error';

export interface ConnectionStatusCallback {
  setOnline: () => void;
  setError: () => void;
  setOffline: () => void;
}

// Error types
export class AppError extends Error {
  public code?: string;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Constants
export const DEFAULT_SESSION_TOKEN = 'default' as const;

export const CONNECTION_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ERROR: 'error',
} as const;

export const FILTER_TYPES = {
  ALL: 'all',
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const;
