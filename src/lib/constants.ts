// API Constants
export const API_ENDPOINTS = {
  TODOS: '/api/todos',
  LISTS: '/api/lists',
  SESSION: '/api/session',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TODOS_CACHE: 'todos_cache',
  LISTS_CACHE: 'lists_cache',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  LOAD_DATA_FAILED: 'Failed to load data from server',
  ADD_TODO_FAILED: 'Failed to add todo',
  UPDATE_TODO_FAILED: 'Failed to update todo',
  DELETE_TODO_FAILED: 'Failed to delete todo',
  CREATE_LIST_FAILED: 'Failed to create list',
  DELETE_LIST_FAILED: 'Failed to delete list',
  EDIT_TODO_FAILED: 'Failed to edit todo',
  SESSION_TOKEN_FAILED: 'Failed to get session token, using default',

  // Console error messages
  ERROR_LOADING_DATA: 'Error loading data from server:',
  ERROR_LOADING_CACHE: 'Error loading cached data:',
  ERROR_ADDING_TODO: 'Error adding todo:',
  ERROR_TOGGLING_TODO: 'Error toggling todo:',
  ERROR_EDITING_TODO: 'Error editing todo:',
  ERROR_DELETING_TODO: 'Error deleting todo:',
  ERROR_CREATING_LIST: 'Error creating list:',
  ERROR_DELETING_LIST: 'Error deleting list:',

  // API error messages
  INTERNAL_SERVER_ERROR: 'Internal server error',
  TODO_NOT_FOUND: 'Todo not found',
  INVALID_TODO_ID: 'Invalid todo ID',
  DATABASE_ERROR: 'Database error:',
  FAILED_TO_DECRYPT: 'Failed to decrypt todo:',
  MONGODB_CONNECTION_FAILED: 'MongoDB connection failed:',
} as const;

// Color Palette for Lists (matches exactly with AddTodo COLORS)
export const LIST_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
] as const;

// Default Todo Lists
export const DEFAULT_LISTS = [
  { id: 'personal', name: 'Personal', color: '#3B82F6', createdAt: new Date() },
  { id: 'work', name: 'Work', color: '#EF4444', createdAt: new Date() },
  { id: 'shopping', name: 'Shopping', color: '#10B981', createdAt: new Date() },
];

// Timer for ConnectionBadge messages
export const CONNECTION_BADGE_TIMER = 5000;
