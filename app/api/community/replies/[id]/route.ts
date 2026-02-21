import { prisma } from '@/lib/prisma';
import { requireCommunityUser } from '@/lib/community-auth';
import { z } from 'zod';

const AUTHOR_SELECT = {
  id: true,
  name: true,
  displayName: true,
  role: true,
};

const EditReplySchema = z.object({
  body: z.string().min(1, 'Reply cannot be empty').max(10000),
});

/**
 * PATCH /api/community/replies/[id]
 * Edit reply body. Author only.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireCommunityUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  const reply = await prisma.communityReply.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!reply) {
    return Response.json({ error: 'Reply not found' }, { status: 404 });
  }

  if (reply.authorId !== user!.id) {
    return Response.json({ error: 'Not authorized to edit this reply' }, { status: 403 });
  }

  try {
    const json = await request.json();
    const { body } = EditReplySchema.parse(json);

    const updated = await prisma.communityReply.update({
      where: { id },
      data: { body, editedAt: new Date() },
      include: {
        author: { select: AUTHOR_SELECT },
      },
    });

    return Response.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: err.issues }, { status: 400 });
    }
    console.error('Edit reply error:', err);
    return Response.json({ error: 'Failed to edit reply' }, { status: 500 });
  }
}

/**
 * DELETE /api/community/replies/[id]
 * Soft delete reply. Author or admin. Decrements thread postCount.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireCommunityUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  const reply = await prisma.communityReply.findUnique({
    where: { id },
    select: { authorId: true, threadId: true },
  });

  if (!reply) {
    return Response.json({ error: 'Reply not found' }, { status: 404 });
  }

  if (reply.authorId !== user!.id && user!.role !== 'ADMIN') {
    return Response.json({ error: 'Not authorized to delete this reply' }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.communityReply.delete({ where: { id } });
    await tx.communityThread.update({
      where: { id: reply.threadId },
      data: { postCount: { decrement: 1 } },
    });
  });

  return Response.json({ success: true });
}
