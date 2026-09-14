import type { ContentFile, StoryNode } from "./types";
import raw from "@/content/CONTENT-ch01-free-to-firstsub.json";

export const content = raw as ContentFile;

export function indexNodes(source: ContentFile): Map<string, StoryNode> {
  const map = new Map<string, StoryNode>();
  for (const stage of source.stages) {
    for (const node of stage.nodes) {
      map.set(node.nodeId, node);
    }
  }
  return map;
}

export function entryNodeId(source: ContentFile): string {
  const stage = [...source.stages].sort((a, b) => a.order - b.order)[0];
  if (!stage) {
    throw new Error("content has no stages");
  }
  return stage.entryNodeId;
}

export function getNode(source: ContentFile, nodeId: string): StoryNode {
  const node = indexNodes(source).get(nodeId);
  if (!node) {
    throw new Error(`unknown node: ${nodeId}`);
  }
  return node;
}
