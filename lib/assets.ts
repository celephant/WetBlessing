import climaxManifest from "../content/ART-climax-manifest.json";
import { content } from "./content";
import type { ContentFile } from "./types";

export const CLIMAX_ART_STATUS = climaxManifest.status;

const CH01_SCENE_DIR = "assets/scenes/ch01";

/** Scene webps that actually ship under public/. Player must never 404 these lookups. */
export const SHIPPED_CH01_SCENE_WEBPS = [
  "n_see_both",
  "n_conflict",
  "n_sms_auto",
  "n_ch01_first_sub",
  "n_pay_01_catch_b",
  "n_pay_02_ot_a",
  "n_pay_03_vanessa",
  "n_mia_edge_1",
] as const;

const SHIPPED_STEMS = new Set<string>(SHIPPED_CH01_SCENE_WEBPS);

export const DEFAULT_SCENE_FALLBACK = `${CH01_SCENE_DIR}/n_see_both.webp`;

function scenePath(stem: string): string {
  return `${CH01_SCENE_DIR}/${stem}.webp`;
}

function stripLeadingSlash(assetId: string): string {
  return assetId.replace(/^\/+/, "");
}

function stemOf(assetId: string): string {
  return stripLeadingSlash(assetId).split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
}

/**
 * Nearest existing Ch01 webp for a missing stem.
 * n_open / n_jade_desk / n_dodge_* → n_see_both
 * n_with_* → n_mia_edge_1 (Mia) or n_conflict (Jade)
 * missing ch01 stems still fall back; W2–W3 climax and heat/ paths resolve as themselves
 * else → n_see_both
 */
export function fallbackSceneStem(stem: string): string {
  if (stem === "n_open" || stem === "n_jade_desk" || stem.startsWith("n_dodge_")) {
    return "n_see_both";
  }
  if (stem.startsWith("n_with_")) {
    return stem.includes("jade") ? "n_conflict" : "n_mia_edge_1";
  }
  if (stem.startsWith("n_mia_edge_")) {
    return "n_mia_edge_1";
  }
  return "n_see_both";
}

function isClimaxScenePath(assetId: string): boolean {
  const rel = stripLeadingSlash(assetId);
  return (
    rel.includes("/scenes/w2/") ||
    rel.includes("/scenes/w3/") ||
    rel.includes("/scenes/w4/")
  );
}

/** Heat stills (old n_heat_* plus bible plates S06a/S06b/S04/S06c/S11/S14) skip Ch01 stem fallback. */
function isHeatScenePath(assetId: string): boolean {
  return stripLeadingSlash(assetId).includes("/scenes/heat/");
}

function isBlockedClimaxPath(assetId: string): boolean {
  return isClimaxScenePath(assetId) && climaxManifest.status === "BLOCKED_BYTES";
}

/** Public-relative path (no leading slash), always a shipped webp. */
export function resolveAssetPath(assetId?: string): string {
  if (!assetId) return DEFAULT_SCENE_FALLBACK;
  if (isBlockedClimaxPath(assetId)) {
    return scenePath(fallbackSceneStem(stemOf(assetId)));
  }
  if (isHeatScenePath(assetId) || (isClimaxScenePath(assetId) && climaxManifest.status !== "BLOCKED_BYTES")) {
    return stripLeadingSlash(assetId);
  }
  const stem = stemOf(assetId);
  if (stem && SHIPPED_STEMS.has(stem)) {
    return scenePath(stem);
  }
  return scenePath(fallbackSceneStem(stem));
}

/** Browser URL with a leading `/assets/...` slash. Never null. */
export function resolveAssetUrl(assetId?: string): string {
  const path = resolveAssetPath(assetId);
  return path.startsWith("/") ? path : `/${path}`;
}

/** Paid / reused CGs whose filename is not `${nodeId}.webp`. Look up `assetId`, never nodeId. */
export function chapterAssetAliases(
  file: ContentFile = content,
): Record<string, string> {
  const aliases: Record<string, string> = {};
  for (const node of file.stages[0]?.nodes ?? []) {
    if (!node.assetId) continue;
    const base = node.assetId.split("/").pop()?.replace(/\.[^.]+$/, "");
    if (base && base !== node.nodeId) {
      aliases[node.nodeId] = node.assetId;
    }
  }
  return aliases;
}
