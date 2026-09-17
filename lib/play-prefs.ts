export const PLAY_PREFS_KEY = "wb.playPrefs";

export type TextSpeed = "instant" | "fast" | "normal" | "slow";

export type PlayPrefs = {
  textSpeed: TextSpeed;
  autoAdvance: boolean;
  skipReadOnly: boolean;
  reduceMotion: boolean;
  muted: boolean;
};

export const DEFAULT_PLAY_PREFS: PlayPrefs = {
  textSpeed: "normal",
  autoAdvance: false,
  skipReadOnly: false,
  reduceMotion: false,
  muted: false,
};

export const TEXT_SPEEDS: TextSpeed[] = ["instant", "fast", "normal", "slow"];

export function parsePlayPrefs(raw: unknown): PlayPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_PLAY_PREFS };
  const value = raw as Partial<PlayPrefs>;
  const textSpeed = TEXT_SPEEDS.includes(value.textSpeed as TextSpeed)
    ? (value.textSpeed as TextSpeed)
    : DEFAULT_PLAY_PREFS.textSpeed;
  return {
    textSpeed,
    autoAdvance: Boolean(value.autoAdvance),
    skipReadOnly: Boolean(value.skipReadOnly),
    reduceMotion: Boolean(value.reduceMotion),
    muted: Boolean(value.muted),
  };
}

export function loadPlayPrefs(): PlayPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_PLAY_PREFS };
  try {
    const raw = window.localStorage.getItem(PLAY_PREFS_KEY);
    if (!raw) return { ...DEFAULT_PLAY_PREFS };
    return parsePlayPrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PLAY_PREFS };
  }
}

export function savePlayPrefs(patch: Partial<PlayPrefs>): PlayPrefs {
  const next = parsePlayPrefs({ ...loadPlayPrefs(), ...patch });
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PLAY_PREFS_KEY, JSON.stringify(next));
  }
  return next;
}
