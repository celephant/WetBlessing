import { describe, expect, it } from "vitest";
import { selectCropName } from "../lib/camera-crops";
import { content } from "../lib/content";
import {
  DENSITY_MAX_SAME_COMPOSITION,
  detectIntimateBeat,
  intimateAllowsFade,
  SOFT_ZOOM_CROP_MS,
} from "../lib/feel-density";
import {
  CROP_CUT_TRANSITION,
  cutDurationMs,
  MOTION_SPEC,
  resolveScenePresentation,
  selectAssetChangeTransition,
} from "../lib/scene-presentation";
import { tokens } from "../lib/tokens";
import type { ContentNode } from "../lib/types";

describe("FEEL density + intimate FX", () => {
  it("keeps default load at 0.4.8-feel-hot", () => {
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
  });

  it("auto-cycles wide→mid→close on the 3rd same-asset line when camera is omitted", () => {
    expect(DENSITY_MAX_SAME_COMPOSITION).toBe(2);
    expect(selectCropName({ holdCount: 0 })).toBe("wide");
    expect(selectCropName({ holdCount: 1 })).toBe("mid");
    expect(selectCropName({ holdCount: 2 })).toBe("close");

    const bare: ContentNode = {
      nodeId: "n_density_gap",
      type: "dialogue",
      text: "line",
    };
    expect(
      resolveScenePresentation(bare, 0, { changeCount: 0, holdCount: 0 }).cropName,
    ).toBe("wide");
    expect(
      resolveScenePresentation(bare, 0, { changeCount: 0, holdCount: 1 }).cropName,
    ).toBe("mid");
    expect(
      resolveScenePresentation(bare, 0, { changeCount: 0, holdCount: 2 }).cropName,
    ).toBe("close");
  });

  it("prefers a close/mid cut before choices", () => {
    expect(selectCropName({ holdCount: 0, beforeChoices: true })).toBe("close");
    expect(
      selectCropName({
        explicitCamera: "mid",
        holdCount: 0,
        beforeChoices: true,
      }),
    ).toBe("mid");
    expect(
      selectCropName({
        explicitCamera: "wide",
        holdCount: 0,
        beforeChoices: true,
      }),
    ).toBe("close");

    const mia = content.stages[0]!.nodes.find(
      (node) => node.nodeId === "n_mia_edge_1",
    );
    expect(mia?.choices?.length).toBeGreaterThan(0);
    const weighted = resolveScenePresentation(mia!, 0, {
      changeCount: 0,
      holdCount: 0,
      beforeChoices: true,
    });
    expect(["mid", "close"]).toContain(weighted.cropName);
  });

  it("forces soft-zoom or dip on intimate beats and forbids fade-only", () => {
    expect(intimateAllowsFade()).toBe(false);
    expect(
      selectAssetChangeTransition({
        explicit: "fade",
        changeCount: 0,
        intimateBeat: true,
        nodeId: "n_w2_almost_kiss",
      }),
    ).toBe("soft-zoom");
    expect(
      selectAssetChangeTransition({
        explicit: "dip",
        changeCount: 0,
        intimateBeat: true,
      }),
    ).toBe("dip-to-black");
    expect(
      selectAssetChangeTransition({
        explicit: "soft-zoom",
        changeCount: 0,
        intimateBeat: true,
      }),
    ).toBe("soft-zoom");
    expect(
      selectAssetChangeTransition({
        changeCount: 0,
        intimateBeat: "door_lock",
      }),
    ).toBe("dip-to-black");
    expect(
      selectAssetChangeTransition({
        changeCount: 0,
        intimateBeat: "near_miss",
      }),
    ).toBe("soft-zoom");

    const kiss: ContentNode = {
      nodeId: "n_w2_almost_kiss",
      type: "dialogue",
      text: "almost-kiss",
      assetId: "assets/scenes/w2/n_w2_almost_kiss.webp",
      transition: "fade",
      fx: "none",
    };
    const resolved = resolveScenePresentation(kiss, 0, {
      changeCount: 1,
      holdCount: 0,
    });
    expect(resolved.intimateBeat).toBe("near_miss");
    expect(resolved.transition).not.toBe("fade");
    expect(["soft-zoom", "dip-to-black"]).toContain(resolved.transition);
    expect(resolved.fx).toBe("warm-tint");
    expect(resolved.motion).toBe("breathe");
    expect(resolved.cropName).toBe("close");

    for (const id of [
      "near_miss",
      "door_lock",
      "sleepover_edge",
      "vanessa_close",
      "morning_light",
    ] as const) {
      const cut = selectAssetChangeTransition({
        explicit: "fade",
        changeCount: 0,
        intimateBeat: id,
      });
      expect(cut).not.toBe("fade");
      expect(["soft-zoom", "dip-to-black"]).toContain(cut);
    }

    expect(
      detectIntimateBeat({
        nodeId: "n_w3_door_lock_hand",
        assetId: "assets/scenes/w3/n_w3_door_lock_hand.webp",
      }),
    ).toBe("door_lock");
    expect(
      detectIntimateBeat({
        assetId: "assets/scenes/w3/n_w3_sleepover_edge.webp",
      }),
    ).toBe("sleepover_edge");
    expect(
      detectIntimateBeat({ nodeId: "n_pay_03_vanessa" }),
    ).toBe("vanessa_close");
    expect(
      detectIntimateBeat({
        assetId: "assets/scenes/w4/n_w4_morning_light.webp",
      }),
    ).toBe("morning_light");

    const vanessa = content.stages[0]!.nodes.find(
      (node) => node.nodeId === "n_pay_03_vanessa",
    );
    const vanessaResolved = resolveScenePresentation(vanessa!, 0, {
      changeCount: 0,
      holdCount: 0,
    });
    expect(vanessaResolved.intimateBeat).toBe("vanessa_close");
    expect(vanessaResolved.transition).not.toBe("fade");
    expect(vanessaResolved.fx).toBe("warm-tint");
  });

  it("keeps same-asset camera cuts at a short soft-zoom ≤280ms with no dip", () => {
    expect(SOFT_ZOOM_CROP_MS).toBeLessThanOrEqual(280);
    expect(SOFT_ZOOM_CROP_MS).toBe(tokens.transitions.softZoomCrop.msDefault);
    expect(MOTION_SPEC.softZoomCropMs).toBe(SOFT_ZOOM_CROP_MS);
    expect(MOTION_SPEC.softZoomCropMs).toBeLessThanOrEqual(280);
    expect(CROP_CUT_TRANSITION).toBe("soft-zoom-crop");
    expect(cutDurationMs(CROP_CUT_TRANSITION)).toBe(SOFT_ZOOM_CROP_MS);
    expect(cutDurationMs("dip-to-black")).toBe(380);
    expect(cutDurationMs("fade")).toBe(320);
  });

  it("honors authored camera / transition / fx when they are valid", () => {
    const authored: ContentNode = {
      nodeId: "n_open",
      type: "dialogue",
      text: "报到日",
      camera: "wide",
      transition: "fade",
      fx: "warm_dust",
    };
    const resolved = resolveScenePresentation(authored, 0, {
      changeCount: 0,
      holdCount: 0,
    });
    expect(resolved.cropName).toBe("wide");
    expect(resolved.transition).toBe("fade");
    expect(resolved.fx).toBe("warm-tint");
    expect(resolved.motion).toBe("kenburns-up");
    expect(resolved.intimateBeat).toBeNull();
  });
});
