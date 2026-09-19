import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { story } from "../lib/content";
import { orientedStill, portraitStillPath } from "../lib/orientation-stills";

const root = path.resolve(__dirname, "..");

describe("mobile portrait inventory", () => {
  it("uses authored portraitPairs only and never swaps action-mismatch", () => {
    const invitation = story.nodes.find((node) => node.id === "scene.invitation")!;
    const invited = orientedStill(invitation.assetKey);
    expect(invited.pair).toBe("paired");
    expect(invited.portraitUrl).toBe("/media/ch01-portrait/C1-J1-portrait.png");
    expect(existsSync(path.join(root, "public", invited.portraitUrl!.slice(1)))).toBe(true);

    const mismatch = story.portraitPairs.find((pair) => pair.assessment === "action-mismatch")!;
    expect(mismatch.landscapeId).toBe("asset.image.064");
    expect(mismatch.neverSwap).toBe(true);
    expect(portraitStillPath(mismatch.landscapeId)).toBeNull();
    expect(orientedStill(mismatch.landscapeId).pair).toBe("landscape-only");

    const unpaired = story.nodes.filter(
      (node) => !story.portraitPairs.some((pair) => pair.landscapeId === node.assetKey),
    );
    expect(unpaired.length).toBe(19);
    for (const node of unpaired) {
      expect(portraitStillPath(node.assetKey), node.id).toBeNull();
    }

    const filenameGuess = portraitStillPath("title-portrait");
    expect(filenameGuess).toBeNull();
  });

  it("does not invent a portrait for a node that has no pair", () => {
    const heatWithoutPair = story.nodes.find((node) => node.id === "scene.mia.cable")!;
    expect(heatWithoutPair.heatInventoryTag).toBe(true);
    expect(orientedStill(heatWithoutPair.assetKey).portraitUrl).toBeNull();
  });
});
