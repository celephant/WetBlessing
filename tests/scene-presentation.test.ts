import { describe, expect, it } from "vitest";
import { resolveAssetUrl } from "../lib/assets";
import { content } from "../lib/content";
import {
  DEFAULT_SCENE_FX,
  SAME_ASSET_MOTIONS,
  SCENE_TRANSITIONS,
  parseCamera,
  parseFx,
  parseTransition,
  presentationHooksForBeat,
  resolveScenePresentation,
  sceneIdentity,
  selectAssetChangeTransition,
  selectSameAssetMotion,
  selectSceneFx,
  shouldPlayAssetTransition,
} from "../lib/scene-presentation";
import type { ContentNode } from "../lib/types";

describe("asset-change transitions", () => {
  it("ships fade, soft-zoom, and dip-to-black", () => {
    expect([...SCENE_TRANSITIONS]).toEqual([
      "fade",
      "soft-zoom",
      "dip-to-black",
    ]);
  });

  it("honors an explicit cut and ignores the cycle index", () => {
    expect(
      selectAssetChangeTransition({ explicit: "soft-zoom", changeCount: 0 }),
    ).toBe("soft-zoom");
    expect(
      selectAssetChangeTransition({ explicit: "dip-to-black", changeCount: 0 }),
    ).toBe("dip-to-black");
    expect(
      selectAssetChangeTransition({ explicit: "fade", changeCount: 2 }),
    ).toBe("fade");
  });

  it("cycles the three shipped cuts when the field is missing", () => {
    const cycled = [0, 1, 2, 3].map((changeCount) =>
      selectAssetChangeTransition({ changeCount }),
    );
    expect(cycled).toEqual(["fade", "soft-zoom", "dip-to-black", "fade"]);
  });

  it("treats unknown transition strings as missing", () => {
    expect(parseTransition("explode")).toBeNull();
    expect(
      selectAssetChangeTransition({ explicit: "explode", changeCount: 1 }),
    ).toBe("soft-zoom");
  });

  it("cuts when resolved URL or authored assetId changes", () => {
    const open = sceneIdentity("assets/scenes/ch01/n_open.webp");
    const seeBoth = sceneIdentity("assets/scenes/ch01/n_see_both.webp");
    const mia = sceneIdentity("assets/scenes/ch01/n_mia_edge_1.webp");

    expect(open.url).toBe(resolveAssetUrl("assets/scenes/ch01/n_open.webp"));
    expect(open.url).toBe(seeBoth.url);
    expect(shouldPlayAssetTransition(open, seeBoth)).toBe(true);
    expect(shouldPlayAssetTransition(seeBoth, seeBoth)).toBe(false);
    expect(shouldPlayAssetTransition(seeBoth, mia)).toBe(true);
    expect(shouldPlayAssetTransition(null, open)).toBe(true);
  });
});

describe("same-asset motion", () => {
  it("cycles distinct Ken Burns / breathe across 3+ holds", () => {
    const motions = [0, 1, 2].map((holdCount) =>
      selectSameAssetMotion({ holdCount }),
    );
    expect(new Set(motions).size).toBe(3);
    expect(motions[0]).not.toBe(motions[1]);
    expect(motions.every((motion) => motion !== "hold")).toBe(true);
    expect(SAME_ASSET_MOTIONS).toContain(motions[0]);
  });

  it("returns to the first motion on the 5th hold (4-step cycle)", () => {
    expect(selectSameAssetMotion({ holdCount: 4 })).toBe(
      selectSameAssetMotion({ holdCount: 0 }),
    );
  });

  it("honors camera hold / breathe / kenburns", () => {
    expect(selectSameAssetMotion({ explicitCamera: "hold", holdCount: 3 })).toBe(
      "hold",
    );
    expect(
      selectSameAssetMotion({ explicitCamera: "breathe", holdCount: 0 }),
    ).toBe("breathe");
    expect(
      selectSameAssetMotion({ explicitCamera: "kenburns-left", holdCount: 2 }),
    ).toBe("kenburns-left");
    expect(
      new Set(
        [0, 1, 2].map((holdCount) =>
          selectSameAssetMotion({ explicitCamera: "kenburns", holdCount }),
        ),
      ).size,
    ).toBe(3);
  });

  it("ignores unknown camera strings and uses the default cycle", () => {
    expect(parseCamera("drone")).toBeNull();
    expect(selectSameAssetMotion({ explicitCamera: "drone", holdCount: 0 })).toBe(
      selectSameAssetMotion({ holdCount: 0 }),
    );
  });

  it("maps 0.4.7-feel camera words onto shipped motion", () => {
    expect(parseCamera("wide")).toBe("kenburns-up");
    expect(parseCamera("close")).toBe("kenburns-right");
    expect(parseCamera("extreme_close")).toBe("breathe");
    expect(selectSameAssetMotion({ explicitCamera: "insert", holdCount: 2 })).toBe(
      "hold",
    );
  });
});

describe("fx + optional node/line hooks", () => {
  it("defaults fx to vignette so plates are never a flat ungraded still", () => {
    expect(selectSceneFx({})).toBe(DEFAULT_SCENE_FX);
    expect(DEFAULT_SCENE_FX).toBe("vignette");
    expect(selectSceneFx({ explicit: "warm-tint" })).toBe("warm-tint");
    expect(selectSceneFx({ explicit: "soft-light" })).toBe("soft-light");
    expect(selectSceneFx({ explicit: "none" })).toBe("none");
    expect(parseFx("bloom")).toBeNull();
    expect(parseFx("warm_dust")).toBe("warm-tint");
    expect(parseFx("phone_glow")).toBe("soft-light");
    expect(parseFx("tension_hold")).toBe("vignette");
  });

  it("lets a line override node hooks; bare nodes stay defaultable", () => {
    const node: ContentNode = {
      nodeId: "n_demo",
      type: "dialogue",
      text: "open",
      transition: "fade",
      camera: "kenburns",
      fx: "vignette",
      lines: [
        { speaker: "mia", text: "hey", transition: "soft-zoom", fx: "warm-tint" },
      ],
    };

    expect(presentationHooksForBeat(node, 0)).toEqual({
      transition: "fade",
      camera: "kenburns",
      fx: "vignette",
    });
    expect(presentationHooksForBeat(node, 1)).toEqual({
      transition: "soft-zoom",
      camera: "kenburns",
      fx: "warm-tint",
    });

    const bare: ContentNode = {
      nodeId: "n_open",
      type: "dialogue",
      text: "报到日",
    };
    expect(presentationHooksForBeat(bare, 0)).toEqual({
      transition: undefined,
      camera: undefined,
      fx: undefined,
    });
    expect(
      resolveScenePresentation(bare, 0, { changeCount: 2, holdCount: 0 }),
    ).toEqual({
      transition: "dip-to-black",
      motion: "kenburns-right",
      fx: "vignette",
    });
  });

  it("resolves 0.4.7-feel node fx/camera without requiring a fixture rewrite", () => {
    expect(content.contentVersion).toBe("0.4.7-feel");
    const open = content.stages[0]!.nodes.find((node) => node.nodeId === "n_open");
    expect(open?.fx).toBe("warm_dust");
    expect(open?.camera).toBe("wide");
    const resolved = resolveScenePresentation(open!, 0, {
      changeCount: 0,
      holdCount: 0,
    });
    expect(resolved.fx).toBe("warm-tint");
    expect(resolved.motion).toBe("kenburns-up");
    expect(SCENE_TRANSITIONS).toContain(resolved.transition);
  });
});
