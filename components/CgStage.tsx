"use client";

import { useEffect, useState } from "react";
import { artCueSummary, cgSrc } from "@/lib/assets";
import type { StoryNode } from "@/engine/types";

export function CgStage({ node }: { node: StoryNode | null }) {
  const src = node ? cgSrc(node) : null;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showArt = Boolean(src) && !failed;
  const placeholder = node ? artCueSummary(node) : "WetBlessing";

  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--wb-void)]" style={{ zIndex: 0 }}>
      {showArt ? (
        // Static CG + light motion. Faces stay in the upper frame; bottom 28% is UI.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src!}
          alt=""
          className="wb-kenburns pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_28%]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#2a2438_0%,_#07080c_70%)]" />
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(7,8,12,0.15) 0%, rgba(7,8,12,0.08) 48%, rgba(7,8,12,0.72) 72%, rgba(7,8,12,0.92) 100%)",
        }}
      />
      {!showArt && (
        <p className="absolute left-4 top-16 max-w-sm text-xs leading-5 text-[var(--wb-mute)]">
          {placeholder}
        </p>
      )}
    </div>
  );
}
