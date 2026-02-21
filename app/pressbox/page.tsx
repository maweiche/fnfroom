import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/pressbox/dashboard';
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

export default async function PressBoxPage() {
  const auth = await getAuthUser();

  if (!auth) {
    redirect('/pressbox/login?redirect=/pressbox');
  }

  const [conversations, articles] = await Promise.all([
    prisma.conversation.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.article.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        conversation: {
          select: {
            homeTeam: true,
            awayTeam: true,
            sport: true,
            gameDate: true,
          },
        },
      },
    }),
  ]);

  // Serialize dates for client component compatibility
  return (
    <Dashboard
      conversations={JSON.parse(JSON.stringify(conversations))}
      articles={JSON.parse(JSON.stringify(articles))}
      token={auth.token}
    />
  );
}
