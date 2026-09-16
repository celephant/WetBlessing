import { describe, expect, it } from "vitest";
import { compileRoute, route } from "../lib/content";
import { tryReadCh03Night, tryReadCh04Endings } from "../lib/dev-packs.node";
import {
  clickAdvance,
  playChoices,
  selectChoice,
  startGame,
  view,
} from "../lib/engine";
import { applySeasonCarry, canPlayCh04, seasonContinueTarget } from "../lib/season-continue";
import type { CompiledRoute, Entitlements, Flags, GameState } from "../lib/types";

const pass: Entitlements = {
  story_pass_month: true,
  edge_lock: true,
  w2_office: true,
  w3_edge_night: true,
};

function continuePlay(
  compiled: CompiledRoute,
  flags: Flags,
  choiceIds: string[],
  entitlements: Entitlements = pass,
) {
  const visited: string[] = [];
  let state = applySeasonCarry(startGame(entitlements, compiled), {
    flags,
    stats: startGame(entitlements, compiled).stats,
  });
  visited.push(state.nodeId);
  const drain = () => {
    for (let i = 0; i < 32; i++) {
      const snapshot = view(state, compiled);
      if (snapshot.choices.length > 0 || snapshot.isSettle || !snapshot.canClickAdvance) {
        return;
      }
      const next = clickAdvance(state, compiled);
      if (next.nodeId === state.nodeId && next.beatIndex === state.beatIndex) return;
      state = next;
      if (visited.at(-1) !== state.nodeId) visited.push(state.nodeId);
    }
  };
  drain();
  for (const choiceId of choiceIds) {
    const result = selectChoice(state, choiceId, compiled);
    if (!result.ok) {
      throw new Error(`regression failed at ${choiceId} on ${state.nodeId}: ${result.reason}`);
    }
    state = result.state;
    if (visited.at(-1) !== state.nodeId) visited.push(state.nodeId);
    drain();
    if (visited.at(-1) !== state.nodeId) visited.push(state.nodeId);
  }
  return Object.assign(state, { visited });
}

function spokenAlong(choiceIds: string[]): string {
  const texts: string[] = [];
  let state: GameState = startGame({ story_pass_month: false });
  const drain = () => {
    for (let i = 0; i < 24; i++) {
      const snapshot = view(state);
      texts.push(snapshot.beat.text);
      if (snapshot.choices.length > 0 || snapshot.isSettle) {
        texts.push(...snapshot.choices.map((choice) => choice.text));
        return;
      }
      if (!snapshot.canClickAdvance) return;
      const next = clickAdvance(state);
      if (next.nodeId === state.nodeId && next.beatIndex === state.beatIndex) return;
      state = next;
    }
  };
  drain();
  for (const choiceId of choiceIds) {
    const result = selectChoice(state, choiceId);
    if (!result.ok) throw new Error(result.reason);
    state = result.state;
    drain();
  }
  return texts.join("\n");
}

describe("story-logic sign-off paths", () => {
  const ch03 = compileRoute(tryReadCh03Night()!);
  const ch04 = compileRoute(tryReadCh04Endings()!);

  it("R1 dodge-all unpaid never speaks a kiss", () => {
    const hay = spokenAlong(["c_dodge_both", "c_dodge_party"]);
    expect(hay).not.toMatch(/吻|唇/);
    const wall = playChoices(["c_dodge_both", "c_dodge_party"]);
    expect(wall.nodeId).toBe("n_ch01_first_sub");
    expect(selectChoice(wall, "c_sub_round_mia").ok).toBe(false);
  });

  it("R2 Rae catch + sleepover continues to the Rae ending", () => {
    const night = continuePlay(ch03, { catch_target: "rae", went_with: "mia" }, [
      "c_s18_ok",
      "c_push",
      "c_s20_ok",
      "c_s21_v_ok",
      "c_sms_bind_rae",
    ]);
    expect(night.visited).toContain("n_s18_rae");
    expect(night.flags.edge_sleepover_rae).toBe(true);
    expect(night.flags.ch3_bind).toBe("rae");

    const ending = continuePlay(ch04, night.flags, ["c_s22_ok", "c_s23_ok"]);
    expect(ending.visited).toEqual(expect.arrayContaining(["n_s22_rae", "n_s23_rae", "n_s24_rae"]));
    expect(ending.flags.ending).toBe("end_rae");
  });

  it("R3 leave-the-door with only w2 still reaches a Ch04 ending", () => {
    const w2: Entitlements = { story_pass_month: false, w2_office: true };
    const night = continuePlay(
      ch03,
      { catch_target: "mia" },
      ["c_s18_ok", "c_leave", "c_s21_v_dodge", "c_sms_sting"],
      w2,
    );
    expect(night.nodeId).toBe("n_ch03_settle");
    expect(night.flags.ch3_entered).toBe(false);
    expect(canPlayCh04(night.entitlements, night.flags)).toBe(true);
    expect(seasonContinueTarget("ch03", "n_ch03_settle", night.entitlements, night.flags)?.pack).toBe(
      "ch04",
    );

    const ending = continuePlay(ch04, night.flags, ["c_s23_ok"], w2);
    expect(ending.visited).toContain("n_s23_empty");
    expect(ending.visited).not.toContain("n_s22_mia");
    expect(ending.visited).not.toContain("n_s23_mia");
    expect(ending.flags.ending).toBe("end_crash");
  });

  it("R4 Mia sleepover continues to 半公开", () => {
    const night = continuePlay(ch03, { catch_target: "mia" }, [
      "c_s18_ok",
      "c_push",
      "c_s20_ok",
      "c_s21_v_ok",
      "c_sms_bind_mia",
    ]);
    const ending = continuePlay(ch04, night.flags, ["c_s22_ok", "c_s23_ok"]);
    expect(ending.visited).toEqual(expect.arrayContaining(["n_s22_mia", "n_s23_mia", "n_s24_mia"]));
    expect(ending.flags.ending).toBe("end_mia");
  });

  it("R5 Jade sleepover continues to Jade", () => {
    const night = continuePlay(ch03, { catch_target: "jade" }, [
      "c_s18_ok",
      "c_push",
      "c_s20_ok",
      "c_s21_v_soft",
      "c_sms_sting",
    ]);
    const ending = continuePlay(ch04, night.flags, ["c_s22_ok", "c_s23_ok"]);
    expect(ending.visited).toEqual(
      expect.arrayContaining(["n_s22_jade", "n_s23_jade", "n_s24_jade"]),
    );
    expect(ending.flags.ending).toBe("end_jade");
  });

  it("R6 Lina sleepover continues to Lina", () => {
    const night = continuePlay(ch03, { catch_target: "lina" }, [
      "c_s18_ok",
      "c_push",
      "c_s20_ok",
      "c_s21_v_ok",
      "c_sms_bind_lina",
    ]);
    const ending = continuePlay(ch04, night.flags, ["c_s22_ok", "c_s23_ok"]);
    expect(ending.visited).toEqual(
      expect.arrayContaining(["n_s22_lina", "n_s23_lina", "n_s24_lina"]),
    );
    expect(ending.flags.ending).toBe("end_lina");
  });

  it("R7 Vanessa crack without a sleepover continues to Vanessa", () => {
    const night = continuePlay(ch03, { ch3_bind: "none" }, [
      "c_s21_v_ok",
      "c_sms_vanessa",
    ]);
    expect(night.flags.vanessa_crack).toBe(true);
    expect(night.flags.w4_sms_first).toBe("vanessa");
    const ending = continuePlay(ch04, night.flags, ["c_s23_ok"]);
    expect(ending.visited).toContain("n_s23_vanessa");
    expect(ending.visited).not.toContain("n_s22_mia");
    expect(ending.visited).not.toContain("n_s23_mia");
    expect(ending.flags.ending).toBe("end_vanessa");
  });

  it("R8 Reina office kiss without a sleepover continues to Reina", () => {
    const ending = continuePlay(
      ch04,
      { ch3_bind: "none", reina_office_kiss: true, ch3_entered: false },
      ["c_s23_ok"],
    );
    expect(ending.visited).toContain("n_s23_empty");
    expect(ending.visited).not.toContain("n_s23_mia");
    expect(ending.flags.ending).toBe("end_reina");
  });

  it("Ch01 paid kiss follows catch_target, not went_with", () => {
    const state = playChoices(
      ["c_help_mia", "c_mia_safe", "c_mia_box", "c_go_mia", "c_wm_ok", "c_sub_round_jade"],
      { story_pass_month: true },
      route,
      { pumpAfter: false },
    );
    expect(clickAdvance(state).nodeId).toBe("n_pay_02_ot_jade");
  });
});
