import { prisma } from '@/lib/prisma';
import { requireBoardUser } from '@/lib/board-auth';

const AUTHOR_SELECT = { id: true, name: true, role: true, schoolName: true };

/**
 * GET /api/board/posts?limit=20&cursor=<id>
 * List posts newest-first with author + replies. Cursor pagination.
 */
export async function GET(request: Request) {
  const { user, error } = await requireBoardUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);
  const cursor = url.searchParams.get('cursor');

  const posts = await prisma.boardPost.findMany({
    take: limit + 1, // fetch one extra to detect "has more"
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: AUTHOR_SELECT },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: AUTHOR_SELECT } },
      },
    },
  });

  const hasMore = posts.length > limit;
  const data = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return Response.json({ data, nextCursor });
}

/**
 * POST /api/board/posts
 * Create a new post. Body: { body: string }
 */
export async function POST(request: Request) {
  const { user, error } = await requireBoardUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  const json = await request.json();
  const body = typeof json.body === 'string' ? json.body.trim() : '';

  if (!body || body.length > 2000) {
    return Response.json(
      { error: 'Body is required and must be 1-2000 characters' },
      { status: 400 }
    );
  }

  const post = await prisma.boardPost.create({
    data: { authorId: user!.id, body },
    include: {
      author: { select: AUTHOR_SELECT },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: AUTHOR_SELECT } },
      },
    },
  });

  return Response.json({ data: post }, { status: 201 });
}
