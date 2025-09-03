# Use official Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock first (for caching)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (we use pnpm here)
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the app
RUN pnpm build

# Expose port
EXPOSE 3000

# Start in development by default
CMD ["pnpm", "dev"]
