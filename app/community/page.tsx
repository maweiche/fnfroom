import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquare, Plus } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Community — Friday Night Film Room',
  description: 'Join the conversation about NC high school basketball, football, and lacrosse.',
};

const SPORT_COLORS: Record<string, string> = {
  basketball: 'border-l-[#D97B34]',
  football: 'border-l-[#4c8a5f]',
  lacrosse: 'border-l-[#4a6b9e]',
};

const SPORT_TEXT: Record<string, string> = {
  basketball: 'text-[#D97B34]',
  football: 'text-[#4c8a5f]',
  lacrosse: 'text-[#4a6b9e]',
};

export default async function CommunityPage() {
  const categories = await prisma.communityCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { threads: { where: { deletedAt: null } } },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Community
            </h1>
            <p className="text-sm text-muted mt-1">
              Discuss NC high school sports
            </p>
          </div>
          <Link
            href="/community/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Thread
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const borderColor = cat.sport ? SPORT_COLORS[cat.sport] || 'border-l-primary' : 'border-l-primary';
            const textColor = cat.sport ? SPORT_TEXT[cat.sport] || 'text-primary' : 'text-primary';

            return (
              <Link
                key={cat.id}
                href={`/community/${cat.slug}`}
                className={`block bg-card border border-border rounded-lg p-5 border-l-4 ${borderColor} hover:border-primary/30 transition-colors`}
              >
                <h2 className={`text-lg font-display font-bold ${textColor}`}>
                  {cat.name}
                </h2>
                {cat.description && (
                  <p className="text-sm text-muted mt-1">{cat.description}</p>
                )}
                <div className="flex items-center gap-1 mt-3 text-xs text-muted">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{cat._count.threads} {cat._count.threads === 1 ? 'thread' : 'threads'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
