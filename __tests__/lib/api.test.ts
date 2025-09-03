import { apiService } from '@/lib/api'
import { mockFetch } from '../mocks/api'

// Mock fetch globally
global.fetch = jest.fn()

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the session token cache for each test
    ;(apiService as any).sessionToken = null
  })

  describe('getSessionToken', () => {
    it('fetches and returns session token', async () => {
      global.fetch = mockFetch({ sessionToken: 'test-token-123' })
      
      const token = await apiService.getSessionToken()
      
      expect(token).toBe('test-token-123')
      expect(global.fetch).toHaveBeenCalledWith('/api/session', undefined)
    })

    it('returns cached session token on subsequent calls', async () => {
      global.fetch = mockFetch({ sessionToken: 'test-token-123' })
      
      const token1 = await apiService.getSessionToken()
      const token2 = await apiService.getSessionToken()
      
      expect(token1).toBe('test-token-123')
      expect(token2).toBe('test-token-123')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('uses default token when session endpoint fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
      
      const token = await apiService.getSessionToken()
      
      expect(token).toBe('default')
    })
  })

  describe('getTodosAndLists', () => {
    it('fetches todos and lists successfully', async () => {
      const mockResponse = {
        todos: [{
          id: '1',
          text: 'Test todo',
          completed: false,
          listId: 'list1',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }],
        lists: [{
          id: 'list1',
          name: 'Test List',
          color: '#3b82f6',
          createdAt: '2024-01-01T00:00:00.000Z'
        }]
      }
      
      global.fetch = mockFetch(mockResponse)
      
      const result = await apiService.getTodosAndLists()
      
      expect(result.todos).toHaveLength(1)
      expect(result.todos[0].createdAt).toBeInstanceOf(Date)
      expect(result.lists).toHaveLength(1)
      expect(result.lists[0].createdAt).toBeInstanceOf(Date)
    })

    it('includes authorization header with session token', async () => {
      // First mock the session token request
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ sessionToken: 'test-token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ todos: [], lists: [] })
        })
      
      await apiService.getTodosAndLists()
      
      expect(global.fetch).toHaveBeenCalledWith('/api/todos', {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      })
    })
  })

  describe('createTodo', () => {
    it('creates a new todo successfully', async () => {
      const mockTodo = {
        id: '1',
        text: 'New todo',
        completed: false,
        listId: 'list1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
      
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ sessionToken: 'test-token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockTodo)
        })
      
      const result = await apiService.createTodo('New todo', 'list1')
      
      expect(result.text).toBe('New todo')
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(global.fetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ text: 'New todo', listId: 'list1' })
      })
    })
  })

  describe('updateTodo', () => {
    it('updates a todo successfully', async () => {
      const mockTodo = {
        id: '1',
        text: 'Updated todo',
        completed: true,
        listId: 'list1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      global.fetch = mockFetch(mockTodo)
      
      const result = await apiService.updateTodo('1', { text: 'Updated todo', completed: true })
      
      expect(result.text).toBe('Updated todo')
      expect(global.fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Updated todo', completed: true })
      })
    })
  })

  describe('deleteTodo', () => {
    it('deletes a todo successfully', async () => {
      global.fetch = mockFetch({ success: true })
      
      await apiService.deleteTodo('1')
      
      expect(global.fetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'DELETE'
      })
    })
  })

  describe('createList', () => {
    it('creates a new list successfully', async () => {
      const mockList = {
        id: 'list1',
        name: 'New List',
        color: '#ef4444',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
      
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ sessionToken: 'test-token' })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockList)
        })
      
      const result = await apiService.createList('New List', '#ef4444')
      
      expect(result.name).toBe('New List')
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(global.fetch).toHaveBeenCalledWith('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ name: 'New List', color: '#ef4444' })
      })
    })
  })

  describe('error handling', () => {
    it('throws AppError for API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad request' })
      })
      
      await expect(apiService.getTodosAndLists()).rejects.toThrow('Bad request')
    })

    it('calls connection callback on network errors', async () => {
      const mockCallback = {
        setOnline: jest.fn(),
        setOffline: jest.fn(),
        setError: jest.fn()
      }
      
      apiService.setConnectionCallback(mockCallback)
      
      global.fetch = jest.fn().mockRejectedValue(new TypeError('fetch failed'))
      
      try {
        await apiService.getTodosAndLists()
      } catch (error) {
        // Expected to throw
      }
      
      expect(mockCallback.setOffline).toHaveBeenCalled()
    })

    it('calls connection callback on server errors', async () => {
      const mockCallback = {
        setOnline: jest.fn(),
        setOffline: jest.fn(),
        setError: jest.fn()
      }
      
      apiService.setConnectionCallback(mockCallback)
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      })
      
      try {
        await apiService.getTodosAndLists()
      } catch (error) {
        // Expected to throw
      }
      
      expect(mockCallback.setError).toHaveBeenCalled()
    })
  })
})