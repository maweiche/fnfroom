import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/pressbox/dashboard';
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

async function getConversations(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pressbox/conversation`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.conversations || [];
}

async function getArticles(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pressbox/article`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.articles || [];
}

export default async function PressBoxPage() {
  const auth = await getAuthUser();

  if (!auth) {
    redirect('/pressbox/login?redirect=/pressbox');
  }

  const [conversations, articles] = await Promise.all([
    getConversations(auth.token),
    getArticles(auth.token),
  ]);

  return <Dashboard conversations={conversations} articles={articles} token={auth.token} />;
}
