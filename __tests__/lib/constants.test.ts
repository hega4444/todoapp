import { API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES } from '@/lib/constants';

describe('Constants', () => {
  it('should have correct API endpoints', () => {
    expect(API_ENDPOINTS.TODOS).toBe('/api/todos');
    expect(API_ENDPOINTS.LISTS).toBe('/api/lists');
    expect(API_ENDPOINTS.SESSION).toBe('/api/session');
  });

  it('should have correct storage keys', () => {
    expect(STORAGE_KEYS.TODOS_CACHE).toBe('todos_cache');
    expect(STORAGE_KEYS.LISTS_CACHE).toBe('lists_cache');
  });

  it('should have correct error messages', () => {
    expect(ERROR_MESSAGES.LOAD_DATA_FAILED).toBe('Failed to load data from server');
    expect(ERROR_MESSAGES.ADD_TODO_FAILED).toBe('Failed to add todo');
    expect(ERROR_MESSAGES.UPDATE_TODO_FAILED).toBe('Failed to update todo');
  });
});