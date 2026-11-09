import { PrismaClient } from '@prisma/client'
import { env } from '@/lib/env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Query logging is a dev convenience — keep production quiet unless DEBUG_PRISMA=1.
    log:
      env.isProd
        ? process.env.DEBUG_PRISMA === '1'
          ? ['query', 'error']
          : ['error']
        : ['query', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
