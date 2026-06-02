# Stage 1: Build & Seed Stage
FROM node:22-alpine AS builder

# Install build-time dependencies (Prisma engines require openssl/libraries)
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Generate Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Build frontend asset distribution and Express backend bundle
COPY . .
RUN npm run build

# Perform database migrations and seed mock team data within the build stage
RUN npx prisma migrate deploy && npx tsx prisma/seed.ts

# Stage 2: Production Execution Runtime
FROM node:22-alpine AS runner

# Install system runtime libraries required by Prisma Engines
RUN apk add --no-cache openssl

WORKDIR /app

# Install only production dependencies (saves huge image size)
COPY package*.json ./
RUN npm ci --omit=dev

# Regenerate Prisma Client within production space to align packages
COPY prisma ./prisma
RUN npx prisma generate

# Copy compiled SPA web assets, bundled Express server, and the pre-populated SQLite DB
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/prisma/dev.db ./prisma/dev.db

# Define environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV GEMINI_API_KEY=""

EXPOSE 3001

# Execute production server (which automatically serves statically compiled client)
CMD ["node", "server.js"]
