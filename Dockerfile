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

# Copy .env early so that Prisma picks up required environment variables
COPY .env .env

# Copy package.json and pnpm-lock.yaml then install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the Prisma folder and generate the Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the source files and build the application
COPY . .
RUN pnpm run build

# Remove dev dependencies so that node_modules only contains production deps (including the generated Prisma client)
RUN pnpm prune --prod

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# (Optional) Install pnpm for runtime tasks if needed
RUN npm install -g pnpm

# Copy built artifacts and necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env .env
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "start"]



