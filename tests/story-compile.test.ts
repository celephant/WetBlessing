import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compiledStory, STORY_PUBLICATION_PATH, STORY_SOURCE_PATH, story } from "../lib/content";
import { getAsset } from "../lib/assets";
import { walkAllPaths } from "../lib/engine";

const root = path.resolve(__dirname, "..");

describe("tomorrow.1 compile", () => {
  it("loads storyVersion tomorrow.1 from the unique source", () => {
    expect(story.storyVersion).toBe("tomorrow.1");
    expect(story.documentType).toBe("runtime-story");
    expect(story.entry).toBe("scene.invitation");
    expect(compiledStory.entryNodeId).toBe("scene.invitation");
    expect(compiledStory.nodes.size).toBe(83);
    expect(story.commercial.enabled).toBe(false);
    expect(story.commercial.login.enabled).toBe(false);
    expect(story.commercial.purchase.enabled).toBe(false);
    expect(story.portraitPolicy.automaticSwapEnabled).toBe(false);
  });

  it("keeps source and publication in parity", () => {
    const source = JSON.parse(readFileSync(path.join(root, STORY_SOURCE_PATH), "utf8"));
    const published = JSON.parse(readFileSync(path.join(root, STORY_PUBLICATION_PATH), "utf8"));
    expect(published).toEqual(source);
  });

  it("resolves every next, choice target, and ending terminal", () => {
    for (const node of story.nodes) {
      if (node.next) expect(compiledStory.nodes.has(node.next), node.next).toBe(true);
      for (const choice of node.choices) {
        expect(compiledStory.nodes.has(choice.target), choice.target).toBe(true);
      }
      getAsset(node.assetKey);
      expect(existsSync(path.join(root, "public", node.assetPath))).toBe(true);
    }
    for (const ending of story.endings) {
      expect(ending.terminalNode).toBe("scene.sunset.ending");
    }
  });

  it("rejects unknown jumps", () => {
    expect(compiledStory.nodes.has("n_open")).toBe(false);
    expect(compiledStory.nodes.has("scene.missing")).toBe(false);
  });

  it("keeps 2-3 beats, thoughts as same-click replacements, and 22 heat placements", () => {
    for (const node of story.nodes) {
      expect(node.beats.length).toBeGreaterThanOrEqual(2);
      expect(node.beats.length).toBeLessThanOrEqual(3);
      for (const variation of node.beatVariations) {
        expect(variation.beatIndex).toBeLessThan(node.beats.length);
      }
    }
    expect(story.nodes.filter((node) => node.heatInventoryTag)).toHaveLength(22);
    expect(story.nodes.flatMap((node) => node.beatVariations)).toHaveLength(11);
  });

  it("never auto-swaps portraits, especially action-mismatch", () => {
    expect(story.nodes.every((node) => !node.presentation.automaticPortraitSwapEnabled)).toBe(true);
    expect(story.portraitPairs.every((pair) => pair.enabled === false)).toBe(true);
    const mismatch = story.portraitPairs.find((pair) => pair.assessment === "action-mismatch");
    expect(mismatch?.landscapeId).toBe("asset.image.064");
    expect(mismatch?.portraitId).toBe("asset.image.100");
    expect(mismatch?.neverSwap).toBe(true);
    const extra = story.portraitPolicy.extraArmPendingNodes;
    expect(extra).toEqual(["scene.jade.stair.kiss", "scene.jade.stair.stay"]);
    expect(compiledStory.nodes.get("scene.jade.stair.kiss")?.extraArmPending).toBe(true);
  });

  it("matches original SHA-256 for every image and the font", () => {
    const manifest = JSON.parse(readFileSync(path.join(root, "content/assets.manifest.json"), "utf8"));
    for (const asset of [...manifest.images, ...manifest.supportFiles]) {
      const digest = createHash("sha256")
        .update(readFileSync(path.join(root, "public", asset.path)))
        .digest("hex");
      expect(digest, asset.path).toBe(asset.sha256);
    }
  });

  it("walks 192 paths to four endings with exclusive routes", () => {
    const paths = walkAllPaths();
    expect(paths).toHaveLength(192);
    expect(new Set(paths.map((item) => item.ending)).size).toBe(4);
    for (const result of paths) {
      expect(["jade", "mia", "vanessa", "self"]).toContain(result.route);
    }
  });
});
