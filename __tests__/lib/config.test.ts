describe('Config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('database configuration', () => {
    it('uses environment variables for database config', () => {
      process.env.MONGODB_URI = 'mongodb://test-server:27017'
      process.env.MONGODB_DB = 'test-db'

      const freshConfig = require('@/lib/config').default

      expect(freshConfig.database.connectionString).toBe('mongodb://test-server:27017')
      expect(freshConfig.database.databaseName).toBe('test-db')
    })

    it('uses default database values when env vars are missing', () => {
      delete process.env.MONGODB_URI
      delete process.env.MONGODB_DB

      const freshConfig = require('@/lib/config').default

      expect(freshConfig.database.connectionString).toBe('mongodb://localhost:27017')
      expect(freshConfig.database.databaseName).toBe('todoapp')
    })
  })

  describe('environment detection', () => {
    it('detects development environment', () => {
      ;(process.env as any).NODE_ENV = 'development'

      const freshConfig = require('@/lib/config').default

      expect(freshConfig.isDevelopment).toBe(true)
      expect(freshConfig.isProduction).toBe(false)
    })

    it('detects production environment', () => {
      ;(process.env as any).NODE_ENV = 'production'

      const freshConfig = require('@/lib/config').default

      expect(freshConfig.isDevelopment).toBe(false)
      expect(freshConfig.isProduction).toBe(true)
    })

    it('defaults to development when NODE_ENV is not set', () => {
      delete (process.env as any).NODE_ENV

      const freshConfig = require('@/lib/config').default

      expect(freshConfig.isDevelopment).toBe(true)
      expect(freshConfig.isProduction).toBe(false)
    })
  })
})