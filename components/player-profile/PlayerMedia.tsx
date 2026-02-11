import MuxPlayer from "@mux/mux-player-react";
import type { Video } from "@/lib/sanity.types";

interface PlayerMediaProps {
  highlightVideo: Video;
}

export function PlayerMedia({ highlightVideo }: PlayerMediaProps) {
  const playbackId = highlightVideo.video?.asset?.playbackId;

  if (!playbackId) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Highlight Video</h2>
      <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
        <MuxPlayer
          playbackId={playbackId}
          metadata={{
            video_title: highlightVideo.title,
            video_id: highlightVideo._id,
          }}
          streamType="on-demand"
          className="w-full h-full"
        />
      </div>
      {highlightVideo.description && (
        <p className="mt-4 text-sm text-secondary">{highlightVideo.description}</p>
      )}
    </section>
  );
}
