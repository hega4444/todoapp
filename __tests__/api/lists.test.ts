/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/lists/route'
import mongodb from '@/lib/mongodb'

// Mock the dependencies
jest.mock('@/lib/mongodb')

const mockMongodb = mongodb as jest.Mocked<typeof mongodb>

const mockDb = {
  collection: jest.fn()
}

const mockCollection = {
  find: jest.fn(),
  insertOne: jest.fn(),
  toArray: jest.fn()
}

describe('/api/lists', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMongodb.connect.mockResolvedValue(mockDb as any)
    mockDb.collection.mockReturnValue(mockCollection as any)
    mockCollection.find.mockReturnValue({ toArray: mockCollection.toArray } as any)
  })

  describe('GET /api/lists', () => {
    it('returns lists for a session', async () => {
      const mockLists = [
        {
          _id: 'list1',
          name: 'Work Tasks',
          color: '#3b82f6',
          createdAt: new Date('2024-01-01'),
          sessionToken: 'session123'
        },
        {
          _id: 'list2',
          name: 'Personal',
          color: '#ef4444',
          createdAt: new Date('2024-01-02'),
          sessionToken: 'session123'
        }
      ]

      mockCollection.toArray.mockResolvedValue(mockLists)

      const request = new NextRequest('http://localhost/api/lists', {
        headers: { authorization: 'Bearer session123' }
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
      expect(data[0]).toEqual({
        id: 'list1',
        name: 'Work Tasks',
        color: '#3b82f6',
        createdAt: mockLists[0].createdAt.toISOString()
      })
      expect(data[1]).toEqual({
        id: 'list2',
        name: 'Personal',
        color: '#ef4444',
        createdAt: mockLists[1].createdAt.toISOString()
      })
    })

    it('returns empty array when no lists exist', async () => {
      mockCollection.toArray.mockResolvedValue([])

      const request = new NextRequest('http://localhost/api/lists', {
        headers: { 'Authorization': 'Bearer session123' }
      })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('returns 401 when no authorization provided', async () => {
      const request = new NextRequest('http://localhost/api/lists')
      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: 'Authorization required' })
    })

    it('handles database errors', async () => {
      mockMongodb.connect.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost/api/lists')
      const response = await GET(request)

      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'Internal server error' })
    })
  })

  describe('POST /api/lists', () => {
    it('creates a new list successfully', async () => {
      mockCollection.insertOne.mockResolvedValue({
        insertedId: 'new_list_id'
      })

      const request = new NextRequest('http://localhost/api/lists', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          authorization: 'Bearer session123'
        },
        body: JSON.stringify({ name: 'Shopping List', color: '#10b981' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('Shopping List')
      expect(data.color).toBe('#10b981')
      expect(data.id).toBe('new_list_id')
      expect(typeof data.createdAt).toBe('string')
      expect(new Date(data.createdAt)).toBeInstanceOf(Date)

      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        name: 'Shopping List',
        color: '#10b981',
        createdAt: expect.any(Date),
        sessionToken: 'session123'
      })
    })

    it('trims whitespace from name and color', async () => {
      mockCollection.insertOne.mockResolvedValue({
        insertedId: 'new_list_id'
      })

      const request = new NextRequest('http://localhost/api/lists', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer session123'
        },
        body: JSON.stringify({ name: '  Shopping List  ', color: '  #10b981  ' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('Shopping List')
      expect(data.color).toBe('#10b981')
    })

    it('validates required name field', async () => {
      const request = new NextRequest('http://localhost/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', color: '#10b981' })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Name and color are required' })
    })

    it('validates required color field', async () => {
      const request = new NextRequest('http://localhost/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Shopping List', color: '' })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Name and color are required' })
    })

    it('validates both name and color fields', async () => {
      const request = new NextRequest('http://localhost/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const response = await POST(request)
      
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'Name and color are required' })
    })

    it('returns 401 when no authorization provided', async () => {
      const request = new NextRequest('http://localhost/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Shopping List', color: '#10b981' })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(401)
      expect(await response.json()).toEqual({ error: 'Authorization required' })
    })

    it('handles database errors during creation', async () => {
      mockMongodb.connect.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Shopping List', color: '#10b981' })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'Internal server error' })
    })
  })
})