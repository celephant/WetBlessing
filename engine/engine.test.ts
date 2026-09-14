import { describe, expect, it } from "vitest";
import { content } from "./content";
import {
  advance,
  canClickAdvance,
  createInitialState,
  getView,
  resolveAdvanceByFlag,
  selectChoice,
  unlockNext,
  utterances,
  visibleChoices,
} from "./engine";
import { pathsToFirstSub } from "./paths";
import { FIRST_SUB_GATE, STORY_PASS_MONTH, type EngineState } from "./types";

function clickThrough(state: EngineState): EngineState {
  let cursor = state;
  for (let i = 0; i < 12; i += 1) {
    const view = getView(cursor, content);
    if (view.showingChoices || view.settle || !canClickAdvance(cursor, content)) {
      return cursor;
    }
    const next = advance(cursor, content);
    if (next === cursor || next.nodeId === cursor.nodeId && next.lineIndex === cursor.lineIndex) {
      return next;
    }
    cursor = next;
  }
  return cursor;
}

function play(choiceIds: string[]): EngineState {
  let state = createInitialState(content);
  for (const choiceId of choiceIds) {
    state = clickThrough(state);
    state = selectChoice(state, content, choiceId);
  }
  return clickThrough(state);
}

describe("Ch01 0.4.6-midboard engine", () => {
  it("starts at n_open and click-advances without incrementing choiceIndex", () => {
    const start = createInitialState(content);
    expect(start.nodeId).toBe("n_open");
    expect(start.choiceIndex).toBe(0);

    const next = advance(start, content);
    expect(next.nodeId).toBe("n_see_both");
    expect(next.choiceIndex).toBe(0);
  });

  it("clicks through multi-line nodes before showing choices", () => {
    let state = advance(createInitialState(content), content);
    expect(state.nodeId).toBe("n_see_both");
    const lines = utterances(content.stages[0].nodes.find((n) => n.nodeId === "n_see_both")!);
    expect(lines.length).toBe(3);

    expect(getView(state, content).showingChoices).toBe(false);
    expect(getView(state, content).line?.speaker).toBe("narrator");

    state = advance(state, content);
    expect(getView(state, content).line?.speaker).toBe("mia");
    expect(state.choiceIndex).toBe(0);

    state = advance(state, content);
    expect(getView(state, content).line?.speaker).toBe("jade");
    expect(getView(state, content).showingChoices).toBe(true);
    expect(state.choiceIndex).toBe(0);
  });

  it("increments choiceIndex only on branching choices", () => {
    const afterOpen = advance(createInitialState(content), content);
    const afterLines = clickThrough(afterOpen);
    expect(afterLines.nodeId).toBe("n_see_both");
    expect(afterLines.choiceIndex).toBe(0);

    const picked = selectChoice(afterLines, content, "c_help_mia");
    expect(picked.nodeId).toBe("n_mia_edge_1");
    expect(picked.choiceIndex).toBe(1);
    expect(picked.flags.helped_mia_box).toBe(true);
  });

  it("auto-routes n_pay_02_router via advanceByFlag and never leaves it player-visible", () => {
    const routed = resolveAdvanceByFlag({ went_with: "mia" }, {
      "went_with==mia": "n_pay_02_ot_mia",
      "went_with==jade": "n_pay_02_ot_jade",
      "went_with==none": "n_pay_02_double_empty",
    });
    expect(routed).toBe("n_pay_02_ot_mia");

    const afterUnlock = play([
      "c_help_mia",
      "c_mia_hugish",
      "c_mia_banter",
      "c_go_mia",
      "c_wm_close",
    ]);
    expect(afterUnlock.nodeId).toBe("n_ch01_first_sub");
    expect(afterUnlock.flags.stood_up_jade).toBe(true);

    const locked = selectChoice(afterUnlock, content, "c_sub_round_jade");
    expect(locked.nodeId).toBe("n_ch01_first_sub");
    expect(locked.pendingUnlock?.sku).toBe(STORY_PASS_MONTH);

    const paid = unlockNext(locked, content);
    expect(paid.entitlements).toContain(STORY_PASS_MONTH);
    expect(paid.nodeId).toBe("n_pay_01_catch_jade");
    expect(paid.pendingUnlock).toBeNull();

    let afterCatch = paid;
    while (afterCatch.nodeId === "n_pay_01_catch_jade") {
      const next = advance(afterCatch, content);
      if (next.nodeId === afterCatch.nodeId && next.lineIndex === afterCatch.lineIndex) break;
      afterCatch = next;
    }
    expect(afterCatch.nodeId).toBe("n_pay_02_ot_mia");
    expect(afterCatch.nodeId).not.toBe("n_pay_02_router");
  });

  it("keeps first_sub within the hard cap of 10 branching choices on every free path", () => {
    const paths = pathsToFirstSub(content);
    expect(paths.length).toBeGreaterThan(0);
    expect(content.meta.choiceIndexHardCap).toBe(10);
    expect(content.meta.gateField).toBe(FIRST_SUB_GATE);

    for (const path of paths) {
      expect(path.choiceIndex).toBeLessThanOrEqual(content.meta.choiceIndexHardCap);
      expect(path.nodeIds.at(-1)).toBe(content.meta.firstSubNodeId);
    }

    const maxIndex = Math.max(...paths.map((path) => path.choiceIndex));
    expect(maxIndex).toBeGreaterThan(0);
    expect(maxIndex).toBeLessThanOrEqual(10);
  });

  it("shows flag-filtered subscribe lines and free exits without a store unlock", () => {
    const dodge = play(["c_dodge_both", "c_dodge_party"]);
    expect(dodge.nodeId).toBe("n_ch01_first_sub");
    const choices = visibleChoices(dodge, content.stages[0].nodes.find((n) => n.nodeId === "n_ch01_first_sub")!);
    const ids = choices.map((c) => c.choiceId);
    expect(ids).toContain("c_sub_round_mia");
    expect(ids).toContain("c_sub_round_jade");
    expect(ids).toContain("c_free_busy");

    const soft = selectChoice(dodge, content, "c_free_busy");
    expect(soft.entitlements).toEqual([]);
    expect(soft.nodeId).toBe("n_free_soft_exit");
    expect(soft.pendingUnlock).toBeNull();
  });

  it("unlockNext without a pending choice only grants the sku", () => {
    const start = createInitialState(content);
    const granted = unlockNext(start, content);
    expect(granted.entitlements).toEqual([STORY_PASS_MONTH]);
    expect(granted.nodeId).toBe("n_open");
  });
});
