import { MongoClient, Db, ObjectId } from 'mongodb';
import config from './config';

class MongoDB {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    try {
      this.client = new MongoClient(config.database.connectionString);
      await this.client.connect();
      this.db = this.client.db(config.database.databaseName);
      
      await this.ensureIndexes();
      
      return this.db;
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  private async ensureIndexes(): Promise<void> {
    if (!this.db) return;

    await this.db.collection('todos').createIndex({ sessionToken: 1 });
    await this.db.collection('todos').createIndex({ listId: 1 });
    await this.db.collection('lists').createIndex({ sessionToken: 1 });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  static createObjectId(id?: string): ObjectId {
    return id ? new ObjectId(id) : new ObjectId();
  }

  static isValidObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  }
}

const mongodb = new MongoDB();
export default mongodb;