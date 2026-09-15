import uiTokens from "../content/UI-tokens.json";

export const tokens = uiTokens;

export const UI_TOKENS_SHA256 =
  "452d7671f71c8b870242d00aa67cc8ac0e170f58ee842e352132b2a344102072";

export const SKU_STORY_PASS_MONTH = "story_pass_month";

/** Night Pass reserved dialog dock. Art cue: 底栏28%留给对话框勿烧UI. */
export const NIGHT_PASS_DIALOG_DOCK = 0.28;
export const NIGHT_PASS_DIALOG_DOCK_CSS = "28%";

export const PASS_PRICE = tokens.paywall.price;
export const PASS_HEADLINE = tokens.paywall.headline;
export const PASS_FOOTNOTE = tokens.paywall.footnote;
export const PASS_WALL_NODE_ID = tokens.paywall.nodeId;

/** Injected into :root so CSS motion stays locked to UI-tokens.json v1.1.1. */
export function tokenRootCss(): string {
  const m = tokens.motion;
  const t = tokens.transitions;
  const g = tokens.grade;
  return `:root {
  --motion-dialog-ms: ${m.dialogMs}ms;
  --motion-dialog-continue-ms: ${m.dialogContinueMs}ms;
  --motion-dialog-ease: ${m.dialogEase};
  --motion-dialog-from-y: ${m.dialogFromY}px;
  --motion-dialog-continue-from-y: ${m.dialogContinueFromY}px;
  --motion-nameplate-delay-ms: ${m.nameplateDelayMs}ms;
  --motion-nameplate-ms: ${m.nameplateMs}ms;
  --motion-choice-ms: ${m.choiceMs}ms;
  --motion-choice-from-y: ${m.choiceFromY}px;
  --motion-choice-from-scale: ${m.choiceFromScale};
  --motion-kenburns-ms: ${m.kenBurnsMs}ms;
  --motion-kenburns-scale: ${m.kenBurnsScale};
  --motion-breathe-ms: ${m.breatheMs}ms;
  --motion-breathe-scale: ${m.breatheScale};
  --motion-gold-sweep-ms: ${m.goldSweepMs}ms;
  --transition-fade-ms: ${t.fade.ms}ms;
  --transition-fade-ease: ${t.fade.ease};
  --transition-soft-zoom-ms: ${t.softZoom.ms}ms;
  --transition-soft-zoom-crop-ms: ${t.softZoomCrop.msDefault}ms;
  --transition-soft-zoom-ease: ${t.softZoom.ease};
  --transition-soft-zoom-old: ${t.softZoom.oldScaleTo};
  --transition-soft-zoom-new: ${t.softZoom.newScaleFrom};
  --transition-soft-zoom-focus-y: ${t.softZoom.focusY * 100}%;
  --transition-dip-ms: ${t.dip.ms}ms;
  --transition-dip-overlay: ${t.dip.overlay};
  --grade-warm-veil: ${g.warmVeil};
  --grade-magenta-mist: ${g.magentaMist};
  --grade-vignette: ${g.vignette};
}`;
}

export function speakerColor(speaker: string): string {
  const key = speaker.toLowerCase();
  if (key === "mia") return tokens.colors.mia;
  if (key === "jade") return tokens.colors.jade;
  if (key === "vanessa") return tokens.colors.vanessa;
  if (key === "rae") return tokens.colors.hot;
  if (key === "lina") return tokens.colors.mint;
  if (key === "kai") return tokens.colors.mint;
  return tokens.colors.paper;
}

export function speakerLabel(speaker: string): string {
  if (speaker === "narrator") return "";
  if (!speaker) return "";
  return speaker.charAt(0).toUpperCase() + speaker.slice(1);
}

export function assetUrl(assetId?: string): string | null {
  if (!assetId) return null;
  return assetId.startsWith("/") ? assetId : `/${assetId}`;
}

export function artAlt(
  artCue: string | { summary?: string } | undefined,
  fallback: string,
): string {
  if (!artCue) return fallback;
  if (typeof artCue === "string") return artCue;
  return artCue.summary ?? fallback;
}
