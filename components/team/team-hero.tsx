import { SportTag } from "@/components/sport-tag";
import type { Sport } from "@/lib/utils";

interface TeamHeroProps {
  name: string;
  sport: Sport;
  city: string | null;
  classification: string | null;
  conference: string | null;
  record: string | null; // "12-3" or null
  rank: number | null;
}

const sportGradientBar: Record<Sport, string> = {
  basketball: "bg-basketball",
  football: "bg-football",
  lacrosse: "bg-lacrosse",
};

export function TeamHero({
  name,
  sport,
  city,
  classification,
  conference,
  record,
  rank,
}: TeamHeroProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative w-full overflow-hidden bg-[#1D1A10] carbon-fiber-subtle">
      {/* Faded school initial watermark */}
      <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-16 pointer-events-none select-none">
        <span className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-display font-extrabold text-white/[0.04] leading-none">
          {initial}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 py-10 md:py-14 lg:py-16">
        <div className="flex flex-col gap-4">
          <SportTag sport={sport} />

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight">
            {name}
          </h1>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            {city && <span>{city}</span>}
            {city && classification && (
              <span className="text-white/30">·</span>
            )}
            {classification && <span>{classification}</span>}
            {(city || classification) && conference && (
              <span className="text-white/30">·</span>
            )}
            {conference && <span>{conference}</span>}
          </div>

          {/* Record + Ranking */}
          <div className="flex items-center gap-4 mt-1">
            <span className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-spotlight-gold">
              {record ?? "—"}
            </span>
            {rank && (
              <span
                className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide text-white ${sportGradientBar[sport]}`}
              >
                #{rank} in NC
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sport-specific gradient accent bar */}
      <div className={`h-[3px] w-full ${sportGradientBar[sport]}`} />
    </div>
  );
}
