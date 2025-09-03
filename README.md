# TodoApp

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.19.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

A modern, secure todo application built with Next.js, TypeScript, and MongoDB. Features encrypted data storage, offline caching, and a responsive design.

## Features

- ✅ Create, edit, and delete todos
- 📝 Organize tasks into custom lists
- 🎨 Color-coded list system
- 🔒 End-to-end encryption for all todo data
- 📱 Responsive design for all devices
- 🌙 Dark/light theme toggle
- ⚡ Offline support with local caching
- 🔄 Real-time connection status

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas
- **Security**: AES-256 encryption
- **State Management**: React Context with useReducer

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd todoapp
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```bash
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=todoapp_dev
ENCRYPTION_MASTER_KEY=your_256_bit_hex_key_here_64_characters_minimum
```

5. Generate an encryption key:
```bash
openssl rand -hex 32
```

### Development

Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   └── page.tsx        # Main application page
├── components/         # React components
├── contexts/           # React contexts
├── lib/               # Utilities and configurations
└── types/             # TypeScript type definitions
```

## Security

- All todo data is encrypted using AES-256 encryption
- Session-based authentication
- No sensitive data stored in localStorage unencrypted
- Environment variables for all secrets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details