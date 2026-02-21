import { prisma } from '@/lib/prisma';
import { requireCommunityUser } from '@/lib/community-auth';
import { z } from 'zod';

const AUTHOR_SELECT = {
  id: true,
  name: true,
  displayName: true,
  role: true,
};

/**
 * GET /api/community/threads?category=<slug>&cursor=<id>&limit=20
 * Paginated threads by category. Pinned threads first, then by lastPostAt desc.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const categorySlug = url.searchParams.get('category');
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);
  const cursor = url.searchParams.get('cursor');

  if (!categorySlug) {
    return Response.json({ error: 'category query param is required' }, { status: 400 });
  }

  const category = await prisma.communityCategory.findUnique({
    where: { slug: categorySlug },
    select: { id: true, name: true, slug: true, sport: true, description: true },
  });

  if (!category) {
    return Response.json({ error: 'Category not found' }, { status: 404 });
  }

  const threads = await prisma.communityThread.findMany({
    where: { categoryId: category.id },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ pinned: 'desc' }, { lastPostAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: { select: AUTHOR_SELECT },
    },
  });

  const hasMore = threads.length > limit;
  const data = hasMore ? threads.slice(0, limit) : threads;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return Response.json({ data, category, nextCursor });
}

const CreateThreadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  body: z.string().min(10, 'Body must be at least 10 characters').max(10000),
  categoryId: z.string().uuid(),
});

/**
 * POST /api/community/threads
 * Create a new thread. Requires auth.
 */
export async function POST(request: Request) {
  const { user, error } = await requireCommunityUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  try {
    const body = await request.json();
    const { title, body: threadBody, categoryId } = CreateThreadSchema.parse(body);

    // Verify category exists
    const category = await prisma.communityCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, slug: true },
    });

    if (!category) {
      return Response.json({ error: 'Category not found' }, { status: 404 });
    }

    const thread = await prisma.communityThread.create({
      data: {
        title,
        body: threadBody,
        authorId: user!.id,
        categoryId,
        lastPostAt: new Date(),
        lastPostBy: user!.id,
      },
      include: {
        author: { select: AUTHOR_SELECT },
        category: { select: { slug: true } },
      },
    });

    return Response.json({ data: thread }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: err.issues }, { status: 400 });
    }
    console.error('Create thread error:', err);
    return Response.json({ error: 'Failed to create thread' }, { status: 500 });
  }
}
