import { describe, expect, it } from "vitest";
import { compileRoute, route } from "../lib/content";
import { tryReadCh02Office, tryReadCh04Endings } from "../lib/dev-packs.node";
import {
  clickAdvance,
  playChoices,
  selectChoice,
  view,
} from "../lib/engine";
import {
  ENTITLEMENT_STORAGE_KEY,
  SAVE_STORAGE_KEY,
  SEASON_CARRY_KEY,
} from "../lib/entitlement";
import { FUNNEL_COMPLETED_KEY } from "../lib/funnel";
import { clearRunProgress, dismissPaywallToTitle } from "../lib/new-run";
import { PAYWALL_HARD, CHAPTER_UNLOCK_PRICE } from "../lib/paywall-copy";
import { PASS_PRICE } from "../lib/tokens";

describe("design-lock: went_with ≠ Catch ≠ OT", () => {
  it("keeps n_open as the Ch01 hall entry", () => {
    expect(route.entryNodeId).toBe("n_open");
    expect(route.nodes.get("n_open")?.advance).toBe("n_see_both");
  });

  it("states the collage as afternoon, not a night photograph", () => {
    const sms = [
      route.nodes.get("n_sms_auto")?.text ?? "",
      ...(route.nodes.get("n_sms_auto")?.lines?.map((line) => line.text) ?? []),
    ].join("\n");
    expect(sms).toMatch(/今天下午/);
    expect(sms).not.toMatch(/夜里拍|今晚拍的/);
    const opened = [
      route.nodes.get("n_sms_open")?.text ?? "",
      ...(route.nodes.get("n_sms_open")?.lines?.map((line) => line.text) ?? []),
    ].join("\n");
    expect(opened).toMatch(/有人按了快门/);
    expect(opened).not.toMatch(/Jade 发了|Troy 发/);
  });

  it("lets the same run follow Mia then switch Catch to Jade; OT follows Catch", () => {
    const wall = playChoices([
      "c_help_mia",
      "c_mia_hugish",
      "c_mia_banter",
      "c_go_mia",
      "c_wm_close",
      "c_sms_shut",
    ]);
    expect(wall.nodeId).toBe("n_ch01_catch_mia");
    expect(wall.flags.went_with).toBe("mia");
    expect(wall.flags.catch_target).toBeUndefined();
    expect(view(wall).choices.map((c) => c.choiceId)).toEqual([
      "c_sub_round_mia",
      "c_catch_show_jade",
      "c_catch_show_lina",
      "c_catch_show_rae",
      "c_wall_title",
    ]);
    expect(view(wall).choices.map((c) => c.choiceId)).not.toContain("c_sub_round_jade");

    const switched = selectChoice(wall, "c_catch_show_jade");
    expect(switched.ok).toBe(true);
    if (!switched.ok) return;
    expect(switched.state.nodeId).toBe("n_ch01_catch_jade");
    expect(switched.state.flags.went_with).toBe("mia");
    expect(switched.state.flags.catch_target).toBeUndefined();
    expect(route.nodes.get(switched.state.nodeId)?.assetId).toBe(
      "assets/scenes/ch01/ch01-catch-jade.webp",
    );

    const paid = playChoices(
      [
        "c_help_mia",
        "c_mia_hugish",
        "c_mia_banter",
        "c_go_mia",
        "c_wm_close",
        "c_sms_shut",
        "c_catch_show_jade",
        "c_sub_round_jade",
      ],
      { story_pass_month: true },
      route,
      { pumpAfter: false },
    );
    expect(paid.flags.went_with).toBe("mia");
    expect(paid.flags.catch_target).toBe("jade");
    expect(paid.nodeId).toBe("n_pay_01_catch_jade");
    expect(clickAdvance(paid).nodeId).toBe("n_pay_02_ot_jade");
  });

  it("does not treat unused follow targets as stood_up", () => {
    const mia = playChoices(["c_help_mia", "c_mia_hugish", "c_mia_banter", "c_go_mia"]);
    expect(mia.flags.went_with).toBe("mia");
    expect(mia.flags.stood_up_jade).not.toBe(true);
    expect(mia.flags.stood_up_lina).not.toBe(true);
    const dodge = playChoices(["c_dodge_both", "c_dodge_party"]);
    expect(dodge.flags.went_with).toBe("none");
    expect(dodge.flags.stood_up_mia).not.toBe(true);
  });
});

describe("design-lock: overlay dismiss ≠ story leave", () => {
  it("keeps the wall node and does not select 离开", () => {
    const wall = playChoices(["c_dodge_both", "c_dodge_party", "c_sms_shut"]);
    const locked = selectChoice(wall, "c_sub_round_mia");
    expect(locked.ok).toBe(false);
    if (locked.ok) return;
    const dismissed = dismissPaywallToTitle(locked.state);
    expect(dismissed.nodeId).toBe("n_ch01_first_sub");
    expect(dismissed.pendingChoiceId).toBeNull();
    expect(dismissed.flags).toEqual(locked.state.flags);
    expect(dismissed.entitlements).toEqual(locked.state.entitlements);

    const left = playChoices([
      "c_dodge_both",
      "c_dodge_party",
      "c_sms_shut",
      "c_wall_title",
    ]);
    expect(left.nodeId).toBe("n_title");
  });
});

describe("design-lock: buyout is policy, not a live SKU", () => {
  it("keeps current prices and does not sell story_pass_month as 买断 or 月卡", () => {
    expect(PASS_PRICE).toBe(8.99);
    expect(CHAPTER_UNLOCK_PRICE).toBe(2.99);
    expect(PAYWALL_HARD["zh-CN"].primary).toBe("开通剧本通行证 · $8.99");
    expect(JSON.stringify(PAYWALL_HARD["zh-CN"])).not.toMatch(/买断|月卡|订阅/);
    expect(PAYWALL_HARD.behavior.primaryAction).toBe("checkout_sku:story_pass_month");
  });
});

describe("design-lock: B6 new run is not same-run Catch switch", () => {
  it("clears save / carry / funnel and keeps entitlements", () => {
    const store: Record<string, string> = {
      [SAVE_STORAGE_KEY]: "{\"nodeId\":\"n_ch01_catch_mia\"}",
      [`${SAVE_STORAGE_KEY}:ch02`]: "{}",
      [SEASON_CARRY_KEY]: "{\"flags\":{\"went_with\":\"mia\"}}",
      [FUNNEL_COMPLETED_KEY]: "1",
      [ENTITLEMENT_STORAGE_KEY]: JSON.stringify({
        story_pass_month: false,
        w1_continue: true,
        w2_office: false,
        w3_edge_night: false,
      }),
    };
    const memory = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
    (globalThis as { window?: { localStorage: typeof memory } }).window = {
      localStorage: memory,
    };
    (globalThis as { localStorage?: typeof memory }).localStorage = memory;

    clearRunProgress();
    expect(store[SAVE_STORAGE_KEY]).toBeUndefined();
    expect(store[`${SAVE_STORAGE_KEY}:ch02`]).toBeUndefined();
    expect(store[SEASON_CARRY_KEY]).toBeUndefined();
    expect(store[FUNNEL_COMPLETED_KEY]).toBeUndefined();
    expect(JSON.parse(store[ENTITLEMENT_STORAGE_KEY]!).w1_continue).toBe(true);
  });
});

describe("design-lock: Ch02 history and Ch04 empty endings", () => {
  it("covers Mia / other / none in cafeteria and office replies", () => {
    const compiled = compileRoute(tryReadCh02Office()!);
    const cafe = compiled.nodes.get("n_s13_router")!.advanceByFlag!;
    expect(cafe.default).toBe("n_s13_none");
    expect(cafe["catch_target==lina"]).toBe("n_s13_other");
    expect(compiled.nodes.get("n_s14_ask_mia")?.choices?.[0]?.text).toMatch(/晚上也是/);
    expect(compiled.nodes.get("n_s14_ask_other")?.choices?.[0]?.text).toMatch(/下午/);
    expect(compiled.nodes.get("n_s14_ask_none")?.choices?.[0]?.text).toMatch(/谁也没跟/);
    expect(compiled.nodes.get("n_s14_office")?.text).toMatch(/电梯口两张脸/);
    expect(compiled.nodes.get("n_s14_office")?.text).not.toMatch(/派对里另一个人/);
    expect(compiled.nodes.get("n_s13_jade")?.lines?.map((l) => l.text).join("\n")).toMatch(
      /右边那张脸/,
    );
    expect(compiled.nodes.get("n_s13_none")?.lines?.map((l) => l.text).join("\n")).toMatch(
      /群是下午/,
    );
    expect(compiled.nodes.get("n_s13_other")?.lines?.map((l) => l.text).join("\n")).toMatch(
      /昨晚——不是这张下午的图/,
    );
    const cafeHay = ["n_s13_mia", "n_s13_jade", "n_s13_other", "n_s13_none", "n_s13_both"]
      .map((id) => {
        const node = compiled.nodes.get(id);
        return [node?.text ?? "", ...(node?.lines?.map((l) => l.text) ?? [])].join("\n");
      })
      .join("\n");
    expect(cafeHay).not.toMatch(/门口那一下|你鸽了|放鸽子/);
  });

  it("splits 中性独行 from 背约 on the same empty still", () => {
    const compiled = compileRoute(tryReadCh04Endings()!);
    expect(compiled.nodes.get("n_s24_solo")?.assetId).toBe(
      compiled.nodes.get("n_s24_crash")?.assetId,
    );
    expect(compiled.nodes.get("n_s24_solo")?.setFlags).toMatchObject({ ending: "end_solo" });
    expect(compiled.nodes.get("n_s24_solo")?.text).toMatch(/那两张下午的图/);
    expect(compiled.nodes.get("n_s24_solo")?.lines?.[0]?.text).toMatch(/他没有答应谁/);
    expect(compiled.nodes.get("n_s24_crash")?.lines?.[0]?.text).toMatch(/该兑现的没有兑现/);
    expect(compiled.nodes.get("n_s24_crash")?.lines?.[0]?.text).not.toMatch(/这一轮他赢|Troy 赢了/);
    expect(compiled.nodes.get("n_s23_empty")?.text).toMatch(/旁边没有她/);
    expect(
      [compiled.nodes.get("n_s23_empty")?.text, ...(compiled.nodes.get("n_s23_empty")?.lines?.map((l) => l.text) ?? [])].join(
        "\n",
      ),
    ).not.toMatch(/门缝|今早离开/);
  });
});
