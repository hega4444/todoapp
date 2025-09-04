# ✅ TodoApp

<div align="center">

<p>A modern, secure todo application built with Next.js, TypeScript, and MongoDB. Features encrypted data storage, offline caching, and a responsive design.</p>

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.19.0-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-29.x-C21325?style=flat-square&logo=jest&logoColor=white)

<a href="https://todoappbyhega4444.vercel.app/" target="_blank">
<img src="app.png" alt="TodoApp Screenshot" width="800" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
</a>

<em>TodoApp interface showcasing the dark theme, task management, and list organization features</em>
<br />
<strong>🚀 <a href="https://todoappbyhega4444.vercel.app/" target="_blank">Try the live demo on Vercel</a></strong>

</div>


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
- **State Management**: React hooks with Context for theming

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hega4444/todoapp
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

### Alternative: Docker Compose Setup

For a quick setup with MongoDB and persistent volumes:

1. Clone the repository:
```bash
git clone https://github.com/hega4444/todoapp
cd todoapp
```

2. Start the entire stack:
```bash
docker compose up --build
```

This will start:
- Next.js development server on [http://localhost:3000](http://localhost:3000)
- MongoDB with persistent data volume
- Automatic dependency installation and hot reloading

### Scripts

- `pnpm dev`          - Start development server
- `pnpm build`        - Build for production
- `pnpm start`        - Start production server
- `pnpm lint`         - Run ESLint
- `pnpm lint:fix`     - Fix ESLint issues
- `pnpm typecheck`    - Run TypeScript type checking
- `pnpm test`         - Run all tests
- `pnpm test:watch`   - Run tests in watch mode
- `pnpm test:coverage`- Run tests with coverage report
- `pnpm test:server`  - Run only server-side tests (API routes)
- `pnpm test:client`  - Run only client-side tests (React components)

## Security

- All todo data is encrypted using AES-256 encryption
- Session-based authentication
- No sensitive data stored in localStorage unencrypted
- Environment variables for all secrets

