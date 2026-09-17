import type { TextSpeed } from "./play-prefs";

/** Prototype timings from the private-interaction brief. Not a retention claim. */
export const INTERACTION = {
  pressMs: 80,
  othersFadeMs: 120,
  confirmMs: 180,
  choiceArmMs: 180,
  fastClickMs: 280,
  settleActionsMs: 480,
  autoBaseMs: 420,
  caretNudgePx: 3,
  buttonHeightPx: 54,
  buttonRadiusPx: 14,
  typeMs: {
    instant: 0,
    fast: 8,
    normal: 18,
    slow: 32,
  },
} as const;

export function typeCharMs(
  speed: TextSpeed,
  reduceMotion: boolean,
  alreadyRead = false,
): number {
  if (reduceMotion || speed === "instant" || alreadyRead) return 0;
  return INTERACTION.typeMs[speed];
}

export function choicesAreArmed(
  appearedAtMs: number,
  nowMs: number,
  armMs = INTERACTION.choiceArmMs,
): boolean {
  return nowMs - appearedAtMs >= armMs;
}

export function shouldSkipMotion(
  reduceMotion: boolean,
  sinceLastClickMs: number,
): boolean {
  return reduceMotion || sinceLastClickMs < INTERACTION.fastClickMs;
}

export function autoAdvanceMs(textLength: number, reduceMotion: boolean): number {
  if (reduceMotion) return 80;
  return INTERACTION.autoBaseMs + Math.min(textLength, 80) * 12;
}
