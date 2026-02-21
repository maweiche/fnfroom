import { prisma } from '@/lib/prisma';
import { requireBoardUser } from '@/lib/board-auth';

const AUTHOR_SELECT = { id: true, name: true, role: true, schoolName: true };

/**
 * POST /api/board/posts/[id]/replies
 * Reply to a post. Body: { body: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireBoardUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  const { id: postId } = await params;

  const json = await request.json();
  const body = typeof json.body === 'string' ? json.body.trim() : '';

  if (!body || body.length > 2000) {
    return Response.json(
      { error: 'Body is required and must be 1-2000 characters' },
      { status: 400 }
    );
  }

  // Verify post exists
  const post = await prisma.boardPost.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return Response.json({ error: 'Post not found' }, { status: 404 });
  }

  const reply = await prisma.boardReply.create({
    data: { postId, authorId: user!.id, body },
    include: { author: { select: AUTHOR_SELECT } },
  });

  return Response.json({ data: reply }, { status: 201 });
}
