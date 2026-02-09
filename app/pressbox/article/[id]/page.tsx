import { redirect } from 'next/navigation';
import { ArticleEditor } from '@/components/pressbox/article-editor';
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

async function getArticle(id: string, token: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pressbox/article?id=${id}`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.article;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuthUser();
  const { id } = await params;

  if (!auth) {
    redirect('/pressbox/login?redirect=/pressbox');
  }

  const article = await getArticle(id, auth.token);

  if (!article) {
    redirect('/pressbox');
  }

  return <ArticleEditor article={article} token={auth.token} />;
}
