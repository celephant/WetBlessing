import type { PlayPackId } from "./dev-packs";
import { isFullyEntitled, SEASON_CARRY_KEY } from "./entitlement";
import type { Entitlements, Flags, GameState, Stats } from "./types";

export type SeasonCarry = {
  flags: Flags;
  stats: Stats;
};

export type SeasonContinueTarget = {
  pack: Exclude<PlayPackId, "default" | "fourweek">;
  href: string;
  label: string;
};

export function saveSeasonCarry(state: GameState): void {
  if (typeof window === "undefined") return;
  const carry: SeasonCarry = { flags: state.flags, stats: state.stats };
  localStorage.setItem(SEASON_CARRY_KEY, JSON.stringify(carry));
}

export function loadSeasonCarry(): SeasonCarry | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SEASON_CARRY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SeasonCarry>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      flags: parsed.flags ?? {},
      stats: parsed.stats as Stats,
    };
  } catch {
    return null;
  }
}

export function applySeasonCarry(state: GameState, carry: SeasonCarry | null): GameState {
  if (!carry) return state;
  return {
    ...state,
    flags: { ...state.flags, ...carry.flags },
    stats: carry.stats ?? state.stats,
  };
}

function ownsPass(entitlements: Entitlements): boolean {
  return isFullyEntitled(entitlements);
}

function ownsW2(entitlements: Entitlements): boolean {
  return ownsPass(entitlements) || Boolean(entitlements.w2_office);
}

function ownsW3(entitlements: Entitlements): boolean {
  return (
    ownsPass(entitlements) ||
    Boolean(entitlements.w3_edge_night) ||
    Boolean(entitlements.edge_lock)
  );
}

/** Ch04 is part of 闭馆夜. Leave / dodge / bind none may continue after Ch02 without buying a missing door. */
export function canPlayCh04(entitlements: Entitlements, flags: Flags): boolean {
  if (ownsW3(entitlements)) return true;
  if (!ownsW2(entitlements)) return false;
  return flags.ch3_bind === "none" || flags.ch3_entered === false;
}

export function seasonContinueTarget(
  packId: PlayPackId,
  nodeId: string,
  entitlements: Entitlements,
  flags: Flags,
): SeasonContinueTarget | null {
  if (packId === "default" && nodeId === "n_pay_settle") {
    return {
      pack: "ch02",
      href: "/play?content=ch02&continue=1",
      label: "继续 · 账单与办公室",
    };
  }
  if (packId === "ch02" && nodeId === "n_ch02_settle") {
    return {
      pack: "ch03",
      href: "/play?content=ch03&continue=1",
      label: "继续 · 闭馆夜",
    };
  }
  if (packId === "ch03" && nodeId === "n_ch03_settle" && canPlayCh04(entitlements, flags)) {
    return {
      pack: "ch04",
      href: "/play?content=ch04&continue=1",
      label: "继续 · 名分",
    };
  }
  return null;
}
