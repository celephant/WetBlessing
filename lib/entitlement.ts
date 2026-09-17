import {
  SCOPE_W1_CONTINUE,
  SCOPE_W2_OFFICE,
  SCOPE_W3_EDGE_NIGHT,
  isChapterScope,
  isStoryPassSku,
} from "./paywall-copy";
import type { ChapterScope, Entitlements } from "./types";

export const ENTITLEMENT_STORAGE_KEY = "wb:slice0:entitlements";
export const SAVE_STORAGE_KEY = "wb:slice0:save";
export const SEASON_CARRY_KEY = "wb:slice0:season-carry";
/** Last pack the player saved. Title 继续 reads this, not only the default Ch01 slot. */
export const RESUME_PACK_KEY = "wb:slice0:resume-pack";

export function saveStorageKey(packId?: string | null): string {
  if (!packId || packId === "default") return SAVE_STORAGE_KEY;
  return `${SAVE_STORAGE_KEY}:${packId}`;
}

export const emptyEntitlements = (): Entitlements => ({
  story_pass: false,
  story_pass_month: false,
  edge_lock: false,
  chapter_unlock: false,
  w1_continue: false,
  w2_office: false,
  w3_edge_night: false,
});

function asBool(value: unknown): boolean {
  return Boolean(value);
}

/** Canonical buyout flag. Old `story_pass_month` saves still count. */
export function ownsStoryPass(entitlements: Entitlements): boolean {
  return Boolean(entitlements.story_pass || entitlements.story_pass_month);
}

/**
 * Coalesce leftover month-card keys into `story_pass`. Call on every load /
 * startGame so tests and old localStorage keep working.
 */
export function normalizeEntitlements(
  partial?: Partial<Entitlements> | Entitlements | null,
): Entitlements {
  const next = { ...emptyEntitlements(), ...(partial ?? {}) };
  const pass = ownsStoryPass(next);
  const w3 = asBool(next.w3_edge_night) || asBool(next.edge_lock);
  return {
    ...next,
    story_pass: pass,
    story_pass_month: pass,
    edge_lock: w3,
    w3_edge_night: w3,
  };
}

export function parseEntitlements(raw: string | null): Entitlements {
  if (!raw) return emptyEntitlements();
  try {
    const parsed = JSON.parse(raw) as Partial<Entitlements>;
    return normalizeEntitlements(parsed);
  } catch {
    return emptyEntitlements();
  }
}

export function loadEntitlements(): Entitlements {
  if (typeof window === "undefined") return emptyEntitlements();
  return parseEntitlements(localStorage.getItem(ENTITLEMENT_STORAGE_KEY));
}

export function saveEntitlements(entitlements: Entitlements): void {
  if (typeof window === "undefined") return;
  const next = normalizeEntitlements(entitlements);
  localStorage.setItem(ENTITLEMENT_STORAGE_KEY, JSON.stringify(next));
}

/** Header DEV PASS / full fake-unlock: one-time pass + both chapter flags + edge. */
export function mintFullEntitle(current?: Entitlements): Entitlements {
  return normalizeEntitlements({
    ...(current ?? emptyEntitlements()),
    story_pass: true,
    story_pass_month: true,
    edge_lock: true,
    chapter_unlock: true,
    w1_continue: true,
    w2_office: true,
    w3_edge_night: true,
  });
}

export function mintScope(
  current: Entitlements | undefined,
  scope: ChapterScope,
): Entitlements {
  const next = normalizeEntitlements(current);
  if (scope === SCOPE_W1_CONTINUE) next.w1_continue = true;
  if (scope === SCOPE_W2_OFFICE) next.w2_office = true;
  if (scope === SCOPE_W3_EDGE_NIGHT) {
    next.w3_edge_night = true;
    next.edge_lock = true;
  }
  return next;
}

export function grantFullEntitleDev(current?: Entitlements): Entitlements {
  const next = mintFullEntitle(current);
  saveEntitlements(next);
  return next;
}

export function grantScopeDev(
  scope: ChapterScope,
  current?: Entitlements,
): Entitlements {
  const next = mintScope(current, scope);
  saveEntitlements(next);
  return next;
}

/** DEV-only fake unlock. Stripe checkout is a later-slice TODO. */
export function grantStoryPassDev(current?: Entitlements): Entitlements {
  return grantFullEntitleDev(current);
}

export function revokeStoryPassDev(current?: Entitlements): Entitlements {
  const next = emptyEntitlements();
  saveEntitlements(next);
  return next;
}

export function isFullyEntitled(entitlements: Entitlements): boolean {
  return ownsStoryPass(entitlements);
}

export function scopeFromSku(sku?: string | null): ChapterScope | null {
  if (isChapterScope(sku)) return sku;
  if (sku === "edge_lock") return SCOPE_W3_EDGE_NIGHT;
  if (isStoryPassSku(sku)) return null;
  return null;
}
