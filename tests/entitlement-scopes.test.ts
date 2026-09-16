import { describe, expect, it } from "vitest";
import { compileRoute, content, route } from "../lib/content";
import { tryReadCh02Office, tryReadCh03Night, tryReadCh04Endings } from "../lib/dev-packs.node";
import {
  hasEntitlement,
  playChoices,
  selectChoice,
  startGame,
  unlockNext,
  unlockScope,
  withEntitlement,
  pumpToPrompt,
} from "../lib/engine";
import {
  grantFullEntitleDev,
  mintFullEntitle,
  mintScope,
  parseEntitlements,
} from "../lib/entitlement";
import {
  GATE_CHAPTER_START,
  isWallGate,
  offersEdgeNightSku,
  PAYWALL_CHAPTER,
  paywallCopyForGate,
  SCOPE_W1_CONTINUE,
  SCOPE_W2_OFFICE,
  SCOPE_W3_EDGE_NIGHT,
  scopeForGate,
} from "../lib/paywall-copy";
import { applySeasonCarry, canPlayCh04, seasonContinueTarget } from "../lib/season-continue";

const ch01Dodge = ["c_dodge_both", "c_dodge_party", "c_sms_shut"] as const;

describe("entitlement scopes (fake-unlock only)", () => {
  it("keeps w1_continue, w2_office, and w3_edge_night distinct", () => {
    const empty = startGame({ story_pass_month: false });
    const w1 = withEntitlement(empty, SCOPE_W1_CONTINUE, true);
    const w2 = withEntitlement(empty, SCOPE_W2_OFFICE, true);
    const w3 = withEntitlement(empty, SCOPE_W3_EDGE_NIGHT, true);

    expect(hasEntitlement(w1, SCOPE_W1_CONTINUE, "first_sub")).toBe(true);
    expect(hasEntitlement(w1, SCOPE_W2_OFFICE, GATE_CHAPTER_START)).toBe(false);
    expect(hasEntitlement(w1, "edge_lock", "edge_lock")).toBe(false);
    expect(hasEntitlement(w1, "story_pass_month")).toBe(false);
    expect(hasEntitlement(w1, "story_pass_month", "first_sub")).toBe(true);

    expect(hasEntitlement(w2, SCOPE_W2_OFFICE, GATE_CHAPTER_START)).toBe(true);
    expect(hasEntitlement(w2, SCOPE_W1_CONTINUE, "first_sub")).toBe(false);
    expect(hasEntitlement(w2, "edge_lock", "edge_lock")).toBe(false);
    expect(hasEntitlement(w2, "story_pass_month", "first_sub")).toBe(false);

    expect(hasEntitlement(w3, "edge_lock", "edge_lock")).toBe(true);
    expect(hasEntitlement(w3, SCOPE_W3_EDGE_NIGHT)).toBe(true);
    expect(hasEntitlement(w3, SCOPE_W1_CONTINUE, "first_sub")).toBe(false);
    expect(hasEntitlement(w3, SCOPE_W2_OFFICE, GATE_CHAPTER_START)).toBe(false);
  });

  it("lets the month pass satisfy every later wall", () => {
    const pass = startGame({ story_pass_month: true });
    expect(hasEntitlement(pass, "story_pass_month", "first_sub")).toBe(true);
    expect(hasEntitlement(pass, SCOPE_W1_CONTINUE, "first_sub")).toBe(true);
    expect(hasEntitlement(pass, SCOPE_W2_OFFICE, GATE_CHAPTER_START)).toBe(true);
    expect(hasEntitlement(pass, SCOPE_W3_EDGE_NIGHT, "edge_lock")).toBe(true);
    expect(hasEntitlement(pass, "edge_lock", "edge_lock")).toBe(true);
    expect(hasEntitlement(pass, "chapter_unlock", GATE_CHAPTER_START)).toBe(true);
  });

  it("mints pass + both chapter flags + edge on DEV full entitle", () => {
    const minted = mintFullEntitle();
    expect(minted.story_pass_month).toBe(true);
    expect(minted.w1_continue).toBe(true);
    expect(minted.w2_office).toBe(true);
    expect(minted.w3_edge_night).toBe(true);
    expect(minted.edge_lock).toBe(true);
    expect(grantFullEntitleDev().w3_edge_night).toBe(true);

    const parsed = parseEntitlements(
      JSON.stringify({ story_pass_month: true, w1_continue: true }),
    );
    expect(parsed.story_pass_month).toBe(true);
    expect(parsed.w1_continue).toBe(true);
    expect(parsed.w2_office).toBe(false);
  });

  it("does not treat unscoped chapter_unlock as a season pass", () => {
    const leftover = startGame({
      story_pass_month: false,
      chapter_unlock: true,
    });
    expect(hasEntitlement(leftover, "chapter_unlock")).toBe(false);
    expect(hasEntitlement(leftover, SCOPE_W1_CONTINUE, "first_sub")).toBe(false);
    expect(hasEntitlement(leftover, SCOPE_W2_OFFICE, GATE_CHAPTER_START)).toBe(false);
    expect(hasEntitlement(leftover, "edge_lock", "edge_lock")).toBe(false);
    expect(withEntitlement(leftover, "chapter_unlock", true).entitlements.w2_office).toBeFalsy();
  });

  it("lets w1_continue finish Ch01 first_sub without unlocking Ch02 or the door", () => {
    const wall = playChoices([...ch01Dodge]);
    expect(wall.nodeId).toBe("n_ch01_first_sub");
    const locked = selectChoice(wall, "c_sub_round_mia");
    expect(locked.ok).toBe(false);
    if (locked.ok) return;

    const scoped = unlockScope(locked.state, SCOPE_W1_CONTINUE);
    expect(scoped.ok).toBe(true);
    if (!scoped.ok) return;
    expect(scoped.state.nodeId).toBe("n_pay_01_catch_mia");
    expect(scoped.state.entitlements.w1_continue).toBe(true);
    expect(scoped.state.entitlements.story_pass_month).toBe(false);
    expect(scoped.state.entitlements.w2_office).toBeFalsy();
    expect(scoped.state.entitlements.w3_edge_night).toBeFalsy();

    const ch02 = compileRoute(tryReadCh02Office()!);
    const office = playChoices(["c_s13_ok"], scoped.state.entitlements, ch02);
    expect(office.nodeId).toBe("n_ch02_wall");
    expect(selectChoice(office, "c_ch02_enter", ch02).ok).toBe(false);

    const ch03 = compileRoute(tryReadCh03Night()!);
    const emptyOpen = pumpToPrompt(startGame(scoped.state.entitlements, ch03), ch03);
    expect(emptyOpen.nodeId).toBe("n_s21_vanessa");
    expect(emptyOpen.flags.ch3_bind).toBe("none");
    const continued = pumpToPrompt(
      applySeasonCarry(startGame(scoped.state.entitlements, ch03), {
        flags: scoped.state.flags,
        stats: scoped.state.stats,
      }),
      ch03,
    );
    expect(continued.nodeId).toBe("n_s18_mia");
    const door = selectChoice(continued, "c_s18_ok", ch03);
    expect(door.ok).toBe(true);
    if (!door.ok) return;
    const lockedDoor = pumpToPrompt(door.state, ch03);
    expect(lockedDoor.nodeId).toBe("n_s19_mia");
    expect(selectChoice(lockedDoor, "c_push", ch03).ok).toBe(false);
  });

  it("full fake-unlock on Ch01 still mints the pass and continues the line", () => {
    const wall = playChoices([...ch01Dodge]);
    const locked = selectChoice(wall, "c_sub_round_mia");
    expect(locked.ok).toBe(false);
    if (locked.ok) return;
    const full = unlockNext(locked.state);
    expect(full.ok).toBe(true);
    if (!full.ok) return;
    expect(full.state.entitlements.story_pass_month).toBe(true);
    expect(full.state.entitlements.w1_continue).toBe(true);
    expect(full.state.entitlements.w2_office).toBe(true);
    expect(full.state.entitlements.w3_edge_night).toBe(true);
  });

  it("keeps default /play on Ch01 入学周", () => {
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(route.content.routeId).toBe("route_kai_ch01");
    expect(isWallGate(GATE_CHAPTER_START)).toBe(true);
    expect(scopeForGate("first_sub")).toBe(SCOPE_W1_CONTINUE);
    expect(scopeForGate(GATE_CHAPTER_START)).toBe(SCOPE_W2_OFFICE);
    expect(scopeForGate("edge_lock")).toBe(SCOPE_W3_EDGE_NIGHT);
    expect(paywallCopyForGate(GATE_CHAPTER_START)).toBe(PAYWALL_CHAPTER);
    expect(PAYWALL_CHAPTER.behavior.secondaryAction).toBe(
      "checkout_sku:chapter_unlock|scope=w2_office",
    );
  });
});

describe("season continue + bind none", () => {
  it("carries Ch01 flags into Ch02 without looking up n_pay_settle", () => {
    const state = playChoices(
      [...ch01Dodge, "c_sub_round_mia", "c_vanessa_dodge"],
      { story_pass_month: false, w1_continue: true },
    );
    expect(state.nodeId).toBe("n_pay_settle");
    const ch02 = compileRoute(tryReadCh02Office()!);
    expect(ch02.nodes.has("n_pay_settle")).toBe(false);
    const continued = applySeasonCarry(startGame(state.entitlements, ch02), {
      flags: state.flags,
      stats: state.stats,
    });
    expect(continued.nodeId).toBe("n_ch02_open");
    expect(continued.flags.stood_up_mia).toBe(true);
    const atWall = playChoices(["c_s13_ok"], continued.entitlements, ch02);
    expect(atWall.nodeId).toBe("n_ch02_wall");
    expect(selectChoice(atWall, "c_ch02_enter", ch02).ok).toBe(false);
  });

  it("offers Ch01 paid coda → Ch02 and Ch02 → Ch03", () => {
    expect(
      seasonContinueTarget("default", "n_pay_settle", mintScope(undefined, SCOPE_W1_CONTINUE), {})
        ?.pack,
    ).toBe("ch02");
    expect(
      seasonContinueTarget("default", "n_free_soft_exit", mintFullEntitle(), {}),
    ).toBeNull();
    expect(
      seasonContinueTarget("ch02", "n_ch02_settle", mintScope(undefined, SCOPE_W2_OFFICE), {})
        ?.href,
    ).toBe("/play?content=ch03&continue=1");
  });

  it("includes Ch04 in 这一夜 when they own edge or the pass", () => {
    const pass = mintFullEntitle();
    expect(seasonContinueTarget("ch03", "n_ch03_settle", pass, { ch3_bind: "mia" })?.pack).toBe(
      "ch04",
    );
    const nightOnly = mintScope(undefined, SCOPE_W3_EDGE_NIGHT);
    expect(
      seasonContinueTarget("ch03", "n_ch03_settle", nightOnly, { ch3_bind: "mia" })?.pack,
    ).toBe("ch04");
    expect(
      seasonContinueTarget(
        "ch03",
        "n_ch03_settle",
        mintScope(undefined, SCOPE_W2_OFFICE),
        { ch3_bind: "mia" },
      ),
    ).toBeNull();
  });

  it("does not sell w3_edge_night when bind is none, but Ch04 can still play after Ch02", () => {
    expect(offersEdgeNightSku({ ch3_bind: "none" })).toBe(false);
    expect(offersEdgeNightSku({ ch3_bind: "mia" })).toBe(true);

    const ch03 = compileRoute(tryReadCh03Night()!);
    const empty = ch03.nodes.get("n_s18_empty");
    expect(empty?.gate).toBeUndefined();
    expect(empty?.choices?.some((c) => c.requiresEntitlement)).toBeFalsy();
    expect(empty?.advance).toBe("n_s21_rumor");
    expect(
      empty?.choices?.some(
        (c) => c.requiresEntitlement === "edge_lock" || c.requiresEntitlement === SCOPE_W3_EDGE_NIGHT,
      ),
    ).toBeFalsy();

    const w2 = mintScope(undefined, SCOPE_W2_OFFICE);
    expect(canPlayCh04(w2, { ch3_bind: "none" })).toBe(true);
    expect(canPlayCh04(w2, { ch3_bind: "mia" })).toBe(false);
    expect(canPlayCh04(w2, { ch3_bind: "mia", ch3_entered: false })).toBe(true);
    expect(canPlayCh04(w2, { ch3_bind: "mia", ch3_entered: true })).toBe(false);
    expect(seasonContinueTarget("ch03", "n_ch03_settle", w2, { ch3_bind: "none" })?.pack).toBe(
      "ch04",
    );
  });

  it("lets the save win when chapter-open flags overlap carry", () => {
    const ch04 = compileRoute(tryReadCh04Endings()!);
    const started = startGame({ story_pass_month: true }, ch04);
    const continued = applySeasonCarry(started, {
      flags: {
        went_with: "rae",
        catch_target: "rae",
        ch3_bind: "rae",
        edge_sleepover_rae: true,
      },
      stats: started.stats,
    });
    expect(continued.flags.ch04_day).toBe(true);
    expect(continued.flags.ch3_bind).toBe("rae");
    expect(continued.flags.edge_sleepover_rae).toBe(true);
    expect(continued.flags.edge_sleepover_mia).not.toBe(true);
  });
});
