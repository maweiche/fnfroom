import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Soft delete extension using Prisma's modern extension API
export const prisma = basePrisma.$extends({
  name: 'softDelete',
  query: {
    user: {
      // Convert delete to soft delete for User
      async delete({ args, query }) {
        return query({ ...args, data: { deletedAt: new Date() } } as any);
      },
      async deleteMany({ args, query }) {
        return query({
          ...args,
          data: { deletedAt: new Date() },
        } as any);
      },
      // Filter soft-deleted records
      async findUnique({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        } as any);
      },
      async findFirst({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        });
      },
      async findMany({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        });
      },
    },
    game: {
      // Convert delete to soft delete for Game
      async delete({ args, query }) {
        return query({ ...args, data: { deletedAt: new Date() } } as any);
      },
      async deleteMany({ args, query }) {
        return query({
          ...args,
          data: { deletedAt: new Date() },
        } as any);
      },
      // Filter soft-deleted records
      async findUnique({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        } as any);
      },
      async findFirst({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        });
      },
      async findMany({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        });
      },
    },
    communityThread: {
      async delete({ args, query }) {
        return query({ ...args, data: { deletedAt: new Date() } } as any);
      },
      async deleteMany({ args, query }) {
        return query({
          ...args,
          data: { deletedAt: new Date() },
        } as any);
      },
      async findUnique({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        } as any);
      },
      async findFirst({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        });
      },
      async findMany({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        });
      },
    },
    communityReply: {
      async delete({ args, query }) {
        return query({ ...args, data: { deletedAt: new Date() } } as any);
      },
      async deleteMany({ args, query }) {
        return query({
          ...args,
          data: { deletedAt: new Date() },
        } as any);
      },
      async findUnique({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        } as any);
      },
      async findFirst({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        });
      },
      async findMany({ args, query }) {
        return query({
          ...args,
          where: { ...args.where, deletedAt: null },
        });
      },
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

export default prisma;
