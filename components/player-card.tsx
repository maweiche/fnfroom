import Link from "next/link";
import Image from "next/image";
import { SportTag } from "./sport-tag";
import { urlFor } from "@/sanity/lib/image";
import type { Player } from "@/lib/sanity.types";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const imageUrl = player.photo
    ? urlFor(player.photo).width(400).height(400).url()
    : null;

  return (
    <Link
      href={`/recruiting/${player.slug.current}`}
      className="group block"
    >
      <article className="overflow-hidden rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow duration-200 h-full">
        {/* Player Photo */}
        <div className="relative aspect-square bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={player.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute top-2 left-2">
            <SportTag sport={player.sport} />
          </div>
          {player.featured && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-dark text-xs font-medium rounded">
              Featured
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-150">
            {player.name}
          </h3>

          <p className="text-sm text-secondary mb-2">{player.school}</p>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted block">Class</span>
              <span className="font-mono font-semibold">{player.gradYear}</span>
            </div>
            <div>
              <span className="text-muted block">Pos</span>
              <span className="font-semibold">{player.position}</span>
            </div>
            {player.height && (
              <div>
                <span className="text-muted block">Height</span>
                <span className="font-mono font-semibold">{player.height}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
