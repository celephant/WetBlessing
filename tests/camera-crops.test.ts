import { describe, expect, it } from "vitest";
import {
  CROP_CYCLE,
  cropRect,
  cropSafeBottom,
  parseCropName,
  selectCropName,
} from "../lib/camera-crops";
import { compileRoute } from "../lib/content";
import { isWallGate, PAYWALL_EDGE_LOCK, PAYWALL_HARD } from "../lib/paywall-copy";
import type { ContentFile } from "../lib/types";
import { isPaywallWallNode, selectSameAssetMotion } from "../lib/scene-presentation";

describe("ART camera crops", () => {
  it("cycles wide → mid → close and aliases far/shoulder", () => {
    expect(CROP_CYCLE).toEqual(["wide", "mid", "close"]);
    expect(parseCropName("far")).toBe("wide");
    expect(parseCropName("shoulder")).toBe("mid");
    expect(selectCropName({ holdCount: 0 })).toBe("wide");
    expect(selectCropName({ holdCount: 1 })).toBe("mid");
    expect(selectCropName({ holdCount: 2 })).toBe("close");
    expect(selectCropName({ explicitCamera: "close", holdCount: 0 })).toBe(
      "close",
    );
    expect(cropSafeBottom(cropRect("wide"))).toBe(true);
    expect(cropSafeBottom(cropRect("mid"))).toBe(true);
    expect(cropSafeBottom(cropRect("close"))).toBe(true);
    expect(cropRect("wide").y + cropRect("wide").h).toBeLessThanOrEqual(0.72);
  });

  it("keeps free-path Ken Burns motion without a paid unlock", () => {
    expect(selectSameAssetMotion({ holdCount: 0 })).not.toBe("hold");
    expect(selectSameAssetMotion({ explicitCamera: "wide", holdCount: 0 })).toBe(
      "kenburns-up",
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

  it("keeps wall1 体温未散 and owned edge primary 推门进去", () => {
    expect(PAYWALL_HARD["zh-CN"].title).toContain("体温");
    expect(PAYWALL_HARD.behavior.tone).toMatch(/禁暗示开通后才开始暧昧/);
    expect(PAYWALL_EDGE_LOCK["zh-CN"].primaryOwned).toBe("推门进去");
  });
});
