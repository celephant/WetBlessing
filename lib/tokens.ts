import uiTokens from "../content/UI-tokens.json";

export const tokens = uiTokens;

export const SKU_STORY_PASS_MONTH = "story_pass_month";

export const PASS_PRICE = tokens.paywall.price;
export const PASS_HEADLINE = tokens.paywall.headline;
export const PASS_FOOTNOTE = tokens.paywall.footnote;

export function speakerColor(speaker: string): string {
  const key = speaker.toLowerCase();
  if (key === "mia") return tokens.colors.mia;
  if (key === "jade") return tokens.colors.jade;
  if (key === "vanessa") return tokens.colors.vanessa;
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
