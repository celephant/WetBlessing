import { enterNode, startGame } from "./engine";
import { route } from "./content";
import { SAVE_STORAGE_KEY, loadEntitlements } from "./entitlement";
import type { Beat, Flags, GameState } from "./types";

export const LANDING_FUNNEL_PATH = "content/CONTENT-landing-funnel.json";
export const LANDING_FUNNEL_VERSION = "0.5.4-landing-funnel";
export const LANDING_FUNNEL_ROUTE_ID = "route_kai_funnel";
export const FUNNEL_COMPLETED_KEY = "wb:slice0:funnel_completed";
export const CH01_HANDOFF_NODE = "n_sms_auto";

export type FunnelZone = "mia" | "jade" | "lina" | "rae";

export const FUNNEL_ZONE_LINES: Record<FunnelZone, Beat> = {
  mia: { speaker: "mia", text: "「还站中间干什么。」" },
  jade: { speaker: "jade", text: "「Kai。别动。就一张。」" },
  lina: { speaker: "lina", text: "「挡道。」" },
  rae: { speaker: "rae", text: "「……有人。」" },
};

type HotspotBox = { left: string; top: string; width: string; height: string };

/** Percent boxes over the art pane (above the 28% dock). */
export const FUNNEL_HOTSPOTS: Record<
  "landscape" | "portrait",
  Record<FunnelZone, HotspotBox>
> = {
  landscape: {
    mia: { left: "2%", top: "28%", width: "26%", height: "58%" },
    jade: { left: "24%", top: "8%", width: "28%", height: "52%" },
    lina: { left: "42%", top: "0%", width: "24%", height: "38%" },
    rae: { left: "62%", top: "18%", width: "36%", height: "70%" },
  },
  portrait: {
    lina: { left: "18%", top: "0%", width: "64%", height: "22%" },
    jade: { left: "16%", top: "20%", width: "68%", height: "22%" },
    mia: { left: "2%", top: "42%", width: "46%", height: "48%" },
    rae: { left: "50%", top: "42%", width: "48%", height: "48%" },
  },
};

/** Night-pool map plate (n_conflict). F1 is a wet close-up, not this map. */
const POOL_NODES = new Set([
  "n_funnel_02",
  "n_funnel_03",
  "n_funnel_03_take",
  "n_funnel_03_ask",
  "n_funnel_04",
  "n_funnel_04_take",
  "n_funnel_04_ask",
  "n_funnel_05",
  "n_funnel_05_take",
  "n_funnel_05_ask",
  "n_funnel_07",
]);

export function isFunnelPoolNode(nodeId: string): boolean {
  return POOL_NODES.has(nodeId);
}

export function isFunnelClockNode(nodeId: string): boolean {
  return nodeId === "n_funnel_01" || isFunnelPoolNode(nodeId) || nodeId.startsWith("n_funnel_06");
}

export function funnelZoneForNode(nodeId: string, flags: Flags): FunnelZone | null {
  const fromFlag = flags.funnel_zone;
  if (fromFlag === "mia" || fromFlag === "jade" || fromFlag === "lina" || fromFlag === "rae") {
    return fromFlag;
  }
  if (nodeId.startsWith("n_funnel_03")) return "mia";
  if (nodeId.startsWith("n_funnel_04")) return "jade";
  if (nodeId.startsWith("n_funnel_05")) return "lina";
  if (nodeId.startsWith("n_funnel_06")) return "rae";
  return null;
}

export function isFunnelAuthNode(nodeId: string): boolean {
  return nodeId === "n_funnel_10";
}

export function isFunnelLookNode(nodeId: string): boolean {
  return nodeId === "n_funnel_02";
}

export function isFunnelFlashNode(
  nodeId: string,
  _beatIndex: number,
  looked?: FunnelZone | null,
): boolean {
  return nodeId === "n_funnel_02" && looked === "jade";
}

export function readFunnelCompleted(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(FUNNEL_COMPLETED_KEY) === "1";
}

function stoodUpFlags(wentWith: string): Flags {
  const all = ["mia", "jade", "lina", "rae"] as const;
  const flags: Flags = { went_with: wentWith, funnel_completed: true };
  for (const who of all) {
    if (who !== wentWith) flags[`stood_up_${who}`] = true;
  }
  return flags;
}

export function handoffFunnelToCh01(funnelState: GameState): GameState {
  const wentWith = String(funnelState.flags.went_with ?? "none");
  const flags = stoodUpFlags(wentWith);
  const started = startGame(loadEntitlements(), route);
  const handed = enterNode(
    { ...started, flags: { ...started.flags, ...flags } },
    CH01_HANDOFF_NODE,
    route,
  );
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(handed));
    window.localStorage.setItem(FUNNEL_COMPLETED_KEY, "1");
    window.localStorage.removeItem(`${SAVE_STORAGE_KEY}:funnel`);
  }
  return handed;
}

export const FUNNEL_NOTICE = "另一条。学生事务。带学生证。没有照片。";
export const FUNNEL_AUTH_HINT = "注册后保存选择，看完整拼贴。约 10 秒完成。";
export const FUNNEL_AUTH_OK = "选择已保存。现在，打开那张照片。";
export const FUNNEL_AUTH_ERR = "还没填完。";

const FUNNEL_TAKE_BAR: Record<string, string> = {
  c_f3_take: "bg-mia",
  c_f4_take: "bg-jade",
  c_f5_take: "bg-mint",
  c_f6_take: "bg-hot",
};

export function funnelChipStyle(choiceId: string): {
  variant?: "jie" | "ghost";
  barClass?: string;
} {
  if (!choiceId.startsWith("c_f")) return {};
  if (choiceId.includes("_ask")) return { variant: "ghost" };
  const takeBar = FUNNEL_TAKE_BAR[choiceId];
  if (takeBar) return { variant: "jie", barClass: takeBar };
  if (
    choiceId === "c_f1_enter" ||
    choiceId === "c_f2_seen" ||
    choiceId.startsWith("c_f8_") ||
    choiceId === "c_f9_open"
  ) {
    return { variant: "jie" };
  }
  return {};
}
