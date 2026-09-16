"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FUNNEL_HOTSPOTS,
  FUNNEL_NOTICE,
  FUNNEL_ZONE_LINES,
  type FunnelZone,
  funnelZoneForNode,
  isFunnelFlashNode,
  isFunnelLookNode,
  isFunnelPoolNode,
} from "@/lib/funnel";
import type { Beat, Flags } from "@/lib/types";

type FunnelHudProps = {
  nodeId: string;
  beatIndex: number;
  flags: Flags;
  looked: FunnelZone | null;
  onLook: (zone: FunnelZone) => void;
};

export function FunnelHud({
  nodeId,
  beatIndex,
  flags,
  looked,
  onLook,
}: FunnelHudProps) {
  const [portrait, setPortrait] = useState(false);
  const [flash, setFlash] = useState(false);
  const pool = isFunnelPoolNode(nodeId);
  const look = isFunnelLookNode(nodeId);
  const forced = funnelZoneForNode(nodeId, flags);
  const active = looked ?? forced;
  const showClock = pool || nodeId.startsWith("n_funnel_06");
  const showNotice = nodeId === "n_funnel_09" || nodeId === "n_funnel_10";

  useEffect(() => {
    const media = window.matchMedia("(orientation: portrait)");
    const sync = () => setPortrait(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isFunnelFlashNode(nodeId, beatIndex)) {
      setFlash(false);
      return;
    }
    setFlash(true);
    const cut = window.setTimeout(() => setFlash(false), 70);
    return () => window.clearTimeout(cut);
  }, [nodeId, beatIndex]);

  const boxes = portrait ? FUNNEL_HOTSPOTS.portrait : FUNNEL_HOTSPOTS.landscape;
  const zones = useMemo(
    () => Object.entries(boxes) as Array<[FunnelZone, (typeof boxes)[FunnelZone]]>,
    [boxes],
  );

  if (!pool && !look && !showClock && !showNotice && !nodeId.startsWith("n_funnel_06")) {
    return flash ? <FlashVeil /> : null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[4]"
      style={{ bottom: "var(--night-pass-dock, 28%)" }}
      data-funnel-hud={nodeId}
      data-funnel-zone={active ?? ""}
    >
      {showClock ? (
        <p
          className="pointer-events-none absolute left-1/2 top-14 z-[5] -translate-x-1/2 font-display text-[11px] tracking-[0.28em] text-paper/80"
          data-funnel-clock=""
        >
          23:47
        </p>
      ) : null}

      {pool || look ? (
        <div className="absolute inset-0" data-funnel-zones={look ? "hot" : "scan"}>
          {zones.map(([zone, box]) => (
            <button
              key={zone}
              type="button"
              disabled={!look}
              onClick={() => onLook(zone)}
              style={box}
              className={`funnel-hotspot absolute rounded-chip border ${
                look ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
              } ${
                active === zone
                  ? "funnel-hotspot-on border-paper/80"
                  : "border-paper/25"
              } ${nodeId === "n_funnel_01" ? "funnel-hotspot-scan" : ""}`}
              data-funnel-hotspot={zone}
              aria-label={FUNNEL_ZONE_LINES[zone].text}
            />
          ))}
        </div>
      ) : null}

      {showNotice ? (
        <p
          className="pointer-events-none absolute inset-x-0 bottom-3 mx-auto max-w-dialog px-4 text-center font-ui text-[13px] text-gold"
          data-funnel-notice=""
        >
          {FUNNEL_NOTICE}
        </p>
      ) : null}

      {flash ? <FlashVeil /> : null}
      {flash ? (
        <span
          className="pointer-events-none absolute right-[18%] top-[22%] z-[6] font-display text-sm text-paper"
          data-funnel-sfx=""
        >
          咔
        </span>
      ) : null}
    </div>
  );
}

function FlashVeil() {
  return (
    <div
      className="funnel-flash pointer-events-none absolute inset-0 z-[6]"
      data-funnel-flash=""
    />
  );
}

export function funnelLookBeat(looked: FunnelZone | null): Beat | null {
  if (!looked) return null;
  return FUNNEL_ZONE_LINES[looked];
}
