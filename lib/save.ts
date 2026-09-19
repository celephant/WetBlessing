import { STORY_VERSION } from "./content";
import type { GameState } from "./types";

export const STORY_SAVE_KEY = "wb:tomorrow.1:save";
export const LEGACY_SAVE_KEYS = [
  "wb:slice0:save",
  "wb:slice0:save:funnel",
  "wb:slice0:save:ch02",
  "wb:slice0:save:ch03",
  "wb:slice0:save:ch04",
  "wb:slice0:save:fourweek",
] as const;

export const SAVE_STORAGE_KEY = STORY_SAVE_KEY;
export const ENTITLEMENT_STORAGE_KEY = "wb:slice0:entitlements";
export const SEASON_CARRY_KEY = "wb:slice0:season-carry";
export const RESUME_PACK_KEY = "wb:slice0:resume-pack";
export const FUNNEL_COMPLETED_KEY = "wb.funnel.completed";

export type SaveCompatibility =
  | { status: "missing" }
  | { status: "ok"; state: GameState }
  | { status: "incompatible"; reason: string; preserved: true };

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function parseStorySave(raw: string | null): SaveCompatibility {
  if (!raw) return { status: "missing" };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) {
      return { status: "incompatible", reason: "存档已损坏。", preserved: true };
    }
    if (typeof parsed.nodeId !== "string" || typeof parsed.beatIndex !== "number") {
      return { status: "incompatible", reason: "存档格式无法用于《明天见》。", preserved: true };
    }
    if (parsed.storyVersion !== STORY_VERSION) {
      return {
        status: "incompatible",
        reason: "这段进度属于另一版故事，不能带到《明天见》。旧存档仍留在本机。",
        preserved: true,
      };
    }
    return {
      status: "ok",
      state: {
        schemaVersion: Number(parsed.schemaVersion ?? 1),
        storyVersion: STORY_VERSION,
        assetManifestVersion: Number(parsed.assetManifestVersion ?? 1),
        nodeId: parsed.nodeId,
        beatIndex: parsed.beatIndex,
        flags: isObject(parsed.flags) ? (parsed.flags as GameState["flags"]) : {},
      },
    };
  } catch {
    return { status: "incompatible", reason: "存档已损坏。", preserved: true };
  }
}

export function hasLegacySave(): boolean {
  if (typeof window === "undefined") return false;
  return LEGACY_SAVE_KEYS.some((key) => Boolean(window.localStorage.getItem(key)));
}

export function readStorySave(): SaveCompatibility {
  if (typeof window === "undefined") return { status: "missing" };
  const current = parseStorySave(window.localStorage.getItem(STORY_SAVE_KEY));
  if (current.status !== "missing") return current;
  if (hasLegacySave()) {
    return {
      status: "incompatible",
      reason: "这段进度属于上一版故事，不能带到《明天见》。旧存档仍留在本机，不会被清除。",
      preserved: true,
    };
  }
  return { status: "missing" };
}

export function persistStorySave(state: GameState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORY_SAVE_KEY, JSON.stringify(state));
}

export function clearTomorrowSave(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORY_SAVE_KEY);
}

export function hasTomorrowSave(): boolean {
  if (typeof window === "undefined") return false;
  return readStorySave().status === "ok";
}
