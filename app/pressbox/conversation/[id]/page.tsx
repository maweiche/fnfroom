import { redirect } from 'next/navigation';
import { ConversationInterface } from '@/components/pressbox/conversation-interface';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const user = await getUserFromToken(token);
  if (!user || (user.role !== 'WRITER' && user.role !== 'ADMIN')) {
    return null;
  }

  return { user, token };
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuthUser();
  const { id } = await params;

  if (!auth) {
    redirect('/pressbox/login?redirect=/pressbox');
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!conversation) {
    redirect('/pressbox');
  }

  return (
    <ConversationInterface
      conversationId={conversation.id}
      initialTranscript={(conversation.transcript as any[]) || []}
      gameInfo={{
        homeTeam: conversation.homeTeam,
        awayTeam: conversation.awayTeam,
        sport: conversation.sport,
      }}
      token={auth.token}
    />
  );
}
