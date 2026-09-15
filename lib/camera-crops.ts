import cropsJson from "../content/ART-camera-crops-v1.json";
import { DENSITY_MAX_SAME_COMPOSITION } from "./feel-density";
import { NIGHT_PASS_DIALOG_DOCK } from "./tokens";

export type CropName = "wide" | "mid" | "close";
export type CropRect = { x: number; y: number; w: number; h: number };
export type CropTransform = { scale: number; tx: number; ty: number };

type PackShot = { id: string; crop: CropRect };
type CropsFile = typeof cropsJson & {
  assets?: Record<string, PackShot[]>;
  dialogSafeBottom?: number;
};

export const CAMERA_CROPS = cropsJson as CropsFile;

export const DEFAULT_CROP_LINE = CAMERA_CROPS.defaultLine ?? "mia";

export const CROP_CYCLE = CAMERA_CROPS.cycle as CropName[];

const ALIASES: Record<string, CropName> = {
  ...(CAMERA_CROPS.aliases as Record<string, CropName>),
  wide: "wide",
  mid: "mid",
  close: "close",
  far: "wide",
  shoulder: "mid",
  kenburns: "mid",
  "kenburns-up": "wide",
  "kenburns-left": "mid",
  "kenburns-right": "close",
  breathe: "close",
  hold: "wide",
  extreme_close: "close",
  close_hands: "close",
  close_hand: "close",
  close_alt: "close",
  close_collar: "close",
  medium: "mid",
  medium_danger: "mid",
  over_shoulder: "mid",
  long_then_cut: "wide",
  wide_split: "wide",
  insert: "mid",
  bust: "close",
};

export function parseCropName(raw?: string): CropName | null {
  if (!raw) return null;
  const mapped = ALIASES[raw];
  return mapped ?? null;
}

function stripAssetKey(assetId: string): string {
  return assetId.replace(/^\/+/, "");
}

function dialogSafeClamp(rect: CropRect): CropRect {
  const maxBottom = 1 - (CAMERA_CROPS.dialogSafeBottom ?? NIGHT_PASS_DIALOG_DOCK);
  if (rect.y + rect.h <= maxBottom + 0.001) {
    return { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
  }
  return {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: Math.max(0.08, maxBottom - rect.y),
  };
}

function packShotsFor(assetId?: string): PackShot[] | undefined {
  if (!assetId || !CAMERA_CROPS.assets) return undefined;
  const rel = stripAssetKey(assetId);
  return CAMERA_CROPS.assets[rel] ?? CAMERA_CROPS.assets[`/${rel}`];
}

export function cropRect(
  name: CropName,
  assetId?: string,
  rawCamera?: string,
): CropRect {
  const shots = packShotsFor(assetId);
  if (shots) {
    const shotId = rawCamera || name;
    const named =
      shots.find((shot) => shot.id === shotId) ??
      shots.find((shot) => shot.id === name);
    if (named) return dialogSafeClamp(named.crop);
  }
  const rect = CAMERA_CROPS.presets[name];
  return { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
}

export function nextCropName(name: CropName): CropName {
  const idx = CROP_CYCLE.indexOf(name);
  return CROP_CYCLE[(idx + 1) % CROP_CYCLE.length]!;
}

/**
 * Same-asset multi-line cycle: wide → mid → close.
 * Honor authored camera for ≤2 lines; the 3rd line (holdCount ≥ 2)
 * auto-advances even if the fixture repeats camera. Night/wall may lock crop.
 * Before choices, prefer close when the camera did not change.
 */
export function selectCropName(options: {
  explicitCamera?: string;
  holdCount: number;
  lockCrop?: boolean;
  beforeChoices?: boolean;
  /** True when this line authored a new camera vs the previous line. */
  cameraChanged?: boolean;
}): CropName {
  const named = parseCropName(options.explicitCamera);
  const hold = Math.max(0, options.holdCount);
  if (options.lockCrop && named && options.explicitCamera !== "kenburns") {
    return named;
  }
  const startIdx = named ? CROP_CYCLE.indexOf(named) : 0;
  const start = startIdx >= 0 ? startIdx : 0;
  if (
    options.beforeChoices &&
    !options.lockCrop &&
    !options.cameraChanged
  ) {
    return "close";
  }
  if (named && hold < DENSITY_MAX_SAME_COMPOSITION) {
    return named;
  }
  if (named) {
    return CROP_CYCLE[(start + hold - (DENSITY_MAX_SAME_COMPOSITION - 1)) % CROP_CYCLE.length]!;
  }
  return CROP_CYCLE[(start + hold) % CROP_CYCLE.length]!;
}

export function cropToTransform(
  rect: CropRect,
  scaleExtra = 1,
): CropTransform {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const scale = Math.max(1 / rect.w, 1 / rect.h) * scaleExtra;
  return {
    scale,
    tx: (0.5 - cx) * 100,
    ty: (0.5 - cy) * 100,
  };
}

export function cropSafeBottom(rect: CropRect): boolean {
  return rect.y + rect.h <= 1 - NIGHT_PASS_DIALOG_DOCK + 0.001;
}
