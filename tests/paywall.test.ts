import { describe, expect, it } from "vitest";
import { route } from "../lib/content";
import {
  clickAdvance,
  playChoices,
  selectChoice,
  unlockAndSelect,
  view,
} from "../lib/engine";

describe("in-dialogue paywall", () => {
  it("filters subscribe choices by stood_up flags", () => {
    const miaPath = playChoices([
      "c_help_mia",
      "c_mia_safe",
      "c_mia_box",
      "c_go_mia",
      "c_wm_ok",
    ]);
    const ids = view(miaPath).choices.map((c) => c.choiceId);
    expect(ids).toContain("c_sub_round_jade");
    expect(ids).not.toContain("c_sub_round_mia");
    expect(ids).toContain("c_free_busy");
    expect(ids).toContain("c_later");
  });

  it("locks story_pass_month choices until entitled", () => {
    const state = playChoices(["c_dodge_both", "c_dodge_party"]);
    expect(state.nodeId).toBe("n_ch01_first_sub");
    expect(state.entitlements.story_pass_month).toBe(false);

    const locked = selectChoice(state, "c_sub_round_mia");
    expect(locked.ok).toBe(false);
    if (locked.ok) return;
    expect(locked.reason).toBe("locked");
    expect(locked.sku).toBe("story_pass_month");
    expect(state.nodeId).toBe("n_ch01_first_sub");
  });

  it("DEV fake-unlock continues the same line without jumping away", () => {
    const state = playChoices(["c_dodge_both", "c_dodge_party"]);
    const result = unlockAndSelect(state, "c_sub_round_mia");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.entitlements.story_pass_month).toBe(true);
    expect(result.state.nodeId).toBe("n_pay_01_catch_mia");
    expect(result.state.flags.catch_target).toBe("mia");
  });

  it("allows free soft-exit without a pass", () => {
    const state = playChoices(["c_dodge_both", "c_dodge_party", "c_free_busy"]);
    expect(state.nodeId).toBe("n_free_soft_exit");
    const back = playChoices([
      "c_dodge_both",
      "c_dodge_party",
      "c_free_busy",
      "c_back_wall",
    ]);
    expect(back.nodeId).toBe("n_ch01_first_sub");
  });

  it("paid path lands on settle after Vanessa", () => {
    let state = playChoices(
      ["c_dodge_both", "c_dodge_party", "c_sub_round_jade"],
      { story_pass_month: true },
      route,
      { pumpAfter: false },
    );
    expect(state.nodeId).toBe("n_pay_01_catch_jade");

    const seen = new Set<string>();
    while (state.nodeId !== "n_pay_settle") {
      if (seen.has(state.nodeId)) {
        throw new Error(`stuck at ${state.nodeId}`);
      }
      seen.add(state.nodeId);
      state = clickAdvance(state);
    }
    expect(view(state).isSettle).toBe(true);
  });
});
