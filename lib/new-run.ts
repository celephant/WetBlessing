import {
  ENTITLEMENT_STORAGE_KEY,
  SAVE_STORAGE_KEY,
  SEASON_CARRY_KEY,
} from "./entitlement";
import { FUNNEL_COMPLETED_KEY } from "./funnel";
import type { GameState } from "./types";

const PACK_SAVE_SUFFIXES = ["funnel", "ch02", "ch03", "ch04", "fourweek"] as const;

/**
 * B6: wipe this run's story progress. Entitlements stay.
 * Same-run Catch reselect is a different action and must not call this.
 */
export function clearRunProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVE_STORAGE_KEY);
  window.localStorage.removeItem(SEASON_CARRY_KEY);
  window.localStorage.removeItem(FUNNEL_COMPLETED_KEY);
  for (const suffix of PACK_SAVE_SUFFIXES) {
    window.localStorage.removeItem(`${SAVE_STORAGE_KEY}:${suffix}`);
  }
}

/** Overlay 回标题: keep the wall node, drop the pending SKU, do not pick 离开. */
export function dismissPaywallToTitle(state: GameState): GameState {
  return { ...state, pendingChoiceId: null };
}

export const RUN_STORAGE_KEYS = {
  save: SAVE_STORAGE_KEY,
  entitlements: ENTITLEMENT_STORAGE_KEY,
  carry: SEASON_CARRY_KEY,
  funnel: FUNNEL_COMPLETED_KEY,
} as const;
