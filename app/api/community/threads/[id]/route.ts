import { prisma } from '@/lib/prisma';
import { requireCommunityUser, optionalCommunityUser } from '@/lib/community-auth';

const AUTHOR_SELECT = {
  id: true,
  name: true,
  displayName: true,
  role: true,
};

/**
 * GET /api/community/threads/[id]?replyCursor=<id>&replyLimit=30
 * Thread detail with paginated replies. Increments view count.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const replyLimit = Math.min(Number(url.searchParams.get('replyLimit')) || 30, 100);
  const replyCursor = url.searchParams.get('replyCursor');

  const thread = await prisma.communityThread.findUnique({
    where: { id },
    include: {
      author: { select: AUTHOR_SELECT },
      category: { select: { id: true, name: true, slug: true, sport: true } },
    },
  });

  if (!thread) {
    return Response.json({ error: 'Thread not found' }, { status: 404 });
  }

  // Increment view count (fire-and-forget)
  prisma.$executeRawUnsafe(
    `UPDATE community_threads SET view_count = view_count + 1 WHERE id = $1::uuid`,
    id
  ).catch(() => {});

  // Fetch replies with pagination
  const replies = await prisma.communityReply.findMany({
    where: { threadId: id },
    take: replyLimit + 1,
    ...(replyCursor ? { cursor: { id: replyCursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'asc' },
    include: {
      author: { select: AUTHOR_SELECT },
    },
  });

  const hasMoreReplies = replies.length > replyLimit;
  const replyData = hasMoreReplies ? replies.slice(0, replyLimit) : replies;
  const nextReplyCursor = hasMoreReplies ? replyData[replyData.length - 1].id : null;

  return Response.json({
    data: thread,
    replies: replyData,
    nextReplyCursor,
  });
}

/**
 * PATCH /api/community/threads/[id]
 * Admin-only: pin/lock thread.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireCommunityUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  if (user!.role !== 'ADMIN') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const body = await request.json();
  const updateData: Record<string, any> = {};

  if (typeof body.pinned === 'boolean') updateData.pinned = body.pinned;
  if (typeof body.locked === 'boolean') updateData.locked = body.locked;

  if (Object.keys(updateData).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const thread = await prisma.communityThread.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: AUTHOR_SELECT },
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  return Response.json({ data: thread });
}

/**
 * DELETE /api/community/threads/[id]
 * Soft delete. Author or admin only.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error } = await requireCommunityUser(request);
  if (error) return Response.json({ error: error.message }, { status: error.status });

  const thread = await prisma.communityThread.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!thread) {
    return Response.json({ error: 'Thread not found' }, { status: 404 });
  }

  if (thread.authorId !== user!.id && user!.role !== 'ADMIN') {
    return Response.json({ error: 'Not authorized to delete this thread' }, { status: 403 });
  }

  await prisma.communityThread.delete({ where: { id } });

  return Response.json({ success: true });
}
