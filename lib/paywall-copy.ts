import hard from "../content/copy/ENG-copy-PAYWALL_HARD.json";
import chapter from "../content/copy/ENG-copy-PAYWALL_CHAPTER.json";
import edge from "../content/copy/ENG-copy-PAYWALL_EDGE_LOCK.json";
import type { ChapterScope, Flags } from "./types";

export const SKU_CHAPTER_UNLOCK = "chapter_unlock";
export const CHAPTER_UNLOCK_PRICE = 2.99;

export type PaywallCopyPack = {
  errorCode: string;
  http: number;
  "zh-CN": {
    title: string;
    body: string;
    primary: string;
    primaryOwned?: string;
    secondary: string;
    tertiary: string;
  };
  behavior: {
    primaryAction: string;
    primaryOwnedAction?: string;
    secondaryAction: string;
    tertiaryAction: string;
    tone: string;
  };
};

export const PAYWALL_HARD = hard as PaywallCopyPack;
export const PAYWALL_CHAPTER = chapter as PaywallCopyPack;
export const PAYWALL_EDGE_LOCK = edge as PaywallCopyPack;

/** Wall gates. `chapter_start` is Ch02 paid-to-enter. `edge_lock` is Ch03 door. */
export const GATE_FIRST_SUB = "first_sub";
export const GATE_CHAPTER_START = "chapter_start";
export const GATE_EDGE_LOCK = "edge_lock";
export const SKU_EDGE_LOCK = "edge_lock";

export const SCOPE_W1_CONTINUE = "w1_continue";
export const SCOPE_W2_OFFICE = "w2_office";
export const SCOPE_W3_EDGE_NIGHT = "w3_edge_night";

export const CHAPTER_SCOPES = [
  SCOPE_W1_CONTINUE,
  SCOPE_W2_OFFICE,
  SCOPE_W3_EDGE_NIGHT,
] as const;

export const WALL_SKUS = [
  "story_pass_month",
  "chapter_unlock",
  SKU_EDGE_LOCK,
  ...CHAPTER_SCOPES,
] as const;

export type WallSku = (typeof WALL_SKUS)[number];

/** Accept `gate: edge_lock` and `gate: "edge_lock"` (quoted leftovers from YAML/JSON). */
export function normalizeWallGate(gate?: string | null): string | undefined {
  if (gate == null) return undefined;
  const trimmed = String(gate).trim().replace(/^["']+|["']+$/g, "");
  return trimmed || undefined;
}

export function isWallGate(gate?: string | null): boolean {
  const normalized = normalizeWallGate(gate);
  return (
    normalized === GATE_FIRST_SUB ||
    normalized === GATE_CHAPTER_START ||
    normalized === GATE_EDGE_LOCK
  );
}

export function isChapterScope(sku?: string | null): sku is ChapterScope {
  return (
    sku === SCOPE_W1_CONTINUE ||
    sku === SCOPE_W2_OFFICE ||
    sku === SCOPE_W3_EDGE_NIGHT
  );
}

export function isWallSku(sku?: string | null): boolean {
  return (
    sku === "story_pass_month" ||
    sku === "chapter_unlock" ||
    sku === SKU_EDGE_LOCK ||
    isChapterScope(sku)
  );
}

export function scopeForGate(gate?: string | null): ChapterScope {
  const normalized = normalizeWallGate(gate);
  if (normalized === GATE_CHAPTER_START) return SCOPE_W2_OFFICE;
  if (normalized === GATE_EDGE_LOCK) return SCOPE_W3_EDGE_NIGHT;
  return SCOPE_W1_CONTINUE;
}

export function paywallCopyForGate(gate?: string): PaywallCopyPack {
  const normalized = normalizeWallGate(gate);
  if (normalized === GATE_EDGE_LOCK) return PAYWALL_EDGE_LOCK;
  if (normalized === GATE_CHAPTER_START) return PAYWALL_CHAPTER;
  return PAYWALL_HARD;
}

/** Bind `none` has no 闭馆夜 door. Do not sell `w3_edge_night` for a night that does not exist. */
export function offersEdgeNightSku(flags: Flags): boolean {
  return flags.ch3_bind !== "none";
}
