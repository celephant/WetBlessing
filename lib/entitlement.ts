import type { Entitlements } from "./types";

export const ENTITLEMENT_STORAGE_KEY = "wb:slice0:entitlements";
export const SAVE_STORAGE_KEY = "wb:slice0:save";

export const emptyEntitlements = (): Entitlements => ({
  story_pass_month: false,
});

export function parseEntitlements(raw: string | null): Entitlements {
  if (!raw) return emptyEntitlements();
  try {
    const parsed = JSON.parse(raw) as Partial<Entitlements>;
    return {
      story_pass_month: Boolean(parsed.story_pass_month),
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

/** DEV-only fake unlock. Stripe checkout is a later-slice TODO. */
export function grantStoryPassDev(current?: Entitlements): Entitlements {
  const next: Entitlements = {
    ...(current ?? emptyEntitlements()),
    story_pass_month: true,
  };
  saveEntitlements(next);
  return next;
}

export function revokeStoryPassDev(current?: Entitlements): Entitlements {
  const next: Entitlements = {
    ...(current ?? emptyEntitlements()),
    story_pass_month: false,
  };
  saveEntitlements(next);
  return next;
}
