import type { Entitlements } from "./types";

export const ENTITLEMENT_STORAGE_KEY = "wb:slice0:entitlements";
export const SAVE_STORAGE_KEY = "wb:slice0:save";

export const emptyEntitlements = (): Entitlements => ({
  story_pass_month: false,
  edge_lock: false,
  chapter_unlock: false,
});

export function parseEntitlements(raw: string | null): Entitlements {
  if (!raw) return emptyEntitlements();
  try {
    const parsed = JSON.parse(raw) as Partial<Entitlements>;
    return {
      story_pass_month: Boolean(parsed.story_pass_month),
      edge_lock: Boolean(parsed.edge_lock),
      chapter_unlock: Boolean(parsed.chapter_unlock),
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

/** Local /play full-entitle: unlock first_sub and reserved edge_lock together. */
export function grantFullEntitleDev(current?: Entitlements): Entitlements {
  const next: Entitlements = {
    ...(current ?? emptyEntitlements()),
    story_pass_month: true,
    edge_lock: true,
    chapter_unlock: true,
  };
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
  return Boolean(entitlements.story_pass_month && entitlements.edge_lock);
}
