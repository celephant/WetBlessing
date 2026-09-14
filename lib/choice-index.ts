import { isWallGate } from "./paywall-copy";
import type { CompiledRoute, ContentNode, FlagValue, Flags } from "./types";

export function isWallNode(node: ContentNode, compiled: CompiledRoute): boolean {
  return (
    isWallGate(node.gate) ||
    node.gate === compiled.gateField ||
    node.nodeId === compiled.firstSubNodeId
  );
}

/** ≥2-way branches and the first_sub wall count. continue / advance do not. */
export function countsTowardChoiceIndex(
  node: ContentNode,
  compiled: CompiledRoute,
): boolean {
  if (isWallNode(node, compiled)) return true;
  return (node.choices?.length ?? 0) >= 2;
}

export type ChoiceIndexPath = {
  nodes: string[];
  choiceIndex: number;
  sawGate: boolean;
};

function nodeOf(compiled: CompiledRoute, nodeId: string): ContentNode {
  const node = compiled.nodes.get(nodeId);
  if (!node) {
    throw new Error(`Unknown node: ${nodeId}`);
  }
  return node;
}

function matchExpr(flags: Flags, expr: string): boolean {
  const idx = expr.indexOf("==");
  if (idx === -1) return Boolean(flags[expr.trim()]);
  const key = expr.slice(0, idx).trim();
  const value = expr.slice(idx + 2).trim();
  return String(flags[key] ?? "") === value;
}

function resolveLinear(node: ContentNode, flags: Flags): string | null {
  if (node.advanceByFlag) {
    for (const [expr, dest] of Object.entries(node.advanceByFlag)) {
      if (matchExpr(flags, expr)) return dest;
    }
    return null;
  }
  return node.advance ?? null;
}

function choiceVisible(
  required: Record<string, FlagValue> | undefined,
  flags: Flags,
): boolean {
  if (!required) return true;
  return Object.entries(required).every(([key, value]) => flags[key] === value);
}

/**
 * Exhaustive path walk used as the all-path choiceIndex script.
 * Compile fails if any path exceeds the hard cap before a gate.
 */
export function walkChoiceIndexPaths(compiled: CompiledRoute): ChoiceIndexPath[] {
  const paths: ChoiceIndexPath[] = [];

  const visit = (
    nodeId: string,
    flags: Flags,
    choiceIndex: number,
    sawGate: boolean,
    trail: string[],
  ): void => {
    const node = nodeOf(compiled, nodeId);
    const nextFlags = { ...flags, ...(node.setFlags ?? {}) };
    const counts = countsTowardChoiceIndex(node, compiled);
    const nextIndex = counts ? choiceIndex + 1 : choiceIndex;
    const nextGate = sawGate || isWallNode(node, compiled);

    if (nextIndex > compiled.choiceIndexHardCap && !nextGate) {
      throw new Error(
        `compile fail: choiceIndex ${nextIndex} > ${compiled.choiceIndexHardCap} without gate (${[...trail, nodeId].join(" > ")})`,
      );
    }
    if (isWallNode(node, compiled) && nextIndex > compiled.choiceIndexHardCap) {
      throw new Error(
        `compile fail: first_sub wall at choiceIndex ${nextIndex} > ${compiled.choiceIndexHardCap} (${[...trail, nodeId].join(" > ")})`,
      );
    }

    if (node.playerVisible === false) {
      const hop = resolveLinear(node, nextFlags);
      if (!hop) {
        throw new Error(`Hidden node ${node.nodeId} has no next`);
      }
      visit(hop, nextFlags, nextIndex, nextGate, [...trail, nodeId]);
      return;
    }

    if (isWallNode(node, compiled) || node.type === "settle") {
      paths.push({
        nodes: [...trail, nodeId],
        choiceIndex: nextIndex,
        sawGate: nextGate,
      });
      return;
    }

    if (node.choices && node.choices.length > 0) {
      const visible = node.choices.filter((choice) =>
        choiceVisible(choice.requires?.flags, nextFlags),
      );
      for (const choice of visible) {
        const after = { ...nextFlags, ...(choice.setFlags ?? {}) };
        visit(choice.next, after, nextIndex, nextGate, [...trail, nodeId]);
      }
      return;
    }

    const hop = resolveLinear(node, nextFlags);
    if (!hop) {
      paths.push({
        nodes: [...trail, nodeId],
        choiceIndex: nextIndex,
        sawGate: nextGate,
      });
      return;
    }
    visit(hop, nextFlags, nextIndex, nextGate, [...trail, nodeId]);
  };

  visit(compiled.entryNodeId, {}, 0, false, []);
  return paths;
}

export function assertChoiceIndexBudget(compiled: CompiledRoute): ChoiceIndexPath[] {
  return walkChoiceIndexPaths(compiled);
}
