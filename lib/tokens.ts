import tokens from "@/content/UI-tokens.json";

export const ui = tokens;
export const DIALOG_BAR_PERCENT = 28;

export function tokenCssVars(): Record<string, string> {
  return {
    "--wb-void": tokens.colors.void,
    "--wb-night": tokens.colors.night,
    "--wb-glass": tokens.colors.glass,
    "--wb-paper": tokens.colors.paper,
    "--wb-ink": tokens.colors.ink,
    "--wb-mute": tokens.colors.mute,
    "--wb-hot": tokens.colors.hot,
    "--wb-mint": tokens.colors.mint,
    "--wb-gold": tokens.colors.gold,
    "--wb-mia": tokens.colors.mia,
    "--wb-jade": tokens.colors.jade,
    "--wb-vanessa": tokens.colors.vanessa,
    "--wb-line": tokens.colors.line,
    "--wb-dialog-h": `${DIALOG_BAR_PERCENT}%`,
    "--wb-radius-dialog": `${tokens.space.radiusDialog}px`,
    "--wb-radius-chip": `${tokens.space.radiusChip}px`,
    "--wb-dialog-ms": `${tokens.motion.dialogMs}ms`,
  };
}
