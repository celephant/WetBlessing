import { story } from "./content";
import { ENTRY_ASSET_KEY, getAsset, resolveAssetUrl } from "./assets";

/** Phone / tall viewport: use a real portrait file when one is mapped. */
export const PORTRAIT_SOURCE_MEDIA =
  "(orientation: portrait), (max-width: 767px)";
export const TITLE_LANDSCAPE_ASSET_KEY = ENTRY_ASSET_KEY;
export const TITLE_LANDSCAPE_ASSET_ID = TITLE_LANDSCAPE_ASSET_KEY;

export type ViewportOrient = "portrait" | "landscape";
export type StillPairKind = "paired" | "landscape-only";

export type OrientedStill = {
  landscapeUrl: string;
  portraitUrl: string | null;
  pair: StillPairKind;
  portraitAssetKey: string | null;
};

const neverSwapKeys = new Set(
  story.portraitPolicy.actionMismatchNeverSwap.map(
    (pair) => `${pair.landscapeId}::${pair.portraitId}`,
  ),
);

const pairByLandscape = new Map(
  story.portraitPairs.map((pair) => [pair.landscapeId, pair]),
);

function asPublicUrl(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Real portrait file for this landscape key, from authored portraitPairs only.
 * Does not guess from filenames. Action-mismatch / neverSwap stays landscape.
 */
export function portraitStillPath(assetKey?: string | null): string | null {
  if (!assetKey) return null;
  const pair = pairByLandscape.get(assetKey);
  if (!pair) return null;
  if (pair.neverSwap || pair.assessment === "action-mismatch") return null;
  if (neverSwapKeys.has(`${pair.landscapeId}::${pair.portraitId}`)) return null;
  try {
    return asPublicUrl(getAsset(pair.portraitId).path);
  } catch {
    return null;
  }
}

export function portraitAssetKeyFor(assetKey?: string | null): string | null {
  if (!assetKey) return null;
  const pair = pairByLandscape.get(assetKey);
  if (!pair) return null;
  if (pair.neverSwap || pair.assessment === "action-mismatch") return null;
  if (neverSwapKeys.has(`${pair.landscapeId}::${pair.portraitId}`)) return null;
  return pair.portraitId;
}

export function orientedStill(assetKey?: string | null): OrientedStill {
  const landscapeUrl = resolveAssetUrl(assetKey);
  const portraitUrl = portraitStillPath(assetKey);
  return {
    landscapeUrl,
    portraitUrl,
    pair: portraitUrl ? "paired" : "landscape-only",
    portraitAssetKey: portraitAssetKeyFor(assetKey),
  };
}

export function pickStillUrl(assetKey: string | undefined, orient: ViewportOrient): string {
  const still = orientedStill(assetKey);
  if (orient === "portrait" && still.portraitUrl) return still.portraitUrl;
  return still.landscapeUrl;
}
