import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import fs from 'node:fs';

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient;
}

// Workaround to find the db file in production
const filePath = path.join(process.cwd(), 'prisma/dev.db');
const dbDir = path.dirname(filePath);

// Ensure the directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Fix: Use proper connection URL for read-write access
const config = {
  datasources: {
    db: {
      url: `file:${filePath}?connection_limit=1`,
    },
  },
};

let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(config);
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient(config);
  }
  prisma = global.cachedPrisma;
}

export { prisma };
