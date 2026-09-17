import type { PlayPackId } from "./dev-packs";
import {
  ENTITLEMENT_STORAGE_KEY,
  RESUME_PACK_KEY,
  SAVE_STORAGE_KEY,
  SEASON_CARRY_KEY,
  saveStorageKey,
} from "./entitlement";
import { FUNNEL_COMPLETED_KEY } from "./funnel";
import type { GameState } from "./types";

export const PACK_SAVE_SUFFIXES = ["funnel", "ch02", "ch03", "ch04", "fourweek"] as const;

const KNOWN_PACKS: PlayPackId[] = [
  "default",
  "funnel",
  "ch02",
  "ch03",
  "ch04",
  "fourweek",
];

function isPlayPackId(value: string | null | undefined): value is PlayPackId {
  return Boolean(value && (KNOWN_PACKS as string[]).includes(value));
}

export function rememberResumePack(packId: PlayPackId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESUME_PACK_KEY, packId);
}

export function persistPackSave(state: GameState, packId: PlayPackId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(saveStorageKey(packId), JSON.stringify(state));
  rememberResumePack(packId);
}

export function readPackSave(packId: PlayPackId): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(saveStorageKey(packId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function hasPackSave(packId: PlayPackId): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(saveStorageKey(packId)));
}

export function hasAnyRunSave(): boolean {
  if (hasPackSave("default")) return true;
  return PACK_SAVE_SUFFIXES.some((suffix) => hasPackSave(suffix));
}

export function packResumeHref(packId: PlayPackId): string {
  if (packId === "default") return "/play?resume=1";
  return `/play?content=${packId}&resume=1`;
}

/** Ch02–Ch04 (and DEV fourweek) overlay 回标题 must resume from title 继续. */
export function isChapterPackResume(pack: PlayPackId): boolean {
  return pack === "ch02" || pack === "ch03" || pack === "ch04" || pack === "fourweek";
}

export type TitleResume = {
  pack: PlayPackId;
  href: string;
  label: string;
};

/**
 * Prefer the pack last saved (overlay 回标题 writes this). If the pointer is
 * missing, later-chapter slots win over the default Ch01 save so a Ch02/Ch03
 * wall is not stranded behind 继续入学夜.
 */
export function resolveResumePack(): PlayPackId | null {
  if (typeof window === "undefined") return null;
  const pointed = window.localStorage.getItem(RESUME_PACK_KEY);
  if (isPlayPackId(pointed) && hasPackSave(pointed)) return pointed;
  const scan: PlayPackId[] = ["ch04", "ch03", "ch02", "fourweek", "funnel", "default"];
  return scan.find((pack) => hasPackSave(pack)) ?? null;
}

export function readTitleResume(funnelDone: boolean): TitleResume | null {
  const pack = resolveResumePack();
  if (!pack || pack === "funnel") return null;
  return {
    pack,
    href: packResumeHref(pack),
    label: isChapterPackResume(pack) || !funnelDone ? "继续" : "继续入学夜",
  };
}

/**
 * B6: wipe this run's story progress. Entitlements stay.
 * Same-run Catch reselect is a different action and must not call this.
 */
export function clearRunProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVE_STORAGE_KEY);
  window.localStorage.removeItem(SEASON_CARRY_KEY);
  window.localStorage.removeItem(FUNNEL_COMPLETED_KEY);
  window.localStorage.removeItem(RESUME_PACK_KEY);
  for (const suffix of PACK_SAVE_SUFFIXES) {
    window.localStorage.removeItem(saveStorageKey(suffix));
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
  resumePack: RESUME_PACK_KEY,
} as const;
