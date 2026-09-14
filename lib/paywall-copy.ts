import hard from "../content/copy/ENG-copy-PAYWALL_HARD.json";
import edge from "../content/copy/ENG-copy-PAYWALL_EDGE_LOCK.json";

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
export const PAYWALL_EDGE_LOCK = edge as PaywallCopyPack;

/** Reserved wall gates. `edge_lock` is a sibling of `first_sub` (W3 unused until content exists). */
export const GATE_FIRST_SUB = "first_sub";
export const GATE_EDGE_LOCK = "edge_lock";
export const SKU_EDGE_LOCK = "edge_lock";

export const WALL_SKUS = [
  "story_pass_month",
  "chapter_unlock",
  SKU_EDGE_LOCK,
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
  return normalized === GATE_FIRST_SUB || normalized === GATE_EDGE_LOCK;
}

export function isWallSku(sku?: string | null): boolean {
  return (
    sku === "story_pass_month" ||
    sku === "chapter_unlock" ||
    sku === SKU_EDGE_LOCK
  );
}

export function paywallCopyForGate(gate?: string): PaywallCopyPack {
  return normalizeWallGate(gate) === GATE_EDGE_LOCK
    ? PAYWALL_EDGE_LOCK
    : PAYWALL_HARD;
}
