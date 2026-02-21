import { prisma } from '@/lib/prisma';

/**
 * GET /api/community/categories
 * List all categories with thread counts.
 */
export async function GET() {
  const categories = await prisma.communityCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { threads: { where: { deletedAt: null } } },
      },
    },
  });

  const data = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    sport: cat.sport,
    sortOrder: cat.sortOrder,
    threadCount: cat._count.threads,
  }));

  return Response.json({ data });
}
