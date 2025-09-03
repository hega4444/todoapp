import type { Config } from 'jest'
import nextJest from 'next/jest.js'
import path from 'path'

const createJestConfig = nextJest({
  // Point to project root to load next.config.js and .env files
  dir: path.resolve(__dirname, '../../'),
})

// Custom Jest config with proper rootDir setting
const config: Config = {
  // Set <rootDir> to project root for path resolution
  rootDir: path.resolve(__dirname, '../../'),
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/config/jest/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(mongodb|bson)/)', 
  ],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  // Exclude mock files from being treated as tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/mocks/',
    '/__tests__/setup/',
  ]
}

// Export to allow next/jest to load async Next.js config
export default createJestConfig(config)