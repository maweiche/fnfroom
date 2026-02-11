import { PortableTextRenderer } from "@/components/portable-text";

interface PlayerBioProps {
  bio: any[];
  playerName: string;
}

export function PlayerBio({ bio, playerName }: PlayerBioProps) {
  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Scouting Report</h2>
      <div className="prose prose-lg max-w-none">
        <PortableTextRenderer content={bio} />
      </div>
    </section>
  );
}
