const { PrismaClient } = require('@prisma/client')

declare global { var prisma: any }

export const prisma = globalThis.prisma ?? new PrismaClient({ log: ['error'] })
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
