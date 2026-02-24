FROM node:22.13.1-alpine AS base
RUN npm install -g pnpm@9.15.0
WORKDIR /app
COPY package.json pnpm-lock.yaml tsconfig.json ./

# --- Stage 2: Development ---
FROM base AS development
RUN pnpm install
COPY . .
# Dev uses TS files directly via tsx/ts-node
CMD ["pnpm", "run", "dev"]

# --- Stage 3: The Builder (Production only) ---
FROM base AS builder
COPY . . 
RUN pnpm install
# This command converts ALL .ts files (including worker.ts) to .js in /dist
RUN pnpm run build 

# --- Stage 4: Production Runtime ---
FROM base AS production
COPY . .
RUN pnpm install
# Copy the compiled JS from the builder stage
COPY --from=builder /app/dist ./dist
# Copy any other necessary files
