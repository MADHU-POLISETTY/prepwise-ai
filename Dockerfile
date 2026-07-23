# ===============================================
# STAGE 1: Build Phase
# ===============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverage layer cache)
COPY package*.json ./
RUN npm ci

# Copy full source and build full-stack assets
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ===============================================
# STAGE 2: Production Lightweight Runtime
# ===============================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled backend CJS server and client dist bundles
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api

# Expose the standard container ingress routing port
EXPOSE 3000

# Run the unified production server entrypoint
CMD ["node", "dist/server.cjs"]
