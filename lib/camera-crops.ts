import cropsJson from "../content/ART-camera-crops-v1.json";
import { NIGHT_PASS_DIALOG_DOCK } from "./tokens";

export type CropName = "wide" | "mid" | "close";
export type CropRect = { x: number; y: number; w: number; h: number };
export type CropTransform = { scale: number; tx: number; ty: number };

export const CAMERA_CROPS = cropsJson;

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
};

export function parseCropName(raw?: string): CropName | null {
  if (!raw) return null;
  const mapped = ALIASES[raw];
  return mapped ?? null;
}

export function cropRect(name: CropName): CropRect {
  const rect = CAMERA_CROPS.presets[name];
  return { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
}

export function nextCropName(name: CropName): CropName {
  const idx = CROP_CYCLE.indexOf(name);
  return CROP_CYCLE[(idx + 1) % CROP_CYCLE.length]!;
}

/** Same-asset multi-line cycle: wide → mid → close. Explicit camera words stick. */
export function selectCropName(options: {
  explicitCamera?: string;
  holdCount: number;
}): CropName {
  const named = parseCropName(options.explicitCamera);
  if (named && options.explicitCamera !== "kenburns") return named;
  return CROP_CYCLE[Math.max(0, options.holdCount) % CROP_CYCLE.length]!;
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
