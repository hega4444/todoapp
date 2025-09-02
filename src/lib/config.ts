interface DatabaseConfig {
  connectionString: string;
  databaseName: string;
  port?: number;
}

interface AppConfig {
  database: DatabaseConfig;
  environment: 'development' | 'staging' | 'production';
  port: number;
}

const config: AppConfig = {
  database: {
    connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    databaseName: process.env.MONGODB_DB || 'todoapp',
    port: process.env.MONGODB_PORT ? parseInt(process.env.MONGODB_PORT) : undefined
  },
  environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
  port: parseInt(process.env.PORT || '3000', 10)
};

export default config;