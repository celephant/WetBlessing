import { describe, expect, it } from "vitest";
import { showsPassChip } from "../lib/choice-variant";
import { compileRoute } from "../lib/content";
import {
  grantFullEntitleDev,
  isFullyEntitled,
  parseEntitlements,
} from "../lib/entitlement";
import {
  hasEntitlement,
  selectChoice,
  startGame,
  unlockNext,
  view,
  withEntitlement,
} from "../lib/engine";
import {
  GATE_EDGE_LOCK,
  isWallGate,
  normalizeWallGate,
} from "../lib/paywall-copy";
import {
  isPaywallWallNode,
  phoneGlowAllowed,
  selectAssetChangeTransition,
  WALL_RHYTHM,
} from "../lib/scene-presentation";
import type { ContentFile } from "../lib/types";

function edgeLockStub(gate: string = "edge_lock"): ContentFile {
  return {
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
            gate,
            choices: [
              {
                choiceId: "c_push",
                text: "push",
                next: "n_end",
                requiresEntitlement: "edge_lock",
                cta: "story_pass_month",
                onLocked: "show_pass_chip",
              },
              { choiceId: "c_leave", text: "leave", next: "n_end" },
            ],
          },
          { nodeId: "n_end", type: "settle", text: "end" },
        ],
      },
    ],
  };
}

describe("reserved edge_lock sibling wall", () => {
  it("normalizes gate: edge_lock and gate: \"edge_lock\"", () => {
    expect(normalizeWallGate("edge_lock")).toBe(GATE_EDGE_LOCK);
    expect(normalizeWallGate('"edge_lock"')).toBe(GATE_EDGE_LOCK);
    expect(normalizeWallGate("'edge_lock'")).toBe(GATE_EDGE_LOCK);
    expect(isWallGate("edge_lock")).toBe(true);
    expect(isWallGate('"edge_lock"')).toBe(true);
    expect(isWallGate("first_sub")).toBe(true);
  });

  it("compiles both gate spellings without crashing", () => {
    expect(() => compileRoute(edgeLockStub("edge_lock"))).not.toThrow();
    expect(() => compileRoute(edgeLockStub('"edge_lock"'))).not.toThrow();
  });

  it("uses the same dip → chips → gold → unlock-softZoom family as first_sub", () => {
    expect(isPaywallWallNode("n_future_edge", "edge_lock")).toBe(true);
    expect(isPaywallWallNode("n_future_edge", '"edge_lock"')).toBe(true);
    expect(
      selectAssetChangeTransition({ changeCount: 0, gate: "edge_lock" }),
    ).toBe("dip-to-black");
    expect(
      selectAssetChangeTransition({
        changeCount: 0,
        afterPurchase: true,
        gate: "edge_lock",
      }),
    ).toBe("soft-zoom");
    expect(WALL_RHYTHM.arrival).toBe("dip-to-black");
    expect(WALL_RHYTHM.afterPurchase).toBe("soft-zoom");
    expect(phoneGlowAllowed({ gate: "edge_lock" })).toBe(false);
  });

  it("locks an edge_lock choice until DEV full-entitle", () => {
    const compiled = compileRoute(edgeLockStub());
    const start = startGame({ story_pass_month: false }, compiled);
    expect(view(start, compiled).isPaywall).toBe(true);

    const locked = selectChoice(start, "c_push", compiled);
    expect(locked.ok).toBe(false);
    if (locked.ok) return;
    expect(locked.reason).toBe("locked");
    expect(locked.sku).toBe("edge_lock");
    expect(showsPassChip(locked.choice)).toBe(true);

    const unlocked = unlockNext(locked.state, undefined, compiled);
    expect(unlocked.ok).toBe(true);
    if (!unlocked.ok) return;
    expect(unlocked.state.entitlements.story_pass_month).toBe(true);
    expect(unlocked.state.entitlements.edge_lock).toBe(true);
    expect(unlocked.state.nodeId).toBe("n_end");
  });

  it("lets the /play full-entitle switch unlock first_sub and edge_lock", () => {
    const compiled = compileRoute(edgeLockStub());
    const granted = grantFullEntitleDev();
    expect(isFullyEntitled(granted)).toBe(true);
    expect(granted.story_pass_month).toBe(true);
    expect(granted.edge_lock).toBe(true);

    const entitled = startGame(granted, compiled);
    expect(hasEntitlement(entitled, "story_pass_month")).toBe(true);
    expect(hasEntitlement(entitled, "edge_lock")).toBe(true);
    expect(selectChoice(entitled, "c_push", compiled).ok).toBe(true);

    const firstSubOnly = withEntitlement(
      startGame({ story_pass_month: false }, compiled),
      "story_pass_month",
      true,
    );
    expect(hasEntitlement(firstSubOnly, "edge_lock")).toBe(true);
    expect(hasEntitlement(firstSubOnly, "chapter_unlock")).toBe(true);
  });

  it("round-trips both wall flags in local entitle storage", () => {
    const parsed = parseEntitlements(
      JSON.stringify({ story_pass_month: true, edge_lock: true }),
    );
    expect(parsed.story_pass_month).toBe(true);
    expect(parsed.edge_lock).toBe(true);
    expect(isFullyEntitled(parsed)).toBe(true);
  });
});
