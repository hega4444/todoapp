interface DatabaseConfig {
  connectionString: string;
  databaseName: string;
  port?: number;
}

interface AppConfig {
  database: DatabaseConfig;
  environment: 'development' | 'staging' | 'production';
  port: number;
  isDevelopment: boolean;
  isProduction: boolean;
}

const environment =
  (process.env.NODE_ENV as 'development' | 'staging' | 'production') ||
  'development';

const config: AppConfig = {
  database: {
    connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    databaseName: process.env.MONGODB_DB || 'todoapp',
    port: process.env.MONGODB_PORT
      ? parseInt(process.env.MONGODB_PORT)
      : undefined,
  },
  environment,
  port: parseInt(process.env.PORT || '3000', 10),
  isDevelopment: environment === 'development',
  isProduction: environment === 'production',
};

export default config;
