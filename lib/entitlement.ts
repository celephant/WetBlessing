import {
  SCOPE_W1_CONTINUE,
  SCOPE_W2_OFFICE,
  SCOPE_W3_EDGE_NIGHT,
  isChapterScope,
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

export function parseEntitlements(raw: string | null): Entitlements {
  if (!raw) return emptyEntitlements();
  try {
    const parsed = JSON.parse(raw) as Partial<Entitlements>;
    const w3 = asBool(parsed.w3_edge_night) || asBool(parsed.edge_lock);
    return {
      story_pass_month: asBool(parsed.story_pass_month),
      edge_lock: w3,
      chapter_unlock: asBool(parsed.chapter_unlock),
      w1_continue: asBool(parsed.w1_continue),
      w2_office: asBool(parsed.w2_office),
      w3_edge_night: w3,
    };
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
  localStorage.setItem(ENTITLEMENT_STORAGE_KEY, JSON.stringify(entitlements));
}

/** Header DEV PASS / full fake-unlock: pass + both chapter flags + edge. */
export function mintFullEntitle(current?: Entitlements): Entitlements {
  return {
    ...(current ?? emptyEntitlements()),
    story_pass_month: true,
    edge_lock: true,
    chapter_unlock: true,
    w1_continue: true,
    w2_office: true,
    w3_edge_night: true,
  };
}

export function mintScope(
  current: Entitlements | undefined,
  scope: ChapterScope,
): Entitlements {
  const next: Entitlements = { ...(current ?? emptyEntitlements()) };
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
  return Boolean(entitlements.story_pass_month);
}

export function scopeFromSku(sku?: string | null): ChapterScope | null {
  if (isChapterScope(sku)) return sku;
  if (sku === "edge_lock") return SCOPE_W3_EDGE_NIGHT;
  return null;
}
