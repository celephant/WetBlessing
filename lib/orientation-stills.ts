import { resolveAssetPath, resolveAssetUrl } from "./assets";

/**
 * True 9:16 portraits paired to existing landscape webps.
 *
 * Keys are public landscape paths (no leading slash). Values are
 * `public/media/...` portraits from the composition boards' 竖 column,
 * matched to the boards' 横 still and the webp the current JSON already
 * points at. Story JSON is not rewritten.
 *
 * Unwired KEEP portraits (no matching landscape webp in current JSON):
 * C1-D1 (ch01-s05-party), C1-J1b (ch01-s06b-jade),
 * C2-13E / C2-14E (hall reuse; Ch02 nodes still use S13 / S14-abort).
 */
export const PORTRAIT_STILL_BY_LANDSCAPE: Record<string, string> = {
  // Title + hall-open (current entry). Not the new-spine C1-01 night-pool hook.
  "assets/scenes/ch01/n_open.webp": "media/ch01-portrait/title-portrait.png",

  // C1-01 night pool — later beat on the current graph (n_conflict).
  "assets/scenes/ch01/n_conflict.webp": "media/ch01-portrait/C1-01-portrait.png",

  "assets/scenes/heat/S06a.webp": "media/ch01-portrait/C1-M1-portrait.png",
  "assets/scenes/ch01/n_mia_edge_1.webp":
    "media/ch01-portrait/C1-M1b-portrait.png",
  "assets/scenes/heat/n_heat_kiss_mia.webp":
    "media/ch01-portrait/C1-M2-portrait.png",
  "assets/scenes/heat/S06b.webp": "media/ch01-portrait/C1-J1-portrait.png",
  "assets/scenes/heat/n_heat_kiss_jade.webp":
    "media/ch01-portrait/C1-J2-portrait.png",
  "assets/scenes/heat/S06c.webp": "media/ch01-portrait/C1-L1-portrait.png",
  "assets/scenes/heat/n_heat_kiss_lina.webp":
    "media/ch01-portrait/C1-L2-portrait.png",
  "assets/scenes/heat/S04.webp": "media/ch01-portrait/C1-R1-portrait.png",
  "assets/scenes/heat/n_heat_neck_rae.webp":
    "media/ch01-portrait/C1-R2-portrait.png",
  "assets/scenes/heat/n_heat_kiss_rae.webp":
    "media/ch01-portrait/C1-R3-portrait.png",
  "assets/scenes/ch01/n_sms_auto.webp": "media/ch01-portrait/C1-07-portrait.png",
  "assets/scenes/ch01/n_see_both.webp": "media/ch01-portrait/C1-07b-portrait.png",
  "assets/scenes/ch01/n_ch01_first_sub.webp":
    "media/ch01-portrait/C1-08-portrait.png",
  "assets/scenes/heat/n_heat_sleep_legs.webp":
    "media/ch01-portrait/C1-09M-portrait.png",
  "assets/scenes/heat/n_heat_jade_cling.webp":
    "media/ch01-portrait/C1-09J-portrait.png",
  "assets/scenes/heat/n_heat_wet_cling.webp":
    "media/ch01-portrait/C1-09L-portrait.png",
  "assets/scenes/heat/n_heat_door_steam.webp":
    "media/ch01-portrait/C1-09R-portrait.png",
  "assets/scenes/heat/n_heat_pin_mia.webp":
    "media/ch01-portrait/C1-10M-portrait.png",
  "assets/scenes/heat/n_heat_straddle_jade.webp":
    "media/ch01-portrait/C1-10J-portrait.png",
  "assets/scenes/heat/n_heat_hug_lina.webp":
    "media/ch01-portrait/C1-10L-portrait.png",
  "assets/scenes/heat/n_heat_ot_rae.webp":
    "media/ch01-portrait/C1-10R-portrait.png",
  "assets/scenes/heat/S11.webp": "media/ch01-portrait/C1-11-portrait.png",
  "assets/scenes/ch01/n_free_soft_exit.webp":
    "media/ch01-portrait/C1-D2-portrait.png",
  "assets/scenes/ch01/n_pay_settle.webp":
    "media/ch01-portrait/C1-12-portrait.png",
  "assets/scenes/ch01/n_title.webp": "media/ch01-portrait/C1-12-portrait.png",

  "assets/scenes/ch02/S13.webp": "media/ch02-portrait/C2-13-portrait.png",
  "assets/scenes/ch02/S14.webp": "media/ch02-portrait/C2-14-portrait.png",
  "assets/scenes/ch02/S14-lock.webp": "media/ch02-portrait/C2-14L-portrait.png",
  "assets/scenes/ch02/S14-kiss.webp": "media/ch02-portrait/C2-14K-portrait.png",
  "assets/scenes/ch02/S14-abort.webp": "media/ch02-portrait/C2-14A-portrait.png",

  "assets/scenes/ch03/S18.webp": "media/ch03-portrait/C3-18M-portrait.png",
  "assets/scenes/ch03/S18-jade.webp": "media/ch03-portrait/C3-18J-portrait.png",
  "assets/scenes/ch03/S18L.webp": "media/ch03-portrait/C3-18L-portrait.png",
  "assets/scenes/ch03/S18R.webp": "media/ch03-portrait/C3-18R-portrait.png",
  "assets/scenes/ch03/S18-empty.webp": "media/ch03-portrait/C3-18E-portrait.png",
  "assets/scenes/ch03/S19.webp": "media/ch03-portrait/C3-19M-portrait.png",
  "assets/scenes/ch03/S19-jade.webp": "media/ch03-portrait/C3-19J-portrait.png",
  "assets/scenes/ch03/S19L.webp": "media/ch03-portrait/C3-19L-portrait.png",
  "assets/scenes/ch03/S19R.webp": "media/ch03-portrait/C3-19R-portrait.png",
  "assets/scenes/ch03/S20-mia.webp": "media/ch03-portrait/C3-20M-portrait.png",
  "assets/scenes/ch03/S20-jade.webp": "media/ch03-portrait/C3-20J-portrait.png",
  "assets/scenes/ch03/S20-lina.webp": "media/ch03-portrait/C3-20L-portrait.png",
  "assets/scenes/ch03/S20-rae.webp": "media/ch03-portrait/C3-20R-portrait.png",
  "assets/scenes/ch03/S21.webp": "media/ch03-portrait/C3-21-portrait.png",

  "assets/scenes/ch04/S22-mia.webp": "media/ch04-portrait/C4-22M-portrait.png",
  "assets/scenes/ch04/S22-jade.webp": "media/ch04-portrait/C4-22J-portrait.png",
  "assets/scenes/ch04/S22-lina.webp": "media/ch04-portrait/C4-22L-portrait.png",
  "assets/scenes/ch04/S22-rae.webp": "media/ch04-portrait/C4-22R-portrait.png",
  "assets/scenes/ch04/S23.webp": "media/ch04-portrait/C4-23M-portrait.png",
  "assets/scenes/ch04/S23-vanessa.webp":
    "media/ch04-portrait/C4-23V-portrait.png",
  "assets/scenes/ch04/S23-empty.webp": "media/ch04-portrait/C4-23X-portrait.png",
  "assets/scenes/ch04/S24-mia.webp": "media/ch04-portrait/C4-24M-portrait.png",
  "assets/scenes/ch04/S24-jade.webp": "media/ch04-portrait/C4-24J-portrait.png",
  "assets/scenes/ch04/S24-lina.webp": "media/ch04-portrait/C4-24L-portrait.png",
  "assets/scenes/ch04/S24-rae.webp": "media/ch04-portrait/C4-24R-portrait.png",
  "assets/scenes/ch04/S24-vanessa.webp":
    "media/ch04-portrait/C4-24V-portrait.png",
  "assets/scenes/ch04/S24-reina.webp": "media/ch04-portrait/C4-24N-portrait.png",
  "assets/scenes/ch04/S24-crash.webp":
    "media/ch04-portrait/C4-24crash-portrait.png",
  "assets/scenes/ch04/S24-tail.webp":
    "media/ch04-portrait/C4-24tail-portrait.png",
};

export const TITLE_LANDSCAPE_ASSET_ID = "assets/scenes/ch01/n_open.webp";
export const PORTRAIT_SOURCE_MEDIA = "(orientation: portrait)";

export type ViewportOrient = "portrait" | "landscape";
export type StillPairKind = "paired" | "landscape-only";

export type OrientedStill = {
  landscapeUrl: string;
  portraitUrl: string | null;
  pair: StillPairKind;
};

function stripLeadingSlash(assetId: string): string {
  return assetId.replace(/^\/+/, "");
}

function publicUrl(rel: string): string {
  return rel.startsWith("/") ? rel : `/${rel}`;
}

export function portraitStillPath(assetId?: string): string | null {
  if (!assetId) return null;
  const raw = stripLeadingSlash(assetId);
  const resolved = resolveAssetPath(assetId);
  return (
    PORTRAIT_STILL_BY_LANDSCAPE[raw] ??
    PORTRAIT_STILL_BY_LANDSCAPE[resolved] ??
    null
  );
}

export function orientedStill(assetId?: string): OrientedStill {
  const landscapeUrl = resolveAssetUrl(assetId);
  const portraitRel = portraitStillPath(assetId);
  return {
    landscapeUrl,
    portraitUrl: portraitRel ? publicUrl(portraitRel) : null,
    pair: portraitRel ? "paired" : "landscape-only",
  };
}

export function pickStillUrl(
  assetId: string | undefined,
  orient: ViewportOrient,
): string {
  const still = orientedStill(assetId);
  if (orient === "portrait" && still.portraitUrl) return still.portraitUrl;
  return still.landscapeUrl;
}
