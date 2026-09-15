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

const HEAT_CLUSTER = [
  "assets/scenes/heat/n_heat_kiss_meet.webp",
  "assets/scenes/heat/n_heat_sleep_legs.webp",
  "assets/scenes/heat/n_heat_wet_cling.webp",
  "assets/scenes/heat/n_heat_door_steam.webp",
];

const FORBIDDEN = /阴茎|阴道|阴蒂|性交|插入|口交|生殖器|jk制服|学校制服|高中生|未成年|幼/;

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

  it("adds college LIs Rae and Lina without replacing Kai/Mia/Jade/Vanessa", () => {
    expect(content.personas.persona_kai_v1.name).toBe("Kai");
    expect(content.personas.persona_mia_v1.name).toBe("Mia");
    expect(content.personas.persona_jade_v1.name).toBe("Jade");
    expect(content.personas.persona_vanessa_v1.name).toBe("Vanessa");
    expect(content.personas.persona_rae_v1.name).toBe("Rae");
    expect(content.personas.persona_lina_v1.name).toBe("Lina");
    const spoken = content.stages[0]!.nodes.flatMap((node) => [
      node.text ?? "",
      ...(node.lines?.map((line) => line.text) ?? []),
      ...(node.choices?.map((choice) => choice.text) ?? []),
    ]).join("\n");
    expect(spoken).toMatch(/十九|19/);
    expect(spoken).toMatch(/二十|20/);
    expect(spoken).toMatch(/州立大学|大学/);
    expect(spoken).not.toMatch(FORBIDDEN);
  });

  it("walks dorm steam, party 5-way, and interrupted kiss stills", () => {
    expect(route.nodes.has("n_dorm_steam")).toBe(true);
    expect(route.nodes.has("n_with_lina")).toBe(true);
    expect(route.nodes.has("n_with_rae")).toBe(true);
    expect(route.nodes.has("n_kiss_mia")).toBe(true);
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
    expect(route.nodes.get("n_mia_tease_auto")?.advance).toBe("n_dorm_steam");
    expect(route.nodes.get("n_dorm_steam")?.advance).toBe("n_conflict");
  });

  it("wires completed-kiss and exposure stills by assetId to files on disk", () => {
    for (const rel of HEAT_CLUSTER) {
      expect(existsSync(path.join(root, "public", rel)), rel).toBe(true);
    }
    expect(route.nodes.get("n_kiss_mia")?.assetId).toBe(HEAT_CLUSTER[0]);
    expect(route.nodes.get("n_with_mia")?.assetId).toBe(HEAT_CLUSTER[1]);
    expect(route.nodes.get("n_with_lina")?.assetId).toBe(HEAT_CLUSTER[2]);
    expect(route.nodes.get("n_dorm_steam")?.assetId).toBe(HEAT_CLUSTER[3]);
    expect(route.nodes.get("n_pay_01_catch_lina")?.assetId).toBe(HEAT_CLUSTER[2]);
    expect(route.nodes.get("n_pay_01_catch_rae")?.assetId).toBe(HEAT_CLUSTER[3]);
    expect(resolveAssetUrl(HEAT_CLUSTER[0])).toBe(`/${HEAT_CLUSTER[0]}`);
    for (const node of route.nodes.values()) {
      if (!node.assetId) continue;
      const url = resolveAssetUrl(node.assetId);
      expect(existsSync(path.join(root, "public", url.slice(1))), `${node.nodeId} ${url}`).toBe(
        true,
      );
    }
    const kissHay = [
      route.nodes.get("n_kiss_mia")?.text,
      ...(route.nodes.get("n_kiss_mia")?.lines?.map((l) => l.text) ?? []),
    ].join(" ");
    expect(kissHay).toMatch(/吻|嘴对上/);
    expect(JSON.stringify(content)).toMatch(/湿/);
    expect(JSON.stringify(content)).toMatch(/乳沟|胸/);
    expect(JSON.stringify(content)).toMatch(/腿/);
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
    const rae = playChoices([
      "c_dodge_both",
      "c_go_rae",
      "c_wr_close",
    ]);
    expect(rae.flags.went_with).toBe("rae");
    expect(rae.stats.rae.desire).toBeGreaterThan(0);
    const started = startGame();
    expect(started.stats.rae.affection).toBe(0);
    expect(started.stats.lina.affection).toBe(0);
  });

  it("keeps paywall copy interrupted-kiss, not porn", () => {
    expect(PAYWALL_HARD["zh-CN"].title).toMatch(/吻|唇|水汽/);
    expect(PAYWALL_HARD["zh-CN"].body).toMatch(/吻/);
    expect(PAYWALL_HARD.behavior.tone).not.toMatch(FORBIDDEN);
    expect(JSON.stringify(PAYWALL_HARD)).not.toMatch(FORBIDDEN);
  });
});
