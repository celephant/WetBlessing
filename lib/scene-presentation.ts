import { resolveAssetUrl } from "./assets";
import { selectCropName, type CropName } from "./camera-crops";
import {
  detectIntimateBeat,
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

export function parseTransition(
  raw?: string,
): SceneTransitionName | null {
  if (raw === "fade" || raw === "soft-zoom" || raw === "dip-to-black") {
    return raw;
  }
  if (raw === "softZoom" || raw === "soft_zoom") return "soft-zoom";
  if (raw === "dip" || raw === "dip_to_black") return "dip-to-black";
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

function intimateBeatTransition(
  beatId: IntimateBeatId | null,
): SceneTransitionName | null {
  if (!beatId) return null;
  const table = tokens.intimateBeats;
  const spec =
    beatId === "near_miss"
      ? table.near_miss
      : beatId === "door_lock"
        ? table.door_lock
        : beatId === "sleepover_edge"
          ? table.sleepover_edge
          : beatId === "vanessa_close"
            ? table.vanessa_close
            : beatId === "morning_light"
              ? table.morning_light
              : null;
  return spec ? tokenCut(spec.transition) : null;
}

/**
 * Missing / unknown `transition` cycles the three shipped cuts
 * so investor play still moves even when the fixture omits `transition`.
 */
export function selectAssetChangeTransition(options: {
  explicit?: string;
  changeCount: number;
  nodeId?: string;
  gate?: string;
  afterPurchase?: boolean;
  intimate?: boolean;
  intimateBeat?: boolean | IntimateBeatId | null;
}): SceneTransitionName {
  if (options.afterPurchase) {
    return tokenCut(tokens.transitions.defaults.afterPurchase);
  }
  if (isNightGradeNode(options.nodeId, options.gate)) {
    return tokenCut(tokens.transitions.defaults.smsOrPaywall);
  }
  const parsed = parseTransition(options.explicit);
  const beatId =
    typeof options.intimateBeat === "string" ? options.intimateBeat : null;
  if (options.intimateBeat) {
    if (isIntimateForcedCut(parsed)) return parsed;
    const fromTable = intimateBeatTransition(beatId);
    if (fromTable) return fromTable;
    return tokenCut(tokens.transitions.defaults.intimate);
  }
  if (parsed) return parsed;
  if (options.intimate) {
    return tokenCut(tokens.transitions.defaults.intimate);
  }
  return SCENE_TRANSITIONS[
    Math.abs(options.changeCount) % SCENE_TRANSITIONS.length
  ]!;
}

/**
 * Same resolved art across consecutive lines: cycle Ken Burns /
 * breathe so ≥3 holds never stay a dead still. `camera: "hold"`
 * freezes the plate; other explicit cameras stick or cycle KB.
 */
export function selectSameAssetMotion(options: {
  explicitCamera?: string;
  holdCount: number;
  allowHold?: boolean;
  intimateBeat?: boolean | IntimateBeatId | null;
}): SceneMotion {
  const camera = parseCamera(options.explicitCamera);
  const hold = Math.max(0, options.holdCount);
  if (options.intimateBeat && !camera) {
    return "breathe";
  }
  if (options.explicitCamera && !camera) {
    return "breathe";
  }

  if (camera === "hold") {
    return options.allowHold
      ? "hold"
      : SAME_ASSET_MOTIONS[hold % SAME_ASSET_MOTIONS.length]!;
  }
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
  transition: SceneTransitionName;
  motion: SceneMotion;
  fx: SceneFxName;
  cropName: CropName;
  intimateBeat: IntimateBeatId | null;
} {
  const hooks = presentationHooksForBeat(node, beatIndex);
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
      allowHold: !isFreePathFeel(node.nodeId, node.gate),
      intimateBeat: Boolean(intimateBeat),
    }),
    fx,
    cropName: selectCropName({
      explicitCamera: hooks.camera,
      holdCount: options.holdCount,
      lockCrop: isNightGradeNode(node.nodeId, node.gate),
      beforeChoices: options.beforeChoices,
    }),
    intimateBeat,
  };
}
