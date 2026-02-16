interface QuickStat {
  label: string;
  value: string;
}

interface TeamQuickStatsProps {
  record: string | null;
  conferenceRecord: string | null;
  rank: number | null;
  ppg: number | null;
  oppPpg: number | null;
}

function StatCard({ label, value }: QuickStat) {
  return (
    <div className="min-w-[100px] flex-shrink-0 snap-start bg-card border border-border rounded-lg px-4 py-3 shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-1">
        {label}
      </div>
      <div className="text-xl font-mono tabular-nums font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

export function TeamQuickStats({
  record,
  conferenceRecord,
  rank,
  ppg,
  oppPpg,
}: TeamQuickStatsProps) {
  const stats: QuickStat[] = [];

  if (record) stats.push({ label: "Record", value: record });
  if (conferenceRecord) stats.push({ label: "Conference", value: conferenceRecord });
  if (rank) stats.push({ label: "Ranking", value: `#${rank}` });
  if (ppg !== null) stats.push({ label: "PPG", value: ppg.toFixed(1) });
  if (oppPpg !== null) stats.push({ label: "Opp PPG", value: oppPpg.toFixed(1) });

  if (stats.length === 0) return null;

  return (
    <div className="-mt-6 relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
      {/* Mobile: horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:hidden no-scrollbar">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      {/* Desktop: grid */}
      <div className="hidden md:grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 5)}, 1fr)` }}>
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
