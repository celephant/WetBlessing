import { describe, expect, it } from "vitest";
import { selectCropName } from "../lib/camera-crops";
import { listNodes } from "../lib/content";
import { tokens } from "../lib/tokens";
import {
  isFreePathFeel,
  isNightGradeNode,
  isPaywallWallNode,
  resolveScenePresentation,
  selectSameAssetMotion,
  selectSceneFx,
} from "../lib/scene-presentation";

const FREE_BEFORE_WALL = [
  "n_open",
  "n_see_both",
  "n_jade_desk",
  "n_mia_tease_auto",
  "n_dodge_corridor",
  "n_mia_edge_1",
  "n_mia_edge_2",
  "n_dorm_steam",
  "n_conflict",
  "n_with_mia",
  "n_with_jade",
  "n_with_lina",
  "n_with_rae",
  "n_kiss_mia",
  "n_kiss_jade",
  "n_kiss_lina",
  "n_kiss_rae",
];

describe("free-path feel (not paid-gated)", () => {
  it("gives unpaid free nodes Ken Burns/breath, crop cycle, and warm+magenta", () => {
    expect(tokens.grade.warmVeil).toContain("255, 140, 120");
    expect(tokens.grade.magentaMist).toContain("220, 90, 140");
    expect(tokens.grade.forbid.join(" ")).toMatch(/FF0033|neon/i);

    for (const nodeId of FREE_BEFORE_WALL) {
      expect(isFreePathFeel(nodeId)).toBe(true);
      expect(isPaywallWallNode(nodeId)).toBe(false);
      expect(selectSceneFx({ nodeId, explicit: "dual_focus" })).toBe("warm-tint");
      expect(selectSameAssetMotion({ holdCount: 0 })).not.toBe("hold");
    }

    const open = listNodes().find((node) => node.nodeId === "n_open");
    expect(open).toBeTruthy();
    const unpaid = resolveScenePresentation(open!, 0, {
      changeCount: 0,
      holdCount: 0,
    });
    expect(unpaid.fx).toBe("warm-tint");
    expect(unpaid.motion).not.toBe("hold");

    expect(selectCropName({ explicitCamera: open?.camera, holdCount: 0 })).toBe(
      "wide",
    );
    expect(selectCropName({ explicitCamera: open?.camera, holdCount: 1 })).toBe(
      "wide",
    );
    expect(selectCropName({ explicitCamera: open?.camera, holdCount: 2 })).toBe(
      "mid",
    );

    const closeNode = listNodes().find((node) => node.nodeId === "n_mia_edge_1");
    expect(
      selectCropName({ explicitCamera: closeNode?.camera, holdCount: 0 }),
    ).toBe("close");
    expect(
      selectCropName({ explicitCamera: closeNode?.camera, holdCount: 1 }),
    ).toBe("close");
    expect(
      selectCropName({ explicitCamera: closeNode?.camera, holdCount: 2 }),
    ).toBe("wide");
  });

  it("keeps SMS/wall on night grade and wall rhythm, not free warm", () => {
    expect(isFreePathFeel("n_sms_auto")).toBe(false);
    expect(isNightGradeNode("n_sms_auto")).toBe(true);
    expect(isFreePathFeel("n_ch01_first_sub", "first_sub")).toBe(false);
    expect(selectSceneFx({ nodeId: "n_sms_auto", explicit: "phone_glow" })).toBe(
      "vignette",
    );
    expect(
      selectSceneFx({ nodeId: "n_ch01_first_sub", gate: "first_sub" }),
    ).toBe("vignette");
  });
});
