import { compileRoute, route, type CompiledRoute } from "./content";
import type { ContentFile } from "./types";

/** DEV-only fourweek pack. Never defaultAllow / never 0.5.0 player load. */
export const FOURWEEK_MINI_PATH = "content/CONTENT-fourweek-mini-0.5.0.json";
export const FOURWEEK_WEEK_PATHS = [
  "content/CONTENT-w2-tug-draft.json",
  "content/CONTENT-w3-edge-draft.json",
  "content/CONTENT-w4-close-draft.json",
] as const;

export const CLIMAX_WEBP_PATHS = [
  "public/assets/scenes/w2/n_w2_almost_kiss.webp",
  "public/assets/scenes/w2/n_w2_door_gap.webp",
  "public/assets/scenes/w3/n_w3_door_lock_hand.webp",
  "public/assets/scenes/w3/n_w3_sleepover_edge.webp",
  "public/assets/scenes/w3/n_w3_vanessa_dm.webp",
  "public/assets/scenes/w4/n_w4_morning_light.webp",
] as const;

export function isFourweekPack(pack?: string | null): boolean {
  const value = (pack ?? "").trim().toLowerCase();
  return (
    value === "fourweek" ||
    value === "fourweek-mini" ||
    value === "0.5.0" ||
    value === "content-fourweek"
  );
}

/** Compile a DEV pack. Never assertDefaultLoad. */
export function compileDevPack(file: ContentFile): CompiledRoute {
  return compileRoute(file);
}

export function resolvePlayRoute(
  pack: string | null | undefined,
  fourweek: ContentFile | null,
): CompiledRoute | "missing-fourweek" {
  if (!isFourweekPack(pack)) return route;
  if (!fourweek) return "missing-fourweek";
  return compileDevPack(fourweek);
}
