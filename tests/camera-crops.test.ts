import { describe, expect, it } from "vitest";
import {
  CAMERA_CROPS,
  CROP_CYCLE,
  DEFAULT_CROP_LINE,
  FULL_STILL_RECT,
  cropRect,
  cropSafeBottom,
  cropToTransform,
  fullStillTransform,
  parseCropName,
  selectCropName,
} from "../lib/camera-crops";
import { compileRoute } from "../lib/content";
import {
  CHAPTER_UNLOCK_PRICE,
  isWallGate,
  paywallCopyForGate,
  PAYWALL_CHAPTER,
  PAYWALL_EDGE_LOCK,
  PAYWALL_HARD,
} from "../lib/paywall-copy";
import type { ContentFile } from "../lib/types";
import { isPaywallWallNode, selectSameAssetMotion } from "../lib/scene-presentation";

describe("ART camera crops", () => {
  it("keeps the full still (wide) instead of hunting crops", () => {
    expect(CROP_CYCLE).toEqual(["wide", "mid", "close"]);
    expect(parseCropName("far")).toBe("wide");
    expect(parseCropName("shoulder")).toBe("mid");
    expect(selectCropName({ holdCount: 0 })).toBe("wide");
    expect(selectCropName({ holdCount: 1 })).toBe("wide");
    expect(selectCropName({ holdCount: 2 })).toBe("wide");
    expect(selectCropName({ explicitCamera: "close", holdCount: 0 })).toBe(
      "wide",
    );
    expect(selectCropName({ explicitCamera: "wide", holdCount: 0 })).toBe("wide");
    expect(selectCropName({ explicitCamera: "wide", holdCount: 2 })).toBe(
      "wide",
    );
    expect(
      selectCropName({ explicitCamera: "close", holdCount: 3, lockCrop: true }),
    ).toBe("wide");
    expect(cropSafeBottom(cropRect("wide"))).toBe(true);
    expect(cropSafeBottom(cropRect("mid"))).toBe(true);
    expect(cropSafeBottom(cropRect("close"))).toBe(true);
    expect(cropRect("wide").y + cropRect("wide").h).toBeLessThanOrEqual(0.72);
    expect(DEFAULT_CROP_LINE).toBe("mia");
    expect(CAMERA_CROPS.defaultLine).toBe("mia");
    expect(parseCropName("extreme_close")).toBe("close");
    expect(parseCropName("close_alt")).toBe("close");
    expect(parseCropName("close_hand")).toBe("close");
    expect(parseCropName("close_collar")).toBe("close");
    expect(selectCropName({ holdCount: 0, beforeChoices: true })).toBe("wide");
  });

  it("pins an identity full still instead of letterboxed thumbs", () => {
    expect(FULL_STILL_RECT).toEqual({ x: 0, y: 0, w: 1, h: 1 });
    expect(fullStillTransform()).toEqual({ scale: 1, tx: 0, ty: 0 });
    expect(cropToTransform(FULL_STILL_RECT)).toEqual({
      scale: 1,
      tx: 0,
      ty: 0,
    });
  });

  it("keeps free-path plates frozen without a paid unlock", () => {
    expect(selectSameAssetMotion({ holdCount: 0 })).toBe("hold");
    expect(selectSameAssetMotion({ explicitCamera: "wide", holdCount: 0 })).toBe(
      "hold",
    );
  });
});

describe("edge_lock + paywall copy", () => {
  it("treats edge_lock as a first_sub sibling wall", () => {
    expect(isWallGate("edge_lock")).toBe(true);
    expect(isWallGate("first_sub")).toBe(true);
    expect(isPaywallWallNode("n_future_edge", "edge_lock")).toBe(true);
    expect(isPaywallWallNode("n_ch01_first_sub", "first_sub")).toBe(true);
    const edgeStub: ContentFile = {
      routeId: "route_kai_ch01",
      routeTitle: "t",
      contentVersion: "fixture",
      project: "WetBlessing",
      meta: {
        choiceIndexHardCap: 10,
        firstSubNodeId: "n_wall",
        gateField: "first_sub",
      },
      personas: { persona_kai_v1: { name: "Kai" } },
      stages: [
        {
          stageId: "stage_ch01_free_to_sub",
          stageTitle: "t",
          order: 1,
          entryNodeId: "n_edge",
          nodes: [
            {
              nodeId: "n_edge",
              type: "dialogue",
              text: "door",
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
    expect(() => compileRoute(edgeStub)).not.toThrow();
    const quoted = structuredClone(edgeStub);
    quoted.stages[0]!.nodes[0]!.gate = '"edge_lock"';
    expect(() => compileRoute(quoted)).not.toThrow();
    expect(isWallGate('"edge_lock"')).toBe(true);
  });

  it("sells Catch / open 教員室 / seam stills, not lecture walls", () => {
    expect(PAYWALL_HARD["zh-CN"].title).toMatch(/自己的地上/);
    expect(PAYWALL_HARD["zh-CN"].body).toMatch(/没抬头|拉的中途|下来没有/);
    expect(PAYWALL_HARD["zh-CN"].primaryOwned).toBe("进去。");
    expect(PAYWALL_HARD.behavior.tone).toMatch(/禁暗示开通后才开始暧昧/);
    expect(PAYWALL_HARD.behavior.primaryAction).toBe("checkout_sku:story_pass");
    expect(PAYWALL_HARD.behavior.secondaryAction).toBe(
      "checkout_sku:chapter_unlock|scope=w1_continue",
    );
    expect(PAYWALL_HARD["zh-CN"].primary).toContain("$8.99");
    expect(PAYWALL_HARD["zh-CN"].secondary).toContain("$2.99");
    expect(PAYWALL_CHAPTER["zh-CN"].title).toMatch(/教員室/);
    expect(PAYWALL_CHAPTER["zh-CN"].primaryOwned).toBe("进去。");
    expect(PAYWALL_EDGE_LOCK["zh-CN"].primaryOwned).toBe("推门进去");
    expect(PAYWALL_EDGE_LOCK.behavior.primaryOwnedAction).toBe("continue_paid_edge");
    expect(PAYWALL_EDGE_LOCK.behavior.secondaryAction).toBe(
      "checkout_sku:chapter_unlock|scope=w3_edge_night",
    );
    expect(PAYWALL_EDGE_LOCK["zh-CN"].primary).toContain("$8.99");
    expect(CHAPTER_UNLOCK_PRICE).toBe(2.99);
    expect(paywallCopyForGate("first_sub")).toBe(PAYWALL_HARD);
    expect(paywallCopyForGate("chapter_start")).toBe(PAYWALL_CHAPTER);
    expect(paywallCopyForGate("edge_lock")).toBe(PAYWALL_EDGE_LOCK);
    expect(PAYWALL_CHAPTER.behavior.secondaryAction).toBe(
      "checkout_sku:chapter_unlock|scope=w2_office",
    );
    const overlay = JSON.stringify({
      hard: PAYWALL_HARD["zh-CN"],
      chapter: PAYWALL_CHAPTER["zh-CN"],
      edge: PAYWALL_EDGE_LOCK["zh-CN"],
    });
    expect(overlay).not.toMatch(/稍后再说/);
    expect(overlay).not.toMatch(/周一还在/);
    expect(overlay).not.toMatch(/走进食堂/);
    expect(overlay).not.toMatch(/当场续读/);
    expect(overlay).not.toMatch(/不是上床/);
    expect(overlay).not.toMatch(/明天群会响/);
    for (const pack of [PAYWALL_HARD, PAYWALL_CHAPTER, PAYWALL_EDGE_LOCK]) {
      const zh = pack["zh-CN"];
      expect(zh.tertiary).toBe("回标题");
      for (const label of [zh.primary, zh.primaryOwned, zh.secondary, zh.tertiary]) {
        expect(label ?? "").not.toMatch(/♥|♡/);
      }
    }
  });
});
