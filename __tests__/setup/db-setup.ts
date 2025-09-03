import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient } from 'mongodb'

let mongod: MongoMemoryServer
let connection: MongoClient

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  connection = new MongoClient(uri)
  await connection.connect()
  
  // Override the process.env for tests
  process.env.MONGODB_URI = uri
  process.env.MONGODB_DB = 'todoapp_test'
})

beforeEach(async () => {
  const db = connection.db('todoapp_test')
  await db.collection('todos').deleteMany({})
  await db.collection('lists').deleteMany({})
})

afterAll(async () => {
  if (connection) {
    await connection.close()
  }
  if (mongod) {
    await mongod.stop()
  }
})