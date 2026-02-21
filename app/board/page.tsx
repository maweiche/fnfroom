import { BoardFeed } from "@/components/board/board-feed";

export const metadata = {
  title: "Board — Friday Night Film Room",
};

export default function BoardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Board
          </h1>
          <p className="text-sm text-muted mt-1">
            Internal updates and coordination
          </p>
        </div>
        <BoardFeed />
      </div>
    </div>
  );
}
