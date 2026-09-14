import { resolveAssetUrl } from "./assets";
import type {
  ContentNode,
  SceneCameraName,
  SceneFxName,
  ScenePresentationHooks,
  SceneTransitionName,
} from "./types";

/** Crossfade. Default first change. */
export const TRANSITION_FADE: SceneTransitionName = "fade";
/** Incoming art eases in from a slight overscale. */
export const TRANSITION_SOFT_ZOOM: SceneTransitionName = "soft-zoom";
/**
 * Brief night-grade veil (not a stuck #000 frame). Art or the
 * gradient placeholder stays underneath and is revealed again.
 */
export const TRANSITION_DIP: SceneTransitionName = "dip-to-black";

export const SCENE_TRANSITIONS = [
  TRANSITION_FADE,
  TRANSITION_SOFT_ZOOM,
  TRANSITION_DIP,
] as const;

export const SAME_ASSET_MOTIONS = [
  "kenburns-right",
  "kenburns-left",
  "breathe",
  "kenburns-up",
] as const;

export type SceneMotion = (typeof SAME_ASSET_MOTIONS)[number] | "hold";

export const SCENE_FX = ["none", "vignette", "warm-tint", "soft-light"] as const;

export const TRANSITION_MS: Record<SceneTransitionName, number> = {
  fade: 320,
  "soft-zoom": 420,
  "dip-to-black": 380,
};

export const DEFAULT_SCENE_FX: SceneFxName = "vignette";

export type SceneIdentity = {
  url: string;
  assetId: string;
};

export function sceneIdentity(assetId?: string): SceneIdentity {
  return {
    url: resolveAssetUrl(assetId),
    assetId: assetId ?? "",
  };
}

/** Play a cut when either the resolved URL or the authored assetId changes. */
export function shouldPlayAssetTransition(
  prev: SceneIdentity | null,
  next: SceneIdentity,
): boolean {
  if (!prev) return true;
  return prev.url !== next.url || prev.assetId !== next.assetId;
}

export function parseTransition(
  raw?: string,
): SceneTransitionName | null {
  if (raw === "fade" || raw === "soft-zoom" || raw === "dip-to-black") {
    return raw;
  }
  return null;
}

/** 0.4.7-feel authored camera words → shipped motion primitives. */
const CAMERA_ALIASES: Record<string, SceneCameraName> = {
  wide: "kenburns-up",
  medium: "kenburns",
  close: "kenburns-right",
  long_then_cut: "kenburns-left",
  over_shoulder: "kenburns-left",
  extreme_close: "breathe",
  wide_split: "kenburns-up",
  insert: "hold",
  close_hands: "breathe",
  medium_danger: "kenburns-right",
};

/** 0.4.7-feel authored fx words → shipped overlays. Unknown → default vignette. */
const FX_ALIASES: Record<string, SceneFxName> = {
  warm_dust: "warm-tint",
  dual_focus: "soft-light",
  close_whisper: "vignette",
  corridor_heat: "warm-tint",
  afterimage: "soft-light",
  breath: "warm-tint",
  hair_brush: "warm-tint",
  party_split: "vignette",
  door_shadow: "vignette",
  flash_afterglow: "warm-tint",
  phone_glow: "soft-light",
  tension_hold: "vignette",
  danger_glance: "warm-tint",
};

export function parseCamera(raw?: string): SceneCameraName | null {
  if (
    raw === "hold" ||
    raw === "kenburns" ||
    raw === "breathe" ||
    raw === "kenburns-right" ||
    raw === "kenburns-left" ||
    raw === "kenburns-up"
  ) {
    return raw;
  }
  if (raw && raw in CAMERA_ALIASES) {
    return CAMERA_ALIASES[raw]!;
  }
  return null;
}

export function parseFx(raw?: string): SceneFxName | null {
  if (
    raw === "none" ||
    raw === "vignette" ||
    raw === "warm-tint" ||
    raw === "soft-light"
  ) {
    return raw;
  }
  if (raw && raw in FX_ALIASES) {
    return FX_ALIASES[raw]!;
  }
  return null;
}

/**
 * Missing / unknown `transition` cycles the three shipped cuts
 * so investor play still moves even when the fixture omits `transition`.
 */
export function selectAssetChangeTransition(options: {
  explicit?: string;
  changeCount: number;
}): SceneTransitionName {
  return (
    parseTransition(options.explicit) ??
    SCENE_TRANSITIONS[
      Math.abs(options.changeCount) % SCENE_TRANSITIONS.length
    ]!
  );
}

/**
 * Same resolved art across consecutive lines: cycle Ken Burns /
 * breathe so ≥3 holds never stay a dead still. `camera: "hold"`
 * freezes the plate; other explicit cameras stick or cycle KB.
 */
export function selectSameAssetMotion(options: {
  explicitCamera?: string;
  holdCount: number;
}): SceneMotion {
  const camera = parseCamera(options.explicitCamera);
  const hold = Math.max(0, options.holdCount);

  if (camera === "hold") return "hold";
  if (camera === "breathe") return "breathe";
  if (
    camera === "kenburns-right" ||
    camera === "kenburns-left" ||
    camera === "kenburns-up"
  ) {
    return camera;
  }
  if (camera === "kenburns") {
    const ken = ["kenburns-right", "kenburns-left", "kenburns-up"] as const;
    return ken[hold % ken.length]!;
  }
  return SAME_ASSET_MOTIONS[hold % SAME_ASSET_MOTIONS.length]!;
}

export function selectSceneFx(options: { explicit?: string }): SceneFxName {
  return parseFx(options.explicit) ?? DEFAULT_SCENE_FX;
}

/**
 * Line hooks override the node. Beat 0 is the node `text` (if any),
 * then `lines[]`. Missing fields stay undefined so callers apply defaults.
 */
export function presentationHooksForBeat(
  node: ContentNode,
  beatIndex: number,
): ScenePresentationHooks {
  const inherited: ScenePresentationHooks = {
    transition: node.transition,
    camera: node.camera,
    fx: node.fx,
  };
  const lineIndex = node.text ? beatIndex - 1 : beatIndex;
  if (lineIndex < 0) return inherited;
  const line = node.lines?.[lineIndex];
  if (!line) return inherited;
  return {
    transition: line.transition ?? inherited.transition,
    camera: line.camera ?? inherited.camera,
    fx: line.fx ?? inherited.fx,
  };
}

export function resolveScenePresentation(
  node: ContentNode,
  beatIndex: number,
  options: { changeCount: number; holdCount: number },
): {
  transition: SceneTransitionName;
  motion: SceneMotion;
  fx: SceneFxName;
} {
  const hooks = presentationHooksForBeat(node, beatIndex);
  return {
    transition: selectAssetChangeTransition({
      explicit: hooks.transition,
      changeCount: options.changeCount,
    }),
    motion: selectSameAssetMotion({
      explicitCamera: hooks.camera,
      holdCount: options.holdCount,
    }),
    fx: selectSceneFx({ explicit: hooks.fx }),
  };
}
