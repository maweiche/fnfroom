import { cn } from "@/lib/utils";
import type { Sport } from "@/lib/sanity.types";

interface PlayerOffersProps {
  offers: string[];
  sport: Sport;
}

export function PlayerOffers({ offers, sport }: PlayerOffersProps) {
  // Sport-specific border colors
  const borderColors = {
    basketball: "border-basketball/50 hover:border-basketball hover:bg-basketball/10",
    football: "border-football/50 hover:border-football hover:bg-football/10",
    lacrosse: "border-lacrosse/50 hover:border-lacrosse hover:bg-lacrosse/10",
  };

  return (
    <div className="p-4 md:p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-bold mb-4">College Offers & Interest</h3>
      <div className="flex flex-wrap gap-2">
        {offers.map((offer) => (
          <span
            key={offer}
            className={cn(
              "px-3 py-1 border-2 rounded-full text-sm font-medium transition-colors duration-150",
              borderColors[sport]
            )}
          >
            {offer}
          </span>
        ))}
      </div>
    </div>
  );
}
