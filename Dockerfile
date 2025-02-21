# FROM node:18-alpine AS builder
# WORKDIR /app

# # Install pnpm and dependencies
# COPY package.json pnpm-lock.yaml ./
# RUN npm install -g pnpm && pnpm install --frozen-lockfile

# # Copy all source files and build the application
# COPY . .
# RUN pnpm run build

# FROM node:18-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV production

# # Copy built assets and necessary files from the builder stage
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/next.config.ts ./
# COPY --from=builder /app/tsconfig.json ./

# EXPOSE 3000
# CMD ["pnpm", "start"]



# FROM node:18-alpine AS builder
# WORKDIR /app

# # Install pnpm and dependencies
# COPY package.json pnpm-lock.yaml ./
# RUN npm install -g pnpm && pnpm install --frozen-lockfile

# # Generate Prisma client
# COPY prisma ./prisma
# RUN npx prisma generate  

# # Copy all source files and build the application
# COPY . .
# RUN pnpm run build

# FROM node:18-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV production

# # Install pnpm in the runner stage
# RUN npm install -g pnpm

# # Copy built assets and necessary files from the builder stage
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/next.config.ts ./next.config.ts
# COPY --from=builder /app/tsconfig.json ./tsconfig.json
# COPY --from=builder /app/prisma ./prisma
# COPY .env .env

# # Install only production dependencies
# RUN pnpm install --prod

# EXPOSE 3000
# CMD ["pnpm", "start"]


# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy environment file early so Prisma can pick up necessary variables
COPY .env .env

# Install pnpm and dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the Prisma schema and related files
COPY prisma ./prisma

# Generate the Prisma client
# (Ensure your prisma/schema.prisma is configured to generate the client into a custom folder like "prisma/generated")
RUN npx prisma generate

# Copy all remaining source files and build the application
COPY . .
RUN pnpm run build

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Install pnpm in the runner stage
RUN npm install -g pnpm

# Copy built assets and necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy the Prisma folder (including the generated client)
COPY --from=builder /app/prisma ./prisma

# Copy the environment file (if needed at runtime)
COPY --from=builder /app/.env .env

# Install only production dependencies
RUN pnpm install --prod

EXPOSE 3000
CMD ["pnpm", "start"]


