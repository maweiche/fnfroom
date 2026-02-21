import { BoardFeed } from "@/components/board/board-feed";

export const metadata = {
  title: "Board — FNFR Admin",
};

export default function AdminBoardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Internal Board
        </h1>
        <p className="text-sm text-muted mt-1">
          Staff updates and coordination
        </p>
      </div>
      <div className="max-w-2xl">
        <BoardFeed />
      </div>
    </div>
  );
}
