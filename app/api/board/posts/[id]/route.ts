import { prisma } from '@/lib/prisma';
import { requireBoardUser } from '@/lib/board-auth';

/**
 * DELETE /api/board/posts/[id]
 * Delete a post. Only the author or an ADMIN can delete.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireBoardUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  const { id } = await params;

  const post = await prisma.boardPost.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!post) {
    return Response.json({ error: 'Post not found' }, { status: 404 });
  }

  if (post.authorId !== user!.id && user!.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.boardPost.delete({ where: { id } });

  return Response.json({ success: true });
}
