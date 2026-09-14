"use client";

import { useEffect, useState } from "react";
import { resolveAssetUrl } from "@/lib/assets";
import { artAlt } from "@/lib/tokens";

type SceneArtProps = {
  assetId?: string;
  artCue?: string | { summary?: string };
  nodeId: string;
};

const PLACEHOLDER_BG =
  "bg-[radial-gradient(ellipse_at_top,_rgba(255,75,107,0.32),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(94,224,192,0.22),_transparent_48%),linear-gradient(180deg,#2a1a28_0%,#161820_52%,#122028_100%)]";

export function SceneArt({ assetId, artCue, nodeId }: SceneArtProps) {
  // Always `assetId` from JSON — never derive `${nodeId}.webp` (paid aliases differ).
  // Missing files remap to a shipped webp so investor play is never a black void.
  const src = resolveAssetUrl(assetId);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const alt = artAlt(artCue, nodeId);
  const showImage = !failed;

  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden ${PLACEHOLDER_BG}`}
      data-scene-art={showImage ? "image" : "placeholder"}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="relative z-[1] flex h-full w-full flex-col items-center justify-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-mint/80">
            placeholder
          </p>
          <p className="mt-2 max-w-sm px-6 text-center font-ui text-sm text-paper/80">
            {alt}
          </p>
        </div>
      )}
      {showImage ? (
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-void via-void/25 to-black/20" />
      ) : null}
    </div>
  );
}
