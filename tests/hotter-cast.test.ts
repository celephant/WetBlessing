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
    expect(spoken).toMatch(/十八/);
    expect(spoken).toMatch(/二十九/);
    expect(spoken).toMatch(/州立大学|大学/);
    expect(spoken).toMatch(/水手领/);
    expect(spoken).toMatch(/周一/);
    expect(spoken).toMatch(/Reina|教員室|办公时间/);
    expect(spoken).not.toMatch(FORBIDDEN);
    expect(spoken).not.toMatch(/这一下不是几乎——吻上了/);
    expect(spoken).not.toMatch(/(?<!二)十九/);
  });

  it("walks dorm steam, party 5-way, collage/Monday, and interrupted kiss stills", () => {
    expect(route.nodes.has("n_dorm_steam")).toBe(true);
    expect(route.nodes.has("n_with_lina")).toBe(true);
    expect(route.nodes.has("n_with_rae")).toBe(true);
    expect(route.nodes.has("n_kiss_mia")).toBe(true);
    expect(route.nodes.has("n_reina_monday")).toBe(true);
    const conflict = route.nodes.get("n_conflict")!;
    expect(conflict.choices?.map((c) => c.choiceId)).toEqual([
      "c_go_mia",
      "c_go_jade",
      "c_go_lina",
      "c_go_rae",
      "c_dodge_party",
    ]);
    expect(route.nodes.get("n_with_mia")?.choices?.every((c) => c.next === "n_kiss_mia")).toBe(
      true,
    );
    expect(route.nodes.get("n_kiss_mia")?.advance).toBe("n_sms_auto");
    expect(route.nodes.get("n_sms_auto")?.advance).toBe("n_reina_monday");
    expect(route.nodes.get("n_reina_monday")?.advance).toBe("n_ch01_first_sub");
    expect(route.nodes.get("n_mia_tease_auto")?.advance).toBe("n_dorm_steam");
    expect(route.nodes.get("n_dorm_steam")?.advance).toBe("n_conflict");
    expect(route.nodes.get("n_reina_monday")?.choices).toBeUndefined();
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
    expect(route.nodes.get("n_reina_monday")?.assetId).toBe("assets/scenes/heat/S14.webp");
    expect(route.nodes.get("n_kiss_mia")?.assetId).toBe("assets/scenes/heat/n_heat_kiss_mia.webp");
    expect(route.nodes.get("n_kiss_jade")?.assetId).toBe(
      "assets/scenes/heat/n_heat_kiss_jade.webp",
    );
    expect(route.nodes.get("n_pay_01_catch_jade")?.assetId).toBe(
      "assets/scenes/heat/n_heat_jade_cling.webp",
    );
    expect(route.nodes.get("n_pay_02_ot_jade")?.assetId).toBe(
      "assets/scenes/heat/n_heat_straddle_jade.webp",
    );
    expect(route.nodes.get("n_with_rae")?.assetId).toBe("assets/scenes/heat/n_heat_neck_rae.webp");
    expect(route.nodes.get("n_kiss_rae")?.assetId).toBe("assets/scenes/heat/n_heat_kiss_rae.webp");
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
    expect(nodeHay("n_with_lina")).toMatch(/氯|瓷砖|跳台/);
    expect(nodeHay("n_kiss_lina")).toMatch(/不是雨/);
    expect(nodeHay("n_dorm_steam")).toMatch(/水手领/);
    expect(nodeHay("n_pay_03_vanessa")).toMatch(/雨/);
    expect(nodeHay("n_reina_monday")).toMatch(/黑丝|教員室|周一/);
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
    expect(Math.max(...paths.map((p) => p.choiceIndex))).toBe(6);
    const lina = playChoices(["c_help_mia", "c_mia_safe", "c_mia_box", "c_go_lina", "c_wl_close"]);
    expect(lina.nodeId).toBe("n_ch01_first_sub");
    expect(lina.stats.lina.desire).toBeGreaterThan(0);
    expect(lina.stats.rae.affection).toBe(0);
    expect(view(lina).choices.map((c) => c.choiceId)).toContain("c_sub_round_rae");
    const rae = playChoices(["c_dodge_both", "c_go_rae", "c_wr_close"]);
    expect(rae.flags.went_with).toBe("rae");
    expect(rae.stats.rae.desire).toBeGreaterThan(0);
    const started = startGame();
    expect(started.stats.rae.affection).toBe(0);
    expect(started.stats.lina.affection).toBe(0);
    expect(started.stats).not.toHaveProperty("reina");
  });

  it("keeps paywall copy interrupted-kiss plus Monday, not porn", () => {
    expect(PAYWALL_HARD["zh-CN"].title).toMatch(/吻|唇|水汽|嘴对上/);
    expect(PAYWALL_HARD["zh-CN"].title).toMatch(/周一/);
    expect(PAYWALL_HARD["zh-CN"].body).toMatch(/吻/);
    expect(PAYWALL_HARD["zh-CN"].body).toMatch(/Reina|办公室/);
    expect(PAYWALL_HARD.behavior.tone).not.toMatch(FORBIDDEN);
    expect(JSON.stringify(PAYWALL_HARD)).not.toMatch(FORBIDDEN);
  });
});
