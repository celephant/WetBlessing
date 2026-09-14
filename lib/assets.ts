import { content } from "./content";
import type { ContentFile } from "./types";

/** Paid / reused CGs whose filename is not `${nodeId}.webp`. Look up `assetId`, never nodeId. */
export function chapterAssetAliases(
  file: ContentFile = content,
): Record<string, string> {
  const aliases: Record<string, string> = {};
  for (const node of file.stages[0]?.nodes ?? []) {
    if (!node.assetId) continue;
    const base = node.assetId.split("/").pop()?.replace(/\.[^.]+$/, "");
    if (base && base !== node.nodeId) {
      aliases[node.nodeId] = node.assetId;
    }
  }
  return aliases;
}
