import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCENE_FALLBACK,
  resolveAssetPath,
  resolveAssetUrl,
  SHIPPED_CH01_SCENE_WEBPS,
} from "../lib/assets";
import { listNodes, content } from "../lib/content";

const root = path.resolve(__dirname, "..");
const ch01Dir = path.join(root, "public/assets/scenes/ch01");

function publicFileForUrl(url: string): string {
  expect(url.startsWith("/assets/")).toBe(true);
  return path.join(root, "public", url.slice(1));
}

describe("wired 0.4.8-feel-hot assets", () => {
  it("ships ready scene webps under public/", () => {
    const ready = content.meta.artReady ?? [];
    expect(ready.length).toBeGreaterThan(0);

    for (const node of listNodes()) {
      if (!node.assetId) continue;
      const readyish =
        node.artStatus === "ready" || (node.artStatus ?? "").startsWith("ready_");
      if (!readyish) continue;
      const file = path.join(root, "public", node.assetId);
      expect(existsSync(file), `missing ready asset ${node.assetId}`).toBe(true);
    }
  });

  it("ships character refsheets", () => {
    for (const who of ["kai", "mia", "jade", "vanessa"]) {
      expect(
        existsSync(path.join(root, "public/assets/characters", who, "refsheet.png")),
      ).toBe(true);
    }
  });

  it("lists only scene webps that exist on disk", () => {
    const onDisk = readdirSync(ch01Dir)
      .filter((name) => name.endsWith(".webp"))
      .map((name) => name.replace(/\.webp$/, ""))
      .sort();
    expect([...SHIPPED_CH01_SCENE_WEBPS].sort()).toEqual(onDisk);
  });

  it("resolves every Ch01 assetId to an existing public file after fallback", () => {
    const nodes = listNodes();
    expect(nodes.some((node) => node.assetId)).toBe(true);

    for (const node of nodes) {
      if (!node.assetId) continue;
      const url = resolveAssetUrl(node.assetId);
      expect(url.startsWith("/assets/"), `${node.nodeId} url ${url}`).toBe(true);
      expect(
        existsSync(publicFileForUrl(url)),
        `fallback missing for ${node.nodeId} ${node.assetId} → ${url}`,
      ).toBe(true);
    }
  });

  it("maps missing stems to the nearest shipped webp with a leading slash", () => {
    expect(resolveAssetUrl("assets/scenes/ch01/n_open.webp")).toBe(
      "/assets/scenes/ch01/n_see_both.webp",
    );
    expect(resolveAssetUrl("/assets/scenes/ch01/n_jade_desk.webp")).toBe(
      "/assets/scenes/ch01/n_see_both.webp",
    );
    expect(resolveAssetUrl("assets/scenes/ch01/n_dodge_corridor.webp")).toBe(
      "/assets/scenes/ch01/n_see_both.webp",
    );
    expect(resolveAssetUrl("assets/scenes/ch01/n_with_a.webp")).toBe(
      "/assets/scenes/ch01/n_mia_edge_1.webp",
    );
    expect(resolveAssetUrl("assets/scenes/ch01/n_with_mia.webp")).toBe(
      "/assets/scenes/ch01/n_mia_edge_1.webp",
    );
    expect(resolveAssetUrl("assets/scenes/ch01/n_with_jade.webp")).toBe(
      "/assets/scenes/ch01/n_conflict.webp",
    );
    expect(resolveAssetUrl("assets/scenes/ch01/n_pay_settle.webp")).toBe(
      "/assets/scenes/ch01/n_see_both.webp",
    );
    expect(resolveAssetUrl("assets/scenes/ch01/n_see_both.webp")).toBe(
      "/assets/scenes/ch01/n_see_both.webp",
    );
    expect(resolveAssetUrl("assets/scenes/ch01/n_mia_edge_1.webp")).toBe(
      "/assets/scenes/ch01/n_mia_edge_1.webp",
    );
    expect(resolveAssetUrl(undefined)).toBe(`/${DEFAULT_SCENE_FALLBACK}`);
    expect(resolveAssetPath("assets/scenes/ch01/n_open.webp")).toBe(
      "assets/scenes/ch01/n_see_both.webp",
    );
  });
});
