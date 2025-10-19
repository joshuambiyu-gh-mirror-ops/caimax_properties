
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production=false

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

RUN npm prune --production

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXTAUTH_URL=https://caimax.co.ke

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]



