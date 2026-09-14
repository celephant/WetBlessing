import { getNode } from "./content";
import {
  createInitialState,
  resolveAdvance,
  shouldAutoSkip,
  takeChoice,
  visibleChoices,
} from "./engine";
import type { ContentFile, EngineState } from "./types";

export interface PathToGate {
  choiceIds: string[];
  nodeIds: string[];
  choiceIndex: number;
}

/**
 * Walk every player-visible branch until the first_sub gate.
 * Auto `advance` / `advanceByFlag` hops do not increment choiceIndex.
 */
export function pathsToFirstSub(source: ContentFile): PathToGate[] {
  const gateId = source.meta.firstSubNodeId;
  const results: PathToGate[] = [];

  const visit = (state: EngineState, choiceIds: string[], nodeIds: string[]) => {
    let cursor = state;
    const seen = new Set<string>();

    while (!seen.has(cursor.nodeId)) {
      seen.add(cursor.nodeId);
      if (cursor.nodeId === gateId) {
        results.push({
          choiceIds,
          nodeIds: [...nodeIds, cursor.nodeId],
          choiceIndex: cursor.choiceIndex,
        });
        return;
      }

      const node = getNode(source, cursor.nodeId);
      if (shouldAutoSkip(node) || node.type === "settle") {
        const dest = resolveAdvance(cursor, node);
        if (!dest) return;
        cursor = { ...cursor, nodeId: dest, lineIndex: 0 };
        continue;
      }

      const choices = visibleChoices(cursor, node);
      if (choices.length > 0) {
        for (const choice of choices) {
          if (choice.requiresEntitlement) continue;
          const next = takeChoice(cursor, source, choice);
          visit(next, [...choiceIds, choice.choiceId], [...nodeIds, cursor.nodeId]);
        }
        return;
      }

      const dest = resolveAdvance(cursor, node);
      if (!dest) return;
      cursor = { ...cursor, nodeId: dest, lineIndex: 0 };
    }
  };

  visit(createInitialState(source), [], []);
  return results;
}
