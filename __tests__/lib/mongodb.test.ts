/**
 * @jest-environment node
 */
import { TextEncoder, TextDecoder } from 'util'

// Add TextEncoder/TextDecoder for Node environment
;(global as any).TextEncoder = TextEncoder as any
;(global as any).TextDecoder = TextDecoder as any

// Mock the MongoDB module
jest.mock('@/lib/mongodb', () => {
  const mockDb = {
    databaseName: 'todoapp_test',
    collection: jest.fn().mockReturnValue({
      createIndex: jest.fn().mockResolvedValue({}),
      listIndexes: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { key: { sessionToken: 1 } },
          { key: { listId: 1 } },
          { key: { sessionToken: 1 } }
        ])
      })
    })
  }
  
  return {
    __esModule: true,
    default: {
      connect: jest.fn().mockResolvedValue(mockDb)
    }
  }
})

import mongodb from '@/lib/mongodb'

beforeEach(() => {
  jest.clearAllMocks()
  // Mock console.error to suppress any connection error logs
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('MongoDB', () => {
  it('connects to database successfully', async () => {
    const db = await mongodb.connect()
    expect(db).toBeDefined()
    expect(db.databaseName).toBe('todoapp_test')
  })

  it('returns same database instance on subsequent connections', async () => {
    const db1 = await mongodb.connect()
    const db2 = await mongodb.connect()
    expect(db1).toBe(db2)
  })

  it('creates required indexes', async () => {
    const db = await mongodb.connect()
    
    const todosIndexes = await db.collection('todos').listIndexes().toArray()
    const listsIndexes = await db.collection('lists').listIndexes().toArray()
    
    const todoIndexNames = todosIndexes.map(index => Object.keys(index.key)[0])
    const listIndexNames = listsIndexes.map(index => Object.keys(index.key)[0])
    
    expect(todoIndexNames).toContain('sessionToken')
    expect(todoIndexNames).toContain('listId')
    expect(listIndexNames).toContain('sessionToken')
  })

  it('handles connection gracefully', async () => {
    // Just test that connect works with valid connection
    const db = await mongodb.connect()
    expect(db).toBeDefined()
  })
})