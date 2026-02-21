import { prisma } from '@/lib/prisma';
import { requireCommunityUser } from '@/lib/community-auth';
import { z } from 'zod';

const AUTHOR_SELECT = {
  id: true,
  name: true,
  displayName: true,
  role: true,
};

const CreateReplySchema = z.object({
  body: z.string().min(1, 'Reply cannot be empty').max(10000),
});

/**
 * POST /api/community/threads/[id]/replies
 * Reply to a thread. Requires auth. Checks thread is not locked.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await params;
  const { user, error } = await requireCommunityUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  try {
    const json = await request.json();
    const { body } = CreateReplySchema.parse(json);

    // Check thread exists and is not locked
    const thread = await prisma.communityThread.findUnique({
      where: { id: threadId },
      select: { id: true, locked: true },
    });

    if (!thread) {
      return Response.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (thread.locked) {
      return Response.json({ error: 'This thread is locked' }, { status: 403 });
    }

    // Create reply and update thread counts in a transaction
    const reply = await prisma.$transaction(async (tx) => {
      const newReply = await tx.communityReply.create({
        data: {
          body,
          authorId: user!.id,
          threadId,
        },
        include: {
          author: { select: AUTHOR_SELECT },
        },
      });

      await tx.communityThread.update({
        where: { id: threadId },
        data: {
          postCount: { increment: 1 },
          lastPostAt: new Date(),
          lastPostBy: user!.id,
        },
      });

      return newReply;
    });

    return Response.json({ data: reply }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: err.issues }, { status: 400 });
    }
    console.error('Create reply error:', err);
    return Response.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}
