# ─── Stage 1: Build ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first — Docker cache layer optimization
# If package.json hasn't changed, npm install is skipped on rebuild
COPY package*.json ./

RUN npm ci

# Copy source and compile TypeScript → JavaScript
COPY . .
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────
# Separate stage — only ships compiled JS, not TS source or devDeps
FROM node:20-alpine AS production

WORKDIR /app

# Only copy production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Never run as root in production containers
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]