import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { route } from "../lib/content";
import { playChoices } from "../lib/engine";

const root = path.resolve(__dirname, "..");

const CATCH_WHO = ["mia", "jade", "lina", "rae"] as const;

function destOf(nodeId: string, choiceId: string) {
  const node = route.nodes.get(nodeId);
  const choice = node?.choices?.find((c) => c.choiceId === choiceId);
  const dest = route.nodes.get(choice?.next ?? "");
  return { node, choice, dest };
}

describe("E-C1-12 Catch KEEP stills", () => {
  it("maps wall and paid Catch off n_heat cling onto ch01-catch-*", () => {
    for (const who of CATCH_WHO) {
      const keep = `assets/scenes/ch01/ch01-catch-${who}.webp`;
      expect(route.nodes.get(`n_ch01_catch_${who}`)?.assetId).toBe(keep);
      expect(route.nodes.get(`n_pay_01_catch_${who}`)?.assetId).toBe(keep);
      expect(keep).not.toMatch(/n_heat_/);
      expect(existsSync(path.join(root, "public", keep))).toBe(true);
    }
  });

  it("does not redraw OT / kiss heat plates and keeps with/catch/OT unique", () => {
    expect(route.nodes.get("n_pay_02_ot_mia")?.assetId).toBe(
      "assets/scenes/heat/n_heat_pin_mia.webp",
    );
    expect(route.nodes.get("n_kiss_mia")?.assetId).toBe(
      "assets/scenes/heat/n_heat_kiss_mia.webp",
    );
    for (const who of CATCH_WHO) {
      const trio = [
        route.nodes.get(`n_with_${who}`)?.assetId,
        route.nodes.get(`n_pay_01_catch_${who}`)?.assetId,
        route.nodes.get(`n_pay_02_ot_${who}`)?.assetId,
      ];
      expect(new Set(trio).size, `${who} ${trio.join(" ")}`).toBe(3);
    }
  });
});

describe("E-C1-07 daytime 接招/圆场/躲开", () => {
  it("leaves the hall chain and does not wire n_open to the night pool", () => {
    expect(route.entryNodeId).toBe("n_open");
    expect(route.nodes.get("n_open")?.advance).toBe("n_see_both");
    expect(route.nodes.get("n_open")?.assetId).toBe("assets/scenes/ch01/n_open.webp");
    expect(route.nodes.has("n_jade_desk")).toBe(true);
    expect(route.nodes.has("n_mia_edge_1")).toBe(true);
    expect(route.nodes.has("n_mia_edge_2")).toBe(true);
    expect(route.nodes.has("n_dodge_corridor")).toBe(true);
  });

  it("makes each 接招/圆场/躲开 change still or speaker", () => {
    for (const nodeId of ["n_jade_desk", "n_mia_edge_1", "n_mia_edge_2"] as const) {
      const node = route.nodes.get(nodeId)!;
      const tagged = (node.choices ?? []).filter((c) =>
        /^(接招|圆场|躲开)/.test(c.text),
      );
      expect(tagged.length, nodeId).toBeGreaterThanOrEqual(2);
      const signatures = new Set<string>();
      for (const choice of tagged) {
        const dest = route.nodes.get(choice.next)!;
        const stillChanged = dest.assetId !== node.assetId;
        const speakerChanged = dest.speaker !== node.speaker;
        expect(
          stillChanged || speakerChanged,
          `${nodeId} ${choice.choiceId} → ${choice.next}`,
        ).toBe(true);
        signatures.add(`${dest.assetId}::${dest.speaker}`);
      }
      expect(signatures.size, nodeId).toBe(tagged.length);
    }
  });

  it("sends Mia elevator dodge through the existing corridor still, not steam", () => {
    const { dest } = destOf("n_mia_edge_1", "c_mia_side");
    expect(dest?.nodeId).toBe("n_dodge_corridor");
    expect(dest?.assetId).toBe("assets/scenes/ch01/n_dodge_corridor.webp");
    const dodge = playChoices(["c_help_mia", "c_mia_side"], { story_pass_month: false }, route, {
      pumpAfter: false,
    });
    expect(dodge.nodeId).toBe("n_dodge_corridor");
    expect(dodge.nodeId).not.toBe("n_dorm_steam");
  });

  it("keeps Catch wall chips and #16 wall routing", () => {
    expect(route.nodes.get("n_ch01_wall_router")?.advanceByFlag).toMatchObject({
      "went_with==mia": "n_ch01_catch_mia",
      "went_with==jade": "n_ch01_catch_jade",
      "went_with==lina": "n_ch01_catch_lina",
      "went_with==rae": "n_ch01_catch_rae",
      default: "n_ch01_first_sub",
    });
    const miaWall = route.nodes.get("n_ch01_catch_mia")!;
    expect(miaWall.choices?.map((c) => c.text)).toEqual([
      "进去。屏幕还热着贴在她腿间。",
      "去楼梯。闪光关了，裙边掀着一截。",
      "去水边。毛巾挂着，她还在看你。",
      "去对门。她回了头，门缝还开着。",
      "离开。",
    ]);
    expect(miaWall.choices?.some((c) => /♥|♡/.test(c.text))).toBe(false);
  });
});
