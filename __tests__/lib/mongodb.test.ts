import mongodb from '@/lib/mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  process.env.MONGODB_DB = 'todoapp_test'
})

afterAll(async () => {
  if (mongod) {
    await mongod.stop()
  }
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

  it('throws error with invalid connection string', async () => {
    const originalUri = process.env.MONGODB_URI
    process.env.MONGODB_URI = 'invalid://connection'
    
    // Reset the singleton instance
    delete (mongodb as any).db
    delete (mongodb as any).client
    
    await expect(mongodb.connect()).rejects.toThrow()
    
    // Restore original URI
    process.env.MONGODB_URI = originalUri
  })
})