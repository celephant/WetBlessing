"use client";

import { useEffect, useState } from "react";
import { artAlt, assetUrl } from "@/lib/tokens";

type SceneArtProps = {
  assetId?: string;
  artCue?: string | { summary?: string };
  nodeId: string;
};

export function SceneArt({ assetId, artCue, nodeId }: SceneArtProps) {
  const src = assetUrl(assetId);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const alt = artAlt(artCue, nodeId);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-void">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_rgba(255,75,107,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(94,224,192,0.12),_transparent_50%)]">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-mute">
            placeholder
          </p>
          <p className="mt-2 max-w-sm px-6 text-center font-ui text-sm text-paper/70">
            {alt}
          </p>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-void via-void/25 to-black/20" />
    </div>
  );
}
