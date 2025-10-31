import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;
// Note: avoid calling prisma.$connect() eagerly here in development or
// serverless environments — let Prisma manage connections lazily. If you
// need to pre-warm connections, call prisma.$connect() from a bootstrap
// script or server entrypoint.