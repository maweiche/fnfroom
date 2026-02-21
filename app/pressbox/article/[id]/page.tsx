import { redirect } from 'next/navigation';
import { ArticleEditor } from '@/components/pressbox/article-editor';
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

  const article = await prisma.article.findFirst({
    where: { id, userId: auth.user.id },
    include: { conversation: true },
  });

  if (!article) {
    redirect('/pressbox');
  }

  return <ArticleEditor article={article} token={auth.token} />;
}
