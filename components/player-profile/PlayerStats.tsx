import type { PlayerStats as PlayerStatsType, Sport } from "@/lib/sanity.types";

interface PlayerStatsProps {
  stats: PlayerStatsType[];
  sport: Sport;
}

export function PlayerStats({ stats, sport }: PlayerStatsProps) {
  // Sport-specific stat configurations
  const statConfig = {
    basketball: {
      columns: [
        { key: "ppg", label: "PPG", format: (val: number) => val.toFixed(1) },
        { key: "rpg", label: "RPG", format: (val: number) => val.toFixed(1) },
        { key: "apg", label: "APG", format: (val: number) => val.toFixed(1) },
      ],
    },
    football: {
      columns: [
        {
          key: "passingYards",
          label: "Pass Yds",
          format: (val: number) => val.toLocaleString(),
        },
        {
          key: "rushingYards",
          label: "Rush Yds",
          format: (val: number) => val.toLocaleString(),
        },
        {
          key: "touchdowns",
          label: "TDs",
          format: (val: number) => val.toString(),
        },
      ],
    },
    lacrosse: {
      columns: [
        { key: "goals", label: "Goals", format: (val: number) => val.toString() },
        {
          key: "assists",
          label: "Assists",
          format: (val: number) => val.toString(),
        },
        {
          key: "groundBalls",
          label: "GB",
          format: (val: number) => val.toString(),
        },
      ],
    },
  };

  const config = statConfig[sport];

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Season Statistics</h2>

      {/* Mobile: Stacked Cards */}
      <div className="md:hidden space-y-4">
        {stats.map((season) => (
          <div
            key={season.season}
            className="p-4 bg-card border border-border rounded-lg"
          >
            <h3 className="font-bold text-lg mb-3">{season.season}</h3>
            <dl className="space-y-2">
              {config.columns.map((col) => {
                const value = season.statsData[
                  col.key as keyof typeof season.statsData
                ] as number | undefined;
                if (value === undefined) return null;

                return (
                  <div key={col.key} className="flex justify-between items-center">
                    <dt className="text-sm text-muted">{col.label}</dt>
                    <dd className="font-mono font-semibold text-lg tabular-nums">
                      {col.format(value)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>

      {/* Desktop: Dense Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted">
                Season
              </th>
              {config.columns.map((col) => (
                <th
                  key={col.key}
                  className="text-right py-3 px-4 text-sm font-semibold text-muted"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((season) => (
              <tr
                key={season.season}
                className="border-b border-border hover:bg-card/50 transition-colors"
              >
                <td className="py-3 px-4 font-semibold">{season.season}</td>
                {config.columns.map((col) => {
                  const value = season.statsData[
                    col.key as keyof typeof season.statsData
                  ] as number | undefined;

                  return (
                    <td
                      key={col.key}
                      className="py-3 px-4 text-right font-mono font-semibold tabular-nums"
                    >
                      {value !== undefined ? col.format(value) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
