import { tokens } from "./tokens";
import type { ArtCue } from "./types";

/** Same full asset/composition may last at most this many dialogue lines. */
export const DENSITY_MAX_SAME_COMPOSITION = 2;

/** Same-asset camera-only cut. Tokens v1.1.1: default 260, max 280. */
export const SOFT_ZOOM_CROP_MS = Math.min(
  tokens.transitions.softZoomCrop.msDefault,
  tokens.transitions.softZoomCrop.msMax,
);

export type IntimateBeatId =
  | "near_miss"
  | "door_lock"
  | "sleepover_edge"
  | "vanessa_close"
  | "morning_light";

export const INTIMATE_BEAT_IDS: IntimateBeatId[] = [
  "near_miss",
  "door_lock",
  "sleepover_edge",
  "vanessa_close",
  "morning_light",
];

const INTIMATE_BEAT_PATTERNS: Record<IntimateBeatId, RegExp> = {
  near_miss:
    /almost[_-]?kiss|kiss[_-]?meet|near[_-]?miss|几乎[^。]{0,16}吻|再近半寸就是吻|唇碰上|吻上/i,
  door_lock: /door[_-]?lock/i,
  sleepover_edge: /sleepover[_-]?edge/i,
  vanessa_close: /vanessa[_-]?(dm|close)|n_pay_03_vanessa/i,
  morning_light: /morning[_-]?light/i,
};

function artCueHay(artCue?: ArtCue): string {
  if (!artCue) return "";
  if (typeof artCue === "string") return artCue;
  return [artCue.summary, artCue.scene, artCue.shot, artCue.note]
    .filter(Boolean)
    .join(" ");
}

export function intimateHaystack(input: {
  nodeId?: string;
  assetId?: string;
  artCue?: ArtCue;
  text?: string;
}): string {
  return [input.nodeId, input.assetId, artCueHay(input.artCue), input.text]
    .filter(Boolean)
    .join(" ");
}

export function detectIntimateBeat(input: {
  nodeId?: string;
  assetId?: string;
  artCue?: ArtCue;
  text?: string;
}): IntimateBeatId | null {
  const hay = intimateHaystack(input);
  for (const id of INTIMATE_BEAT_IDS) {
    if (INTIMATE_BEAT_PATTERNS[id].test(hay)) return id;
  }
  return null;
}

/** 0-based line on the current asset. 3rd line = index 2. */
export function mustCycleCrop(sameAssetLineIndex: number): boolean {
  return sameAssetLineIndex >= DENSITY_MAX_SAME_COMPOSITION;
}

export function densityLineChanged(sameAssetLineIndex: number): boolean {
  return sameAssetLineIndex >= 1;
}

export function intimateBeatSpec(beatId: IntimateBeatId | null) {
  if (!beatId) return null;
  const table = tokens.intimateBeats;
  if (beatId === "near_miss") return table.near_miss;
  if (beatId === "door_lock") return table.door_lock;
  if (beatId === "sleepover_edge") return table.sleepover_edge;
  if (beatId === "vanessa_close") return table.vanessa_close;
  if (beatId === "morning_light") return table.morning_light;
  return null;
}

export function intimateFallbackCamera(
  beatId: IntimateBeatId | null,
): string | undefined {
  return intimateBeatSpec(beatId)?.camera;
}

/** Intimate asset-id change: fade-only is forbidden. Honor soft-zoom / dip. */
export function intimateAllowsFade(): boolean {
  return !tokens.intimateBeats.forbidFadeOnly;
}

export function intimateBeatGaps(
  nodes: Array<{
    nodeId?: string;
    assetId?: string;
    artCue?: ArtCue;
    text?: string;
    transition?: string;
    fx?: string;
    lines?: Array<{ transition?: string; fx?: string }>;
  }>,
): string[] {
  const gaps: string[] = [];
  for (const node of nodes) {
    const beat = detectIntimateBeat({
      nodeId: node.nodeId,
      assetId: node.assetId,
      artCue: node.artCue,
      text: node.text,
    });
    if (!beat) continue;
    const hasTransition =
      Boolean(node.transition) ||
      Boolean(node.lines?.some((line) => line.transition));
    const hasFx =
      Boolean(node.fx) || Boolean(node.lines?.some((line) => line.fx));
    if (!hasTransition) {
      gaps.push(`${node.nodeId ?? "?"}: missing transition (${beat})`);
    }
    if (!hasFx) {
      gaps.push(`${node.nodeId ?? "?"}: missing fx (${beat})`);
    }
  }
  return gaps;
}

export function isIntimateForcedCut(
  name: string | null | undefined,
): name is "soft-zoom" | "dip-to-black" | "soft-zoom-crop" {
  return (
    name === "soft-zoom" ||
    name === "dip-to-black" ||
    name === "soft-zoom-crop"
  );
}
