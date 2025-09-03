# Claude Code Configuration

This file contains commands that Claude Code can use to better assist with this project.

## Development Commands

### Build and Type Check
- `pnpm build` - Build the application for production
- `pnpm typecheck` - Run TypeScript type checking

### Code Quality
- `pnpm lint` - Run ESLint to check for code issues
- `pnpm lint:fix` - Automatically fix ESLint issues
- `pnpm format` - Format code with Prettier

### Testing
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report

### Development
- `pnpm dev` - Start development server
- `pnpm start` - Start production server

## Project Structure

This is a Next.js 15 application with:
- TypeScript for type safety
- Tailwind CSS for styling  
- MongoDB for data storage
- AES-256 encryption for security
- React Context with useReducer for state management

## Key Files
- `src/types/index.ts` - TypeScript type definitions
- `src/lib/api.ts` - API service layer
- `src/contexts/TodoContext.tsx` - Main application state
- `src/lib/mongodb.ts` - Database connection
- `src/lib/encryption.ts` - Data encryption utilities