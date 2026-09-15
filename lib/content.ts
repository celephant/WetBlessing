import { assertDefaultLoad } from "./allowlist";
import { assertChoiceIndexBudget } from "./choice-index";
import { intimateBeatGaps } from "./feel-density";
import type { CompiledRoute, ContentFile, ContentNode } from "./types";
import raw from "../content/CONTENT-ch01-free-to-firstsub.json";

/** Canonical Ch01 (0.4.8-feel-hot). Also linked at src/content/chapters/ch01.json. */
export const DEFAULT_CH01_PATH = "content/CONTENT-ch01-free-to-firstsub.json";
export const DEFAULT_CH01_VERSION = "0.4.8-feel-hot";
export const DEFAULT_CH01_ROUTE_ID = "route_kai_ch01";

const rawDefault = raw as ContentFile;
assertDefaultLoad(rawDefault, DEFAULT_CH01_PATH);

export const content = rawDefault;

export type { CompiledRoute };

export function compileRoute(
  file: ContentFile = content,
  options: { asDefault?: boolean; sourcePath?: string } = {},
): CompiledRoute {
  if (options.asDefault) {
    assertDefaultLoad(file, options.sourcePath ?? DEFAULT_CH01_PATH);
  }
  const stage = file.stages[0];
  if (!stage) {
    throw new Error("Content file has no stages");
  }
  const nodes = new Map<string, ContentNode>();
  for (const node of stage.nodes) {
    if (nodes.has(node.nodeId)) {
      throw new Error(`Duplicate nodeId: ${node.nodeId}`);
    }
    nodes.set(node.nodeId, node);
  }
  const compiled = {
    content: file,
    nodes,
    entryNodeId: stage.entryNodeId,
    firstSubNodeId: file.meta.firstSubNodeId,
    choiceIndexHardCap: file.meta.choiceIndexHardCap,
    gateField: file.meta.gateField,
  };
  assertChoiceIndexBudget(compiled);
  // Optional audit only — never fails compile or default load.
  void intimateBeatGaps([...nodes.values()]);
  return compiled;
}

export const route = compileRoute(content, {
  asDefault: true,
  sourcePath: DEFAULT_CH01_PATH,
});

export function getNode(
  nodeId: string,
  compiled: CompiledRoute = route,
): ContentNode {
  const node = compiled.nodes.get(nodeId);
  if (!node) {
    throw new Error(`Unknown node: ${nodeId}`);
  }
  return node;
}

export function listNodes(compiled: CompiledRoute = route): ContentNode[] {
  return [...compiled.nodes.values()];
}
