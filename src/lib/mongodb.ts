import { MongoClient, Db } from 'mongodb';
import config from './config';
import { ERROR_MESSAGES } from './constants';

class MongoDB {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    try {
      this.client = new MongoClient(config.database.connectionString, {
        ssl: true,
        sslValidate: true,
        retryWrites: true,
        w: 'majority',
      });
      await this.client.connect();
      this.db = this.client.db(config.database.databaseName);
      
      await this.ensureIndexes();
      
      return this.db;
    } catch (error) {
      console.error(ERROR_MESSAGES.MONGODB_CONNECTION_FAILED, error);
      throw error;
    }
  }

  private async ensureIndexes(): Promise<void> {
    if (!this.db) return;

    await this.db.collection('todos').createIndex({ sessionToken: 1 });
    await this.db.collection('todos').createIndex({ listId: 1 });
    await this.db.collection('lists').createIndex({ sessionToken: 1 });
  }

}

const mongodb = new MongoDB();
export default mongodb;