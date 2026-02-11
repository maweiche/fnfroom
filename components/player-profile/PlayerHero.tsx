import Image from "next/image";
import { SportTag } from "@/components/sport-tag";
import { urlFor } from "@/sanity/lib/image";
import type { Player } from "@/lib/sanity.types";
import { cn } from "@/lib/utils";

interface PlayerHeroProps {
  player: Player;
}

export function PlayerHero({ player }: PlayerHeroProps) {
  const imageUrl = player.photo
    ? urlFor(player.photo).width(1200).height(900).url()
    : null;

  // Sport-specific gradient backgrounds
  const gradients = {
    basketball: "from-basketball/20 to-basketball/5",
    football: "from-football/20 to-football/5",
    lacrosse: "from-lacrosse/20 to-lacrosse/5",
  };

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-slate-900">
      {/* Background Image or Gradient */}
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={player.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Sport-specific gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"
            )}
          />
        </>
      ) : (
        <>
          {/* Fallback: Sport gradient + Jersey Number */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              gradients[player.sport]
            )}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {player.jerseyNumber && (
              <span className="text-[15rem] md:text-[20rem] lg:text-[25rem] font-bold text-white/10 font-mono">
                {player.jerseyNumber}
              </span>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 pb-6 md:pb-8 lg:pb-12">
          {/* Sport Tag + Featured Badge */}
          <div className="flex items-center gap-3 mb-4">
            <SportTag sport={player.sport} />
            {player.featured && (
              <span className="px-3 py-1 bg-primary text-primary-dark text-xs font-medium rounded uppercase tracking-wide">
                Featured
              </span>
            )}
          </div>

          {/* Player Name */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
            {player.name}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-sm md:text-base text-white/90 font-medium">
            <span>Class of {player.gradYear}</span>
            <span className="text-white/50">•</span>
            <span>{player.position}</span>
            {player.height && (
              <>
                <span className="text-white/50">•</span>
                <span className="font-mono">{player.height}</span>
              </>
            )}
            {player.weight && (
              <>
                <span className="text-white/50">•</span>
                <span className="font-mono">{player.weight}</span>
              </>
            )}
          </div>

          {/* School Name */}
          <p className="text-lg md:text-xl text-white/80 mt-2">{player.school}</p>
        </div>
      </div>
    </div>
  );
}
