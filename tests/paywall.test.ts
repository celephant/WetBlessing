import { describe, expect, it } from "vitest";
import { compileRoute, route } from "../lib/content";
import { tryReadCh02Office, tryReadCh03Night } from "../lib/dev-packs.node";
import {
  clickAdvance,
  playChoices,
  selectChoice,
  unlockNext,
  unlockScope,
  view,
} from "../lib/engine";

describe("in-dialogue paywall", () => {
  it("defaults Catch still to the person you followed, with unpaid switches to other Catch walls", () => {
    const miaPath = playChoices([
      "c_help_mia",
      "c_mia_hugish",
      "c_mia_banter",
      "c_go_mia",
      "c_wm_close",
      "c_sms_shut",
    ]);
    const ids = view(miaPath).choices.map((c) => c.choiceId);
    expect(miaPath.nodeId).toBe("n_ch01_catch_mia");
    expect(ids).toContain("c_sub_round_mia");
    expect(ids).not.toContain("c_sub_round_jade");
    expect(ids).toContain("c_catch_show_jade");
    expect(ids).toContain("c_wall_title");
    expect(ids).not.toContain("c_later");
    expect(ids).not.toContain("c_free_busy");
    expect(ids).not.toContain("c_free_read");
  });

  it("locks story_pass_month choices until entitled", () => {
    const state = playChoices(["c_dodge_both", "c_dodge_party", "c_sms_shut"]);
    expect(state.nodeId).toBe("n_ch01_first_sub");
    expect(state.entitlements.story_pass_month).toBe(false);

    const locked = selectChoice(state, "c_sub_round_mia");
    expect(locked.ok).toBe(false);
    if (locked.ok) return;
    expect(locked.reason).toBe("locked");
    expect(locked.sku).toBe("story_pass_month");
    expect(locked.state.pendingChoiceId).toBe("c_sub_round_mia");
    expect(locked.state.nodeId).toBe("n_ch01_first_sub");
  });

  it("unlockNext fake-unlocks and continues the same line", () => {
    const state = playChoices(["c_dodge_both", "c_dodge_party", "c_sms_shut"]);
    const locked = selectChoice(state, "c_sub_round_mia");
    expect(locked.ok).toBe(false);
    if (locked.ok) return;

    const result = unlockNext(locked.state);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.entitlements.story_pass_month).toBe(true);
    expect(result.state.nodeId).toBe("n_pay_01_catch_mia");
    expect(result.state.flags.catch_target).toBe("mia");
    expect(result.state.pendingChoiceId).toBeNull();
  });

  it("unlockScope w1_continue continues Ch01 without minting the pass", () => {
    const state = playChoices(["c_dodge_both", "c_dodge_party", "c_sms_shut"]);
    const locked = selectChoice(state, "c_sub_round_mia");
    expect(locked.ok).toBe(false);
    if (locked.ok) return;

    const result = unlockScope(locked.state, "w1_continue");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.entitlements.w1_continue).toBe(true);
    expect(result.state.entitlements.story_pass_month).toBe(false);
    expect(result.state.entitlements.w2_office).toBeFalsy();
    expect(result.state.nodeId).toBe("n_pay_01_catch_mia");
  });

  it("title chrome leaves the wall without a story continue", () => {
    const state = playChoices(["c_dodge_both", "c_dodge_party", "c_sms_shut", "c_wall_title"]);
    expect(state.nodeId).toBe("n_title");
  });

  it("paid path lands on settle after Vanessa", () => {
    const state = playChoices(
      ["c_dodge_both", "c_dodge_party", "c_sms_shut", "c_sub_round_jade", "c_vanessa_ok"],
      { story_pass_month: true },
    );
    expect(state.nodeId).toBe("n_pay_settle");
    expect(view(state).isSettle).toBe(true);
  });
});

describe("season walls", () => {
  it("keeps only a paid enter and one free exit on each of the three walls", () => {
    const ch01 = route.nodes.get("n_ch01_first_sub")!;
    expect(ch01.choices?.map((c) => c.choiceId)).not.toContain("c_later");
    expect(ch01.choices?.some((c) => c.gateChoice === "subscribe")).toBe(true);
    expect(ch01.choices?.some((c) => c.gateChoice === "free")).toBe(true);
    expect(JSON.stringify(ch01.lines ?? [])).not.toMatch(/免费只够停在/);

    const ch02 = compileRoute(tryReadCh02Office()!);
    const officeWall = ch02.nodes.get("n_ch02_wall")!;
    expect(officeWall.choices?.map((c) => c.choiceId).sort()).toEqual([
      "c_ch02_enter",
      "c_ch02_leave",
    ]);

    const ch03 = compileRoute(tryReadCh03Night()!);
    for (const id of ["n_s19_mia", "n_s19_jade", "n_s19_lina", "n_s19_rae"]) {
      const ids = ch03.nodes.get(id)?.choices?.map((c) => c.choiceId) ?? [];
      expect(ids, id).toEqual(["c_push", "c_leave"]);
    }
  });
});
