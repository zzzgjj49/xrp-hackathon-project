let prisma: any = null

async function initPrisma() {
  if (prisma) return prisma
  try {
    const mod = await import('@prisma/client')
    const PrismaClient = (mod as any).PrismaClient
    if (PrismaClient) {
      prisma = new PrismaClient()
      if (process.env.NODE_ENV !== 'production') (globalThis as any).prisma = prisma
      return prisma
    }
    throw new Error('PrismaClient not available')
  } catch {
    prisma = {
      $transaction: async () => { throw new Error('Prisma unavailable') },
      user: {
        upsert: async () => { throw new Error('Prisma unavailable') },
        update: async () => { throw new Error('Prisma unavailable') },
        findUnique: async () => { throw new Error('Prisma unavailable') },
      },
      stakeOrder: {
        create: async () => { throw new Error('Prisma unavailable') },
        update: async () => { throw new Error('Prisma unavailable') },
        findFirst: async () => { throw new Error('Prisma unavailable') },
      },
      slashEvent: {
        create: async () => { throw new Error('Prisma unavailable') },
      },
      pointsHistory: {
        create: async () => { throw new Error('Prisma unavailable') },
      },
    }
    return prisma
  }
}

export default await initPrisma()