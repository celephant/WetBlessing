import { compileRoute, route, type CompiledRoute } from "./content";
import type { ContentFile, ContentNode, Stage } from "./types";

/** DEV-only fourweek pack. Never defaultAllow / never 0.5.0 player load. */
export const FOURWEEK_MINI_PATH = "content/CONTENT-fourweek-mini-0.5.0.json";
/** DEV-only Ch02 cafeteria + Reina office. Never defaultAllow. */
export const CH02_OFFICE_PATH = "content/CONTENT-ch02-office.json";
export const CH02_OFFICE_VERSION = "0.5.1-ch02-office";
export const CH02_OFFICE_ROUTE_ID = "route_kai_ch02";
export const FOURWEEK_WEEK_PATHS = [
  "content/CONTENT-w2-tug-draft.json",
  "content/CONTENT-w3-edge-draft.json",
  "content/CONTENT-w4-close-draft.json",
] as const;

export const CLIMAX_WEBP_PATHS = [
  "public/assets/scenes/w2/n_w2_almost_kiss.webp",
  "public/assets/scenes/w2/n_w2_door_gap.webp",
  "public/assets/scenes/w3/n_w3_door_lock_hand.webp",
  "public/assets/scenes/w3/n_w3_sleepover_edge.webp",
  "public/assets/scenes/w3/n_w3_vanessa_dm.webp",
  "public/assets/scenes/w4/n_w4_morning_light.webp",
] as const;

export function isFourweekPack(pack?: string | null): boolean {
  const value = (pack ?? "").trim().toLowerCase();
  return (
    value === "fourweek" ||
    value === "fourweek-mini" ||
    value === "0.5.0" ||
    value === "content-fourweek"
  );
}

export function isCh02Pack(pack?: string | null): boolean {
  const value = (pack ?? "").trim().toLowerCase();
  return (
    value === "ch02" ||
    value === "ch02-office" ||
    value === "0.5.1-ch02-office" ||
    value === "content-ch02"
  );
}

export function playPackId(pack?: string | null): "fourweek" | "ch02" | "default" {
  if (isCh02Pack(pack)) return "ch02";
  if (isFourweekPack(pack)) return "fourweek";
  return "default";
}

function flattenDevStages(file: ContentFile): ContentFile {
  const stages = file.stages ?? [];
  const byId = new Map(stages.map((stage) => [stage.stageId, stage]));
  const nodes: ContentNode[] = [];
  for (const stage of stages) {
    for (const node of stage.nodes) {
      const copy: ContentNode = { ...node };
      if (copy.nextStageId) {
        const dest = byId.get(copy.nextStageId);
        if (dest) {
          copy.advance = dest.entryNodeId;
          if (copy.type === "settle") copy.type = "dialogue";
        }
      }
      nodes.push(copy);
    }
  }
  const entry: Stage = {
    stageId: stages[0]?.stageId ?? "stage_fourweek_dev",
    stageTitle: stages[0]?.stageTitle ?? file.routeTitle,
    order: 1,
    entryNodeId: stages[0]?.entryNodeId ?? nodes[0]?.nodeId ?? "",
    nodes,
  };
  return {
    ...file,
    personas: file.personas ?? {},
    meta: {
      ...file.meta,
      choiceIndexHardCap: file.meta?.choiceIndexHardCap ?? 16,
      firstSubNodeId: file.meta?.firstSubNodeId ?? "n_w3_edge_lock_mia",
      gateField: file.meta?.gateField ?? "first_sub",
    },
    stages: [entry],
  };
}

/** Compile a DEV pack. Never assertDefaultLoad. Fourweek flattens w1–w4. */
export function compileDevPack(file: ContentFile): CompiledRoute {
  return compileRoute(flattenDevStages(file));
}

export function resolvePlayRoute(
  pack: string | null | undefined,
  fourweek: ContentFile | null,
  ch02: ContentFile | null = null,
): CompiledRoute | "missing-fourweek" | "missing-ch02" {
  if (isCh02Pack(pack)) {
    if (!ch02) return "missing-ch02";
    return compileRoute(ch02);
  }
  if (!isFourweekPack(pack)) return route;
  if (!fourweek) return "missing-fourweek";
  return compileDevPack(fourweek);
}
