import type { ContentFile, ContentNode } from "./types";
import raw from "../content/CONTENT-ch01-free-to-firstsub.json";

export const content = raw as ContentFile;

export type CompiledRoute = {
  content: ContentFile;
  nodes: Map<string, ContentNode>;
  entryNodeId: string;
  firstSubNodeId: string;
  choiceIndexHardCap: number;
  gateField: string;
};

export function compileRoute(file: ContentFile = content): CompiledRoute {
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
  return {
    content: file,
    nodes,
    entryNodeId: stage.entryNodeId,
    firstSubNodeId: file.meta.firstSubNodeId,
    choiceIndexHardCap: file.meta.choiceIndexHardCap,
    gateField: file.meta.gateField,
  };
}

export const route = compileRoute();

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
