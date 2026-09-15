import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CLIMAX_ART_STATUS, resolveAssetUrl } from "../lib/assets";
import { compileAllowlist, matchesDenyGlob } from "../lib/allowlist";
import { compileRoute, content, DEFAULT_CH01_VERSION } from "../lib/content";
import {
  CLIMAX_WEBP_PATHS,
  FOURWEEK_MINI_PATH,
  FOURWEEK_WEEK_PATHS,
  compileDevPack,
  isFourweekPack,
  resolvePlayRoute,
} from "../lib/dev-packs";
import { listInstalledFourweekDrafts, tryReadFourweekMini } from "../lib/dev-packs.node";
import { isWallGate, paywallCopyForGate, PAYWALL_EDGE_LOCK } from "../lib/paywall-copy";
import { isFreePathFeel } from "../lib/scene-presentation";
import type { ContentFile } from "../lib/types";

const root = path.resolve(__dirname, "..");

const fourweekStub: ContentFile = {
  routeId: "route_kai_fourweek_dev",
  routeTitle: "fourweek DEV",
  contentVersion: "0.5.0",
  project: "WetBlessing",
  meta: {
    choiceIndexHardCap: 10,
    firstSubNodeId: "n_first_sub",
    gateField: "first_sub",
  },
  personas: { persona_kai_v1: { name: "Kai" } },
  stages: [
    {
      stageId: "stage_fourweek_dev",
      stageTitle: "dev",
      order: 1,
      entryNodeId: "n_open",
      nodes: [
        {
          nodeId: "n_open",
          type: "dialogue",
          text: "free",
          choices: [{ choiceId: "go", text: "go", next: "n_first_sub" }],
        },
        {
          nodeId: "n_first_sub",
          type: "dialogue",
          text: "wall1",
          gate: "first_sub",
          choices: [
            { choiceId: "a", text: "a", next: "n_edge" },
            { choiceId: "b", text: "b", next: "n_edge" },
          ],
        },
        {
          nodeId: "n_edge",
          type: "dialogue",
          text: "wall2",
          gate: "edge_lock",
          choices: [
            { choiceId: "in", text: "in", next: "n_end" },
            { choiceId: "out", text: "out", next: "n_end" },
          ],
        },
        { nodeId: "n_end", type: "settle", text: "end" },
      ],
    },
  ],
};

describe("DEV fourweek switch (not default load)", () => {
  it("keeps default compile at 0.4.8-feel-hot", () => {
    expect(DEFAULT_CH01_VERSION).toBe("0.4.8-feel-hot");
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(compileAllowlist.amendedFor).toBe("0.4.8-feel-hot");
    expect(tryReadFourweekMini(root)).toBeNull();
    expect(listInstalledFourweekDrafts(root)).toEqual([]);
    expect(matchesDenyGlob(FOURWEEK_MINI_PATH)).toBe(true);
    for (const week of FOURWEEK_WEEK_PATHS) {
      expect(matchesDenyGlob(week)).toBe(true);
    }
    expect(() =>
      compileRoute(fourweekStub, {
        asDefault: true,
        sourcePath: FOURWEEK_MINI_PATH,
      }),
    ).toThrow(/P-D2 deny/);
  });

  it("resolves /play?content=fourweek without changing default route", () => {
    expect(isFourweekPack("fourweek")).toBe(true);
    expect(isFourweekPack("0.5.0")).toBe(true);
    expect(isFourweekPack(null)).toBe(false);
    expect(resolvePlayRoute(null, fourweekStub)).toBeDefined();
    expect(resolvePlayRoute("fourweek", null)).toBe("missing-fourweek");
    const compiled = compileDevPack(fourweekStub);
    expect(compiled.content.contentVersion).toBe("0.5.0");
    expect(isWallGate("first_sub")).toBe(true);
    expect(isWallGate("edge_lock")).toBe(true);
    expect(paywallCopyForGate("edge_lock")).toBe(PAYWALL_EDGE_LOCK);
    expect(isFreePathFeel("n_open")).toBe(true);
    const play = resolvePlayRoute("fourweek", fourweekStub);
    expect(play).not.toBe("missing-fourweek");
    if (play === "missing-fourweek") return;
    expect(play.content.contentVersion).toBe("0.5.0");
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
  });

  it("marks P0 climax webps BLOCKED_BYTES and does not invent files", () => {
    expect(CLIMAX_ART_STATUS).toBe("BLOCKED_BYTES");
    expect(CLIMAX_WEBP_PATHS).toHaveLength(6);
    for (const rel of CLIMAX_WEBP_PATHS) {
      expect(existsSync(path.join(root, rel))).toBe(false);
    }
    expect(resolveAssetUrl("assets/scenes/w2/n_w2_almost_kiss.webp")).toMatch(
      /^\/assets\/scenes\/ch01\//,
    );
  });
});
