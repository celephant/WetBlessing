import type { AssetManifest, AssetRecord } from "./types";
import manifestJson from "../content/assets.manifest.json";
import { story } from "./content";

export const assetManifest = manifestJson as AssetManifest;

const assetsById = new Map<string, AssetRecord>(
  assetManifest.images.map((image) => [image.id, image]),
);

export function getAsset(assetKey: string): AssetRecord {
  const asset = assetsById.get(assetKey);
  if (!asset) {
    throw new Error(`Unknown asset key: ${assetKey}`);
  }
  return asset;
}

export function resolveAssetPath(assetKey?: string | null): string {
  if (!assetKey) {
    throw new Error("Missing asset key");
  }
  return getAsset(assetKey).path;
}

export function resolveAssetUrl(assetKey?: string | null): string {
  const rel = resolveAssetPath(assetKey);
  return rel.startsWith("/") ? rel : `/${rel}`;
}

export function storyNodeAssetKey(nodeId: string): string {
  const node = story.nodes.find((item) => item.id === nodeId);
  if (!node) throw new Error(`Unknown node: ${nodeId}`);
  return node.assetKey;
}

export const ENTRY_ASSET_KEY = story.nodes.find((node) => node.id === story.entry)?.assetKey ?? "";
