import { describe, expect, it } from "vitest";
import { compileRoute, content, getNode, route } from "../lib/content";
import {
  clickAdvance,
  playChoices,
  pumpToPrompt,
  resolveNext,
  selectChoice,
  startGame,
  view,
  walkAllPaths,
} from "../lib/engine";

describe("content integrity", () => {
  it("loads 0.4.8-feel-hot Ch01", () => {
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(content.project).toBe("WetBlessing");
    expect(content.meta.gateField).toBe("first_sub");
    expect(content.meta.firstSubNodeId).toBe("n_ch01_first_sub");
    expect(content.meta.choiceIndexHardCap).toBe(10);
  });

  it("compiles unique node ids and known personas", () => {
    const compiled = compileRoute();
    expect(compiled.nodes.size).toBe(content.stages[0]!.nodes.length);
    expect(Object.keys(content.personas)).toEqual(
      expect.arrayContaining([
        "persona_kai_v1",
        "persona_mia_v1",
        "persona_jade_v1",
        "persona_vanessa_v1",
      ]),
    );
  });

  it("resolves every advance / choice / advanceByFlag target", () => {
    for (const node of route.nodes.values()) {
      if (node.advance) {
        expect(route.nodes.has(node.advance), `missing advance ${node.advance}`).toBe(
          true,
        );
      }
      if (node.advanceByFlag) {
        for (const dest of Object.values(node.advanceByFlag)) {
          expect(route.nodes.has(dest), `missing flag dest ${dest}`).toBe(true);
        }
      }
      for (const choice of node.choices ?? []) {
        expect(route.nodes.has(choice.next), `missing choice next ${choice.next}`).toBe(
          true,
        );
      }
    }
  });

  it("marks first_sub on the paywall node and caps at 10", () => {
    const wall = getNode(route.firstSubNodeId);
    expect(wall.gate).toBe("first_sub");
    expect(wall.choices?.some((c) => c.requiresEntitlement === "story_pass_month")).toBe(
      true,
    );
    expect(route.choiceIndexHardCap).toBeLessThanOrEqual(10);
  });
});

describe("engine advance vs branches", () => {
  it("does not increment choiceIndex on linear advance clicks", () => {
    let state = startGame();
    expect(state.nodeId).toBe("n_open");
    expect(state.choiceIndex).toBe(0);

    state = clickAdvance(state);
    expect(state.nodeId).toBe("n_see_both");
    expect(state.choiceIndex).toBe(0);
  });

  it("increments choiceIndex only when a branch is taken", () => {
    let state = pumpToPrompt(startGame());
    expect(state.nodeId).toBe("n_see_both");
    const before = state.choiceIndex;
    const result = selectChoice(state, "c_help_mia");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.choiceIndex).toBe(before + 1);
    expect(result.state.nodeId).toBe("n_mia_edge_1");
    expect(result.state.flags.helped_mia_box).toBe(true);
    expect(result.state.stats.mia.affection).toBe(2);
  });

  it("clicks through in-node lines before revealing choices", () => {
    const state = startGame();
    const opened = clickAdvance(state);
    const first = view(opened);
    expect(first.choices).toHaveLength(0);
    expect(first.beat.speaker).toBe("narrator");

    const second = clickAdvance(opened);
    expect(view(second).beat.speaker).toBe("mia");
    const third = clickAdvance(second);
    const last = view(third);
    expect(last.beat.speaker).toBe("jade");
    expect(last.choices.map((c) => c.choiceId)).toEqual([
      "c_help_mia",
      "c_talk_jade",
      "c_dodge_both",
    ]);
  });
});

describe("first_sub wall", () => {
  it("reaches first_sub with choiceIndex ≤ 10 on every path", () => {
    const paths = walkAllPaths(route, { stopAtFirstSub: true, assumeEntitled: true });
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      const wall = path[path.length - 1]!;
      expect(wall.nodeId).toBe("n_ch01_first_sub");
      expect(wall.choiceIndex).toBeLessThanOrEqual(route.choiceIndexHardCap);
      expect(wall.choiceIndex).toBeLessThanOrEqual(10);
    }
  });

  it("longest free path is well under the cap", () => {
    const state = playChoices([
      "c_help_mia",
      "c_mia_hugish",
      "c_mia_banter",
      "c_go_mia",
      "c_wm_close",
    ]);
    expect(state.nodeId).toBe("n_ch01_first_sub");
    expect(state.choiceIndex).toBe(5);
    expect(state.choiceIndex).toBeLessThanOrEqual(10);
  });
});

describe("advanceByFlag", () => {
  it("routes went_with==mia without showing the router", () => {
    const state = playChoices(
      ["c_help_mia", "c_mia_safe", "c_mia_box", "c_go_mia", "c_wm_ok", "c_sub_round_jade"],
      { story_pass_month: true },
      route,
      { pumpAfter: false },
    );
    expect(state.nodeId).toBe("n_pay_01_catch_jade");
    const after = clickAdvance(state);
    expect(after.nodeId).toBe("n_pay_02_ot_mia");
    expect(after.nodeId).not.toBe("n_pay_02_router");
  });

  it("routes went_with==jade and went_with==none", () => {
    const jade = playChoices(
      ["c_talk_jade", "c_jade_ok", "c_go_jade", "c_wj_ok", "c_sub_round_mia"],
      { story_pass_month: true },
      route,
      { pumpAfter: false },
    );
    expect(clickAdvance(jade).nodeId).toBe("n_pay_02_ot_jade");

    const none = playChoices(
      ["c_dodge_both", "c_dodge_party", "c_sub_round_mia"],
      { story_pass_month: true },
      route,
      { pumpAfter: false },
    );
    expect(clickAdvance(none).nodeId).toBe("n_pay_02_double_empty");
  });

  it("resolves flag expressions on the router node", () => {
    const router = getNode("n_pay_02_router");
    expect(router.playerVisible).toBe(false);
    expect(resolveNext(router, { went_with: "mia" })).toBe("n_pay_02_ot_mia");
    expect(resolveNext(router, { went_with: "jade" })).toBe("n_pay_02_ot_jade");
    expect(resolveNext(router, { went_with: "none" })).toBe("n_pay_02_double_empty");
  });
});
