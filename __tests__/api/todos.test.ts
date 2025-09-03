/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/todos/route'
import mongodb from '@/lib/mongodb'
import { EncryptionService } from '@/lib/encryption'

// Mock the dependencies
jest.mock('@/lib/mongodb')
jest.mock('@/lib/encryption')

const mockMongodb = mongodb as jest.Mocked<typeof mongodb>
const mockEncryption = EncryptionService as jest.MockedClass<typeof EncryptionService>

const mockDb = {
  collection: jest.fn()
}

const mockCollection = {
  find: jest.fn(),
  insertOne: jest.fn(),
  insertMany: jest.fn(),
  toArray: jest.fn()
}

describe('/api/todos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMongodb.connect.mockResolvedValue(mockDb as any)
    mockDb.collection.mockReturnValue(mockCollection as any)
    mockCollection.find.mockReturnValue({ toArray: mockCollection.toArray } as any)
    
    mockEncryption.encrypt = jest.fn().mockImplementation((text) => `encrypted_${text}`)
    mockEncryption.decrypt = jest.fn().mockImplementation((text) => text.replace('encrypted_', ''))
    mockEncryption.isEncrypted = jest.fn().mockReturnValue(true)
  })

  describe('GET /api/todos', () => {
    it('returns todos and lists for a session', async () => {
      const mockTodos = [
        { _id: 'todo1', text: 'encrypted_Test todo', completed: false, listId: 'list1', sessionToken: 'session123' }
      ]
      const mockLists = [
        { _id: 'list1', name: 'Test List', color: '#3b82f6', sessionToken: 'session123' }
      ]

      mockCollection.toArray
        .mockResolvedValueOnce(mockTodos)
        .mockResolvedValueOnce(mockLists)

      const request = new NextRequest('http://localhost/api/todos', {
        headers: { authorization: 'Bearer session123' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.todos).toHaveLength(1)
      expect(data.todos[0].text).toBe('Test todo')
      expect(data.todos[0].id).toBe('todo1')
      expect(data.lists).toHaveLength(1)
      expect(data.lists[0].id).toBe('list1')
    })

    it('creates default lists for new users', async () => {
      mockCollection.toArray
        .mockResolvedValueOnce([]) // no todos
        .mockResolvedValueOnce([]) // no lists

      mockCollection.insertMany.mockResolvedValue({
        insertedIds: ['list1', 'list2']
      })

      const request = new NextRequest('http://localhost/api/todos', {
        headers: { authorization: 'Bearer session123' }
      })

      const response = await GET(request)
      expect(response.status).toBe(200)
      expect(mockCollection.insertMany).toHaveBeenCalled()
    })

    it('handles decryption errors gracefully', async () => {
      const mockTodos = [
        { _id: 'todo1', text: 'encrypted_data', completed: false, listId: 'list1', sessionToken: 'session123' }
      ]

      mockCollection.toArray
        .mockResolvedValueOnce(mockTodos)
        .mockResolvedValueOnce([])

      mockEncryption.decrypt = jest.fn().mockImplementation(() => {
        throw new Error('Decryption failed')
      })

      const request = new NextRequest('http://localhost/api/todos')
      const response = await GET(request)
      const data = await response.json()

      expect(data.todos[0].text).toBe('[Decryption Failed]')
    })

    it('handles database errors', async () => {
      mockMongodb.connect.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/todos')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'Internal server error' })
    })
  })

  describe('POST /api/todos', () => {
    it('creates a new todo successfully', async () => {
      mockCollection.insertOne.mockResolvedValue({
        insertedId: 'new_todo_id'
      })

      const request = new NextRequest('http://localhost/api/todos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          authorization: 'Bearer session123'
        },
        body: JSON.stringify({ text: 'New todo', listId: 'list1' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.text).toBe('New todo')
      expect(data.id).toBe('new_todo_id')
      expect(mockEncryption.encrypt).toHaveBeenCalledWith('New todo', 'session123')
      expect(mockCollection.insertOne).toHaveBeenCalled()
    })

    it('validates required fields', async () => {
      const request = new NextRequest('http://localhost/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '', listId: 'list1' })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Text and listId are required' })
    })

    it('validates listId is provided', async () => {
      const request = new NextRequest('http://localhost/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Valid text' })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Text and listId are required' })
    })

    it('handles database errors during creation', async () => {
      mockMongodb.connect.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'New todo', listId: 'list1' })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'Internal server error' })
    })

    it('uses default session token when none provided', async () => {
      mockCollection.insertOne.mockResolvedValue({
        insertedId: 'new_todo_id'
      })

      const request = new NextRequest('http://localhost/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'New todo', listId: 'list1' })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(201)
      expect(mockEncryption.encrypt).toHaveBeenCalledWith('New todo', 'default')
    })
  })
})