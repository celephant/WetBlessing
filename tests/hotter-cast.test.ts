import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileAllowlist } from "../lib/allowlist";
import { compileRoute, content, DEFAULT_CH01_VERSION, route } from "../lib/content";
import { walkChoiceIndexPaths } from "../lib/choice-index";
import { playChoices, startGame, view } from "../lib/engine";
import { resolveAssetUrl } from "../lib/assets";
import { PAYWALL_HARD } from "../lib/paywall-copy";

const root = path.resolve(__dirname, "..");

const BIBLE_PLATES = [
  "assets/scenes/heat/S06a.webp",
  "assets/scenes/heat/S06b.webp",
  "assets/scenes/heat/S04.webp",
  "assets/scenes/heat/S06c.webp",
  "assets/scenes/heat/S11.webp",
  "assets/scenes/heat/S14.webp",
];

const HEAT_FILES = [
  ...BIBLE_PLATES,
  "assets/scenes/heat/n_heat_pin_mia.webp",
  "assets/scenes/heat/n_heat_sleep_legs.webp",
  "assets/scenes/heat/n_heat_kiss_mia.webp",
  "assets/scenes/heat/n_heat_straddle_jade.webp",
  "assets/scenes/heat/n_heat_jade_cling.webp",
  "assets/scenes/heat/n_heat_kiss_jade.webp",
  "assets/scenes/heat/n_heat_hug_lina.webp",
  "assets/scenes/heat/n_heat_wet_cling.webp",
  "assets/scenes/heat/n_heat_kiss_lina.webp",
  "assets/scenes/heat/n_heat_neck_rae.webp",
  "assets/scenes/heat/n_heat_door_steam.webp",
  "assets/scenes/heat/n_heat_kiss_rae.webp",
  "assets/scenes/heat/n_heat_ot_rae.webp",
];

/** Underage / genital bans stay. 18+ JK/sailor fashion is allowed. */
const FORBIDDEN = /阴茎|阴道|阴蒂|性交|插入|口交|生殖器|高中生|未成年|幼/;

function spokenHay(): string {
  return content.stages[0]!.nodes
    .flatMap((node) => [
      node.text ?? "",
      ...(node.lines?.map((line) => line.text) ?? []),
      ...(node.choices?.map((choice) => choice.text) ?? []),
    ])
    .join("\n");
}

function nodeHay(nodeId: string): string {
  const node = route.nodes.get(nodeId);
  return [node?.text ?? "", ...(node?.lines?.map((line) => line.text) ?? [])].join("\n");
}

describe("hotter-cast Ch01", () => {
  it("keeps 0.4.8-feel-hot as default and fourweek off the allowlist", () => {
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(DEFAULT_CH01_VERSION).toBe("0.4.8-feel-hot");
    expect(compileAllowlist.amendedFor).toBe("0.4.8-feel-hot");
    expect(compileAllowlist.optionalDevAllow?.every((entry) => entry.neverDefault)).toBe(
      true,
    );
    expect(content.routeId).toBe("route_kai_ch01");
    expect(() => compileRoute(content, { asDefault: true })).not.toThrow();
  });

  it("adds college LIs plus Reina without replacing Kai/Mia/Jade/Vanessa", () => {
    expect(content.personas.persona_kai_v1.name).toBe("Kai");
    expect(content.personas.persona_mia_v1.name).toBe("Mia");
    expect(content.personas.persona_jade_v1.name).toBe("Jade");
    expect(content.personas.persona_vanessa_v1.name).toBe("Vanessa");
    expect(content.personas.persona_rae_v1.name).toBe("Rae");
    expect(content.personas.persona_lina_v1.name).toBe("Lina");
    expect(content.personas.persona_reina_v1.name).toBe("Reina");
    const spoken = spokenHay();
    expect(spoken).toMatch(/州立大学|大学/);
    expect(spoken).toMatch(/水手领/);
    expect(spoken).toMatch(/学生事务|带学生证/);
    expect(spoken).not.toMatch(/二十九/);
    expect(spoken).not.toMatch(/只是坐|周一还在|认领/);
    expect(spoken).not.toMatch(FORBIDDEN);
    expect(spoken).not.toMatch(/这一下不是几乎——吻上了/);
    expect(spoken).not.toMatch(/(?<!二)十九/);
  });

  it("walks dorm steam, party 5-way, collage mail, and interrupted kiss stills", () => {
    expect(route.nodes.has("n_dorm_steam")).toBe(true);
    expect(route.nodes.has("n_with_lina")).toBe(true);
    expect(route.nodes.has("n_with_rae")).toBe(true);
    expect(route.nodes.has("n_kiss_mia")).toBe(true);
    expect(route.nodes.has("n_reina_monday")).toBe(false);
    const conflict = route.nodes.get("n_conflict")!;
    expect(conflict.choices?.map((c) => c.choiceId)).toEqual([
      "c_go_mia",
      "c_go_jade",
      "c_go_lina",
      "c_go_rae",
      "c_dodge_party",
    ]);
    expect(route.nodes.get("n_with_mia")?.choices?.find((c) => c.choiceId === "c_wm_close")?.next).toBe(
      "n_kiss_mia",
    );
    expect(route.nodes.get("n_with_mia")?.choices?.find((c) => c.choiceId === "c_wm_ok")?.next).toBe(
      "n_with_mia_round",
    );
    expect(route.nodes.get("n_with_mia")?.choices?.find((c) => c.choiceId === "c_wm_phone")?.next).toBe(
      "n_sms_auto",
    );
    expect(route.nodes.get("n_kiss_mia")?.advance).toBe("n_sms_auto");
    expect(route.nodes.get("n_sms_auto")?.choices?.map((c) => c.choiceId).sort()).toEqual([
      "c_sms_open",
      "c_sms_shut",
    ]);
    expect(route.nodes.get("n_jade_desk")?.choices?.find((c) => c.choiceId === "c_jade_smirk")?.next).toBe(
      "n_dorm_steam",
    );
    expect(route.nodes.get("n_jade_desk")?.choices?.find((c) => c.choiceId === "c_jade_go")?.next).toBe(
      "n_dodge_corridor",
    );
    expect(route.nodes.get("n_dorm_steam")?.advance).toBe("n_conflict");
  });

  it("wires bible plates by assetId and keeps with/OT/catch unique", () => {
    for (const rel of HEAT_FILES) {
      expect(existsSync(path.join(root, "public", rel)), rel).toBe(true);
    }
    expect(route.nodes.get("n_with_mia")?.assetId).toBe("assets/scenes/heat/S06a.webp");
    expect(route.nodes.get("n_with_jade")?.assetId).toBe("assets/scenes/heat/S06b.webp");
    expect(route.nodes.get("n_dorm_steam")?.assetId).toBe("assets/scenes/heat/S04.webp");
    expect(route.nodes.get("n_with_lina")?.assetId).toBe("assets/scenes/heat/S06c.webp");
    expect(route.nodes.get("n_pay_03_vanessa")?.assetId).toBe("assets/scenes/heat/S11.webp");
    expect(route.nodes.get("n_reina_monday")).toBeUndefined();
    expect(route.nodes.get("n_kiss_mia")?.assetId).toBe("assets/scenes/heat/n_heat_kiss_mia.webp");
    expect(route.nodes.get("n_kiss_jade")?.assetId).toBe(
      "assets/scenes/heat/n_heat_kiss_jade.webp",
    );
    expect(route.nodes.get("n_pay_01_catch_jade")?.assetId).toBe(
      "assets/scenes/ch01/ch01-catch-jade.webp",
    );
    expect(route.nodes.get("n_pay_02_ot_jade")?.assetId).toBe(
      "assets/scenes/heat/n_heat_straddle_jade.webp",
    );
    expect(route.nodes.get("n_with_rae")?.assetId).toBe("assets/scenes/heat/n_heat_neck_rae.webp");
    expect(route.nodes.get("n_kiss_rae")?.assetId).toBe("assets/scenes/heat/n_heat_kiss_rae.webp");
    expect(route.nodes.get("n_pay_02_ot_rae")?.assetId).toBe(
      "assets/scenes/heat/n_heat_ot_rae.webp",
    );
    const kisses = [
      route.nodes.get("n_kiss_mia")?.assetId,
      route.nodes.get("n_kiss_jade")?.assetId,
      route.nodes.get("n_kiss_lina")?.assetId,
      route.nodes.get("n_kiss_rae")?.assetId,
      route.nodes.get("n_pay_03_vanessa")?.assetId,
    ];
    expect(new Set(kisses).size).toBe(5);
    for (const who of ["mia", "jade", "lina", "rae"] as const) {
      const trio = [
        route.nodes.get(`n_with_${who}`)?.assetId,
        route.nodes.get(`n_pay_01_catch_${who}`)?.assetId,
        route.nodes.get(`n_pay_02_ot_${who}`)?.assetId,
      ];
      expect(new Set(trio).size, `${who} ${trio.join(" ")}`).toBe(3);
    }
    for (const node of ["n_with_jade", "n_kiss_jade", "n_pay_01_catch_jade", "n_pay_02_ot_jade"]) {
      expect(route.nodes.get(node)?.assetId).not.toMatch(/catch_b/);
    }
    expect(resolveAssetUrl("assets/scenes/heat/S06a.webp")).toBe(
      "/assets/scenes/heat/S06a.webp",
    );
    for (const node of route.nodes.values()) {
      if (!node.assetId) continue;
      const url = resolveAssetUrl(node.assetId);
      expect(existsSync(path.join(root, "public", url.slice(1))), `${node.nodeId} ${url}`).toBe(
        true,
      );
    }
  });

  it("gives each LI a distinct turf and keeps rain on Vanessa only", () => {
    expect(nodeHay("n_with_mia")).toMatch(/床|枕头/);
    expect(nodeHay("n_with_jade")).toMatch(/砖/);
    expect(nodeHay("n_with_jade")).not.toMatch(/雨/);
    expect(nodeHay("n_kiss_jade")).not.toMatch(/雨/);
    expect(nodeHay("n_with_lina")).toMatch(/氯|瓷砖|跳台|毛巾/);
    expect(nodeHay("n_kiss_lina")).not.toMatch(/不是雨/);
    expect(nodeHay("n_dorm_steam")).toMatch(/水手领/);
    expect(nodeHay("n_pay_03_vanessa")).toMatch(/雨/);
    expect(nodeHay("n_sms_auto")).toMatch(/学生事务|拼贴|带学生证/);
    expect(nodeHay("n_sms_auto")).not.toMatch(/黑丝|周一还在|办公时间/);
    const spoken = spokenHay();
    expect(spoken).toMatch(/乳沟|胸/);
    expect(spoken).toMatch(/腿/);
    expect(spoken).toMatch(/脚|赤足/);
    expect(spoken).toMatch(/抱/);
    expect(spoken).toMatch(/腰/);
    expect(spoken).toMatch(/颈/);
    expect(spoken).toMatch(/压/);
    expect(spoken).toMatch(/吻上|嘴对上/);
    expect(spoken).not.toMatch(FORBIDDEN);
    const kissHay = [
      route.nodes.get("n_kiss_mia")?.text,
      ...(route.nodes.get("n_kiss_mia")?.lines?.map((l) => l.text) ?? []),
      route.nodes.get("n_kiss_jade")?.text,
      ...(route.nodes.get("n_kiss_jade")?.lines?.map((l) => l.text) ?? []),
    ].join(" ");
    expect(kissHay).toMatch(/吻上|嘴对上/);
    expect(kissHay).not.toMatch(/这一下不是几乎——吻上了/);
    expect(JSON.stringify(content)).toMatch(/湿/);
  });

  it("keeps choiceIndex ≤ 10 and records rae/lina stats", () => {
    const paths = walkChoiceIndexPaths(route);
    expect(Math.max(...paths.map((p) => p.choiceIndex))).toBeLessThanOrEqual(10);
    expect(Math.max(...paths.map((p) => p.choiceIndex))).toBe(7);
    const lina = playChoices([
      "c_help_mia",
      "c_mia_safe",
      "c_mia_banter",
      "c_go_lina",
      "c_wl_close",
      "c_sms_shut",
    ]);
    expect(lina.nodeId).toBe("n_ch01_catch_lina");
    expect(lina.stats.lina.desire).toBeGreaterThan(0);
    expect(lina.stats.rae.affection).toBe(0);
    expect(view(lina).choices.map((c) => c.choiceId)).toContain("c_sub_round_lina");
    expect(view(lina).choices.map((c) => c.choiceId)).not.toContain("c_sub_round_rae");
    const dodgeWall = playChoices(["c_dodge_both", "c_dodge_party", "c_sms_shut"]);
    expect(dodgeWall.nodeId).toBe("n_ch01_first_sub");
    expect(view(dodgeWall).choices.map((c) => c.choiceId)).toContain("c_sub_round_rae");
    const rae = playChoices(["c_dodge_both", "c_go_rae", "c_wr_close", "c_sms_shut"]);
    expect(rae.flags.went_with).toBe("rae");
    expect(rae.stats.rae.desire).toBeGreaterThan(0);
    const started = startGame();
    expect(started.stats.rae.affection).toBe(0);
    expect(started.stats.lina.affection).toBe(0);
    expect(started.stats.reina.affection).toBe(0);
    expect(started.stats.reina.desire).toBe(0);
  });

  it("sells the Catch freeze on the first-sub overlay, not Monday lecture", () => {
    expect(PAYWALL_HARD["zh-CN"].title).toMatch(/自己的地上/);
    expect(PAYWALL_HARD["zh-CN"].body).toMatch(/没抬头|拉的中途/);
    expect(PAYWALL_HARD["zh-CN"].primaryOwned).toBe("进去。");
    expect(JSON.stringify(PAYWALL_HARD["zh-CN"])).not.toMatch(/周一|把话说完|当场续读|稍后再说/);
    expect(PAYWALL_HARD.behavior.tone).not.toMatch(FORBIDDEN);
    expect(JSON.stringify(PAYWALL_HARD)).not.toMatch(FORBIDDEN);
  });
});
