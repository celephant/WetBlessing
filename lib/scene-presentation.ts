import { resolveAssetUrl } from "./assets";
import { selectCropName, type CropName } from "./camera-crops";
import {
  detectIntimateBeat,
  intimateBeatSpec,
  intimateFallbackCamera,
  isIntimateForcedCut,
  SOFT_ZOOM_CROP_MS,
  type IntimateBeatId,
} from "./feel-density";
import { isWallGate } from "./paywall-copy";
import { tokens } from "./tokens";
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

const TOKEN_CUT: Record<string, SceneTransitionName> = {
  fade: "fade",
  softZoom: "soft-zoom",
  dip: "dip-to-black",
  "soft-zoom": "soft-zoom",
  "dip-to-black": "dip-to-black",
};

export function tokenCut(name: string): SceneTransitionName {
  return TOKEN_CUT[name] ?? "fade";
}

export const TRANSITION_MS: Record<SceneTransitionName, number> = {
  fade: tokens.transitions.fade.ms,
  "soft-zoom": tokens.transitions.softZoom.ms,
  "dip-to-black": tokens.transitions.dip.ms,
};

/**
 * Design Lead lock — sourced from `content/UI-tokens.json` v1.1.1
 * (`motion` / `transitions` / `grade` / `intimateBeats`).
 */
export const MOTION_SPEC = {
  dialogMs: tokens.motion.dialogMs,
  dialogContinueMs: tokens.motion.dialogContinueMs,
  dialogEase: tokens.motion.dialogEase,
  dialogFromY: tokens.motion.dialogFromY,
  dialogContinueFromY: tokens.motion.dialogContinueFromY,
  nameplateDelayMs: tokens.motion.nameplateDelayMs,
  nameplateMs: tokens.motion.nameplateMs,
  choiceMs: tokens.motion.choiceMs,
  choiceStaggerMs: tokens.motion.choiceStaggerMs,
  choiceFromY: tokens.motion.choiceFromY,
  choiceFromScale: tokens.motion.choiceFromScale,
  goldSweepMs: tokens.motion.goldSweepMs,
  paywallChipDelayMs: tokens.motion.paywallChipDelayMs,
  kenBurnsMs: tokens.motion.kenBurnsMs,
  kenBurnsScale: tokens.motion.kenBurnsScale,
  breatheMs: tokens.motion.breatheMs,
  breatheScale: tokens.motion.breatheScale,
  dipMs: tokens.transitions.dip.ms,
  dipInMs: tokens.transitions.dip.inMs,
  dipHoldMs: tokens.transitions.dip.holdMs,
  dipOutMs: tokens.transitions.dip.outMs,
  dipOverlay: tokens.transitions.dip.overlay,
  softZoomOldScaleTo: tokens.transitions.softZoom.oldScaleTo,
  softZoomNewScaleFrom: tokens.transitions.softZoom.newScaleFrom,
  softZoomFocusY: tokens.transitions.softZoom.focusY,
  /** Same-asset camera-only cut. Spec: ≤280ms, no hard cut / no dip. */
  softZoomCropMs: SOFT_ZOOM_CROP_MS,
} as const;

export const CROP_CUT_TRANSITION = "soft-zoom-crop" as const;
export type CropCutTransition = typeof CROP_CUT_TRANSITION;

export function cutDurationMs(
  name: SceneTransitionName | CropCutTransition,
): number {
  if (name === CROP_CUT_TRANSITION) return MOTION_SPEC.softZoomCropMs;
  return TRANSITION_MS[name];
}

export const DEFAULT_SCENE_FX: SceneFxName =
  tokens.grade.defaultIntimate === "warm" ? "warm-tint" : "vignette";

/** SMS / first-sub wall stay on night vignette, not warm intimate grade. */
export const NIGHT_GRADE_NODE_IDS = new Set([
  "n_sms_auto",
  "n_ch01_first_sub",
  "n_free_soft_exit",
  "n_pay_settle",
  "n_title",
]);

export function isNightGradeNode(nodeId?: string, gate?: string): boolean {
  if (isWallGate(gate)) return true;
  return Boolean(nodeId && NIGHT_GRADE_NODE_IDS.has(nodeId));
}

export function isPaywallWallNode(nodeId?: string, gate?: string): boolean {
  if (isWallGate(gate)) return true;
  return nodeId === tokens.paywall.nodeId || nodeId === "n_ch01_first_sub";
}

/** Free dialogue before a wall: motion + suggestive grade, never paid-gated. */
export function isFreePathFeel(nodeId?: string, gate?: string): boolean {
  return !isNightGradeNode(nodeId, gate) && !isPaywallWallNode(nodeId, gate);
}

/** Wall rhythm: dip → chips → gold yuan once → unlock softZoom. */
export const WALL_RHYTHM = {
  arrival: tokenCut(tokens.transitions.defaults.smsOrPaywall),
  afterPurchase: tokenCut(tokens.transitions.defaults.afterPurchase),
  goldOnlyOnYuan: tokens.paywall.goldOnlyOnYuan,
  forbidAllChipsGold: tokens.paywall.forbidAllChipsGold,
  chipEnterDelayMs: tokens.transitions.dip.ms,
  goldSweepDelayMs:
    tokens.transitions.dip.ms +
    tokens.motion.choiceMs +
    tokens.motion.paywallChipDelayMs,
} as const;

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

const CROP_CUT_ALIASES = new Set([
  "soft-zoom-crop",
  "softZoomCrop",
  "soft_zoom_crop",
]);

export function isCropCutTransition(
  raw?: string | null,
): raw is CropCutTransition {
  return raw === CROP_CUT_TRANSITION;
}

export function parseTransition(
  raw?: string,
): SceneTransitionName | CropCutTransition | null {
  if (!raw) return null;
  if (raw === "fade" || raw === "soft-zoom" || raw === "dip-to-black") {
    return raw;
  }
  if (raw === "softZoom" || raw === "soft_zoom") return "soft-zoom";
  if (raw === "dip" || raw === "dip_to_black") return "dip-to-black";
  if (CROP_CUT_ALIASES.has(raw)) return CROP_CUT_TRANSITION;
  return null;
}

/** Authored camera words. Plate motion is always hold; aliases only name the still. */
const CAMERA_ALIASES: Record<string, SceneCameraName> = {
  wide: "hold",
  medium: "hold",
  close: "hold",
  long_then_cut: "hold",
  over_shoulder: "hold",
  extreme_close: "hold",
  wide_split: "hold",
  insert: "hold",
  close_hands: "hold",
  close_hand: "hold",
  close_alt: "hold",
  close_collar: "hold",
  medium_danger: "hold",
  bust: "hold",
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
  grain: "warm-tint",
  breathe: "warm-tint",
  "warm-veil": "warm-tint",
  warm_veil: "warm-tint",
  "magenta-mist": "warm-tint",
  magenta_mist: "warm-tint",
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
    return "hold";
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

function intimateBeatTransition(
  beatId: IntimateBeatId | null,
): SceneTransitionName | null {
  const spec = intimateBeatSpec(beatId);
  return spec ? tokenCut(spec.transition) : null;
}

/**
 * Missing `transition` cycles fade / soft-zoom / dip.
 * Unknown strings degrade to soft-zoom (with breathe on the plate).
 */
export function selectAssetChangeTransition(options: {
  explicit?: string;
  changeCount: number;
  nodeId?: string;
  gate?: string;
  afterPurchase?: boolean;
  intimate?: boolean;
  intimateBeat?: boolean | IntimateBeatId | null;
}): SceneTransitionName | CropCutTransition {
  if (options.afterPurchase) {
    return tokenCut(tokens.transitions.defaults.afterPurchase);
  }
  if (isNightGradeNode(options.nodeId, options.gate)) {
    return tokenCut(tokens.transitions.defaults.smsOrPaywall);
  }
  const parsed = parseTransition(options.explicit);
  const unknownExplicit =
    Boolean(options.explicit) && !parsed;
  const beatId =
    typeof options.intimateBeat === "string" ? options.intimateBeat : null;
  if (options.intimateBeat) {
    if (isIntimateForcedCut(parsed)) return parsed;
    const fromTable = intimateBeatTransition(beatId);
    if (fromTable) return fromTable;
    return tokenCut(tokens.transitions.defaults.intimate);
  }
  if (parsed) return parsed;
  if (unknownExplicit) return TRANSITION_SOFT_ZOOM;
  if (options.intimate) {
    return tokenCut(tokens.transitions.defaults.intimate);
  }
  return SCENE_TRANSITIONS[
    Math.abs(options.changeCount) % SCENE_TRANSITIONS.length
  ]!;
}

/**
 * User lock: stills stay still. Optional one-shot appear lives on
 * assetId change (SceneArt fade/soft-zoom), not on same-asset holds.
 * Looping Ken Burns / breathe / crop-cycle is forbidden.
 */
export function selectSameAssetMotion(_options: {
  explicitCamera?: string;
  holdCount: number;
  allowHold?: boolean;
  intimateBeat?: boolean | IntimateBeatId | null;
  frozen?: boolean;
}): SceneMotion {
  return "hold";
}

export function selectSceneFx(options: {
  explicit?: string;
  nodeId?: string;
  gate?: string;
  forceNightGrade?: boolean;
  intimateBeat?: boolean | IntimateBeatId | null;
}): SceneFxName {
  // PhoneGlow stays off on SMS + paywall (night vignette only).
  if (
    options.forceNightGrade ||
    isNightGradeNode(options.nodeId, options.gate)
  ) {
    return "vignette";
  }
  // Free path (and any non-night beat): warmVeil + magentaMist, not adult red/black.
  // Authored dual_focus / close_whisper / etc. must not flatten this to a cold plate.
  if (options.intimateBeat || isFreePathFeel(options.nodeId, options.gate)) {
    return "warm-tint";
  }
  return parseFx(options.explicit) ?? DEFAULT_SCENE_FX;
}

export function phoneGlowAllowed(options: {
  nodeId?: string;
  gate?: string;
  forceNightGrade?: boolean;
}): boolean {
  return (
    !options.forceNightGrade && !isNightGradeNode(options.nodeId, options.gate)
  );
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
  options: {
    changeCount: number;
    holdCount: number;
    afterPurchase?: boolean;
    beforeChoices?: boolean;
  },
): {
  transition: SceneTransitionName | CropCutTransition;
  motion: SceneMotion;
  fx: SceneFxName;
  cropName: CropName;
  intimateBeat: IntimateBeatId | null;
} {
  const hooks = presentationHooksForBeat(node, beatIndex);
  const prevHooks =
    beatIndex > 0 ? presentationHooksForBeat(node, beatIndex - 1) : null;
  const cameraChanged = Boolean(
    prevHooks && hooks.camera && hooks.camera !== prevHooks.camera,
  );
  const intimateBeat = detectIntimateBeat({
    nodeId: node.nodeId,
    assetId: node.assetId,
    artCue: node.artCue,
    text: node.text,
  });
  const fx = selectSceneFx({
    explicit: hooks.fx,
    nodeId: node.nodeId,
    gate: node.gate,
    intimateBeat: Boolean(intimateBeat),
  });
  return {
    transition: selectAssetChangeTransition({
      explicit: hooks.transition,
      changeCount: options.changeCount,
      nodeId: node.nodeId,
      gate: node.gate,
      afterPurchase: options.afterPurchase,
      intimate: fx === "warm-tint",
      intimateBeat,
    }),
    motion: selectSameAssetMotion({
      explicitCamera: hooks.camera,
      holdCount: options.holdCount,
      allowHold: true,
      intimateBeat: Boolean(intimateBeat),
      frozen: options.beforeChoices,
    }),
    fx,
    cropName: selectCropName({
      explicitCamera: hooks.camera ?? intimateFallbackCamera(intimateBeat),
      holdCount: options.holdCount,
      lockCrop: true,
      beforeChoices: options.beforeChoices,
      cameraChanged,
    }),
    intimateBeat,
  };
}
