import { redirect } from 'next/navigation';
import { ConversationInterface } from '@/components/pressbox/conversation-interface';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/lib/auth';

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

async function getConversation(id: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pressbox/conversation?id=${id}`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.conversation;
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuthUser();
  const { id } = await params;

  if (!auth) {
    redirect('/login?redirect=/pressbox');
  }

  const conversation = await getConversation(id, auth.token);

  if (!conversation) {
    redirect('/pressbox');
  }

  return (
    <ConversationInterface
      conversationId={conversation.id}
      initialTranscript={conversation.transcript || []}
      gameInfo={{
        homeTeam: conversation.homeTeam,
        awayTeam: conversation.awayTeam,
        sport: conversation.sport,
      }}
    />
  );
}
