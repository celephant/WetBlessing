import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileRoute, route } from "../lib/content";
import { tryReadCh02Office, tryReadCh03Night } from "../lib/dev-packs.node";
import { showsPassChip } from "../lib/choice-variant";

const root = path.resolve(__dirname, "..");

export const CATCH_CHIPS = {
  miaPaid: "进去。（床。腿上还亮着那张图）跨进去，她才肯抬头。",
  jadePaid: "抓住。（干楼梯。闪光关了）手已经伸下来，就差你接住。",
  linaPaid: "下去。（池边。毛巾还挂肩）她在水里看你下来没有。",
  raePaid: "从里面关。（蒸汽门。隔墙听得见）她回了头，就差你把门带上。",
  miaSwitch: "宿舍。（床。灯只一盏）她没抬头，腿上那张图还亮着。",
  jadeSwitch: "楼梯。（干砖。闪光关了）她的手还停在拉的中途。",
  linaSwitch: "水边。（夜池。毛巾挂肩）她还站在水边看你。",
  raeSwitch: "对门。（蒸汽。水手领还湿）她回了头，门缝还开着。",
  leave: "离开。",
} as const;

const CH02_ENTER = "进去。（教員室。门还开着）黑丝已经压在桌沿上。";
const CH03_PUSH = {
  n_s19_mia: "推门。（缝里她的嘴）锁还横着，腰已经自己往前了。",
  n_s19_jade: "推门。（廊里。闪光关了）灯灭了，只剩她的呼吸。",
  n_s19_lina: "推门。（池侧。插销未落）湿衣还在滴，她还站在缝里。",
  n_s19_rae: "推门。（防火门。烘筒在转）她竖着指，隔墙听得见。",
} as const;

const PRICE_ON_CHIP = /通行证|锁 ·|\$8\.99|\$2\.99/;
const HEART_CHIP = /♥|♡|～|〜/;

function choiceOf(nodeId: string, choiceId: string) {
  const node = route.nodes.get(nodeId);
  return node?.choices?.find((choice) => choice.choiceId === choiceId);
}

describe("Catch / wall chips: story only, money after tap", () => {
  it("keeps n_open as the Ch01 hall entry", () => {
    expect(route.entryNodeId).toBe("n_open");
    expect(route.nodes.get("n_open")?.advance).toBe("n_see_both");
  });

  it("writes Catch bark + paren + hint, no hearts, and keeps 离开 free", () => {
    const dodge = route.nodes.get("n_ch01_first_sub")!;
    expect(dodge.choices?.map((c) => c.text)).toEqual([
      CATCH_CHIPS.miaPaid,
      CATCH_CHIPS.jadePaid,
      CATCH_CHIPS.linaPaid,
      CATCH_CHIPS.raePaid,
      CATCH_CHIPS.leave,
    ]);
    expect(dodge.choices).toHaveLength(5);

    expect(choiceOf("n_ch01_catch_jade", "c_sub_round_jade")?.text).toBe(
      CATCH_CHIPS.jadePaid,
    );
    expect(choiceOf("n_ch01_catch_lina", "c_sub_round_lina")?.text).toBe(
      CATCH_CHIPS.linaPaid,
    );
    expect(choiceOf("n_ch01_catch_rae", "c_sub_round_rae")?.text).toBe(
      CATCH_CHIPS.raePaid,
    );

    for (const nodeId of [
      "n_ch01_first_sub",
      "n_ch01_catch_mia",
      "n_ch01_catch_jade",
      "n_ch01_catch_lina",
      "n_ch01_catch_rae",
    ] as const) {
      const node = route.nodes.get(nodeId)!;
      expect(node.choices).toHaveLength(5);
      expect(node.choices?.some((c) => HEART_CHIP.test(c.text))).toBe(false);
      expect(node.choices?.some((c) => PRICE_ON_CHIP.test(c.text))).toBe(false);
      const leave = node.choices?.find((c) => c.choiceId === "c_wall_title");
      expect(leave?.text).toBe(CATCH_CHIPS.leave);
      expect(leave?.requiresEntitlement).toBeUndefined();
      expect(showsPassChip(leave!)).toBe(false);
    }
  });

  it("still gates Catch / office / peek after tap, without painting SKU on chips", () => {
    expect(showsPassChip(choiceOf("n_ch01_first_sub", "c_sub_round_mia")!)).toBe(
      true,
    );
    expect(choiceOf("n_ch01_first_sub", "c_sub_round_mia")?.cta).toBe("story_pass");
    expect(choiceOf("n_ch01_first_sub", "c_sub_round_jade")?.requiresEntitlement).toBe(
      "story_pass",
    );

    const ch02 = compileRoute(tryReadCh02Office()!);
    const enter = ch02.nodes
      .get("n_ch02_wall")
      ?.choices?.find((choice) => choice.choiceId === "c_ch02_enter");
    expect(enter?.text).toBe(CH02_ENTER);
    expect(enter?.requiresEntitlement).toBe("w2_office");
    expect(PRICE_ON_CHIP.test(enter!.text)).toBe(false);

    const ch03 = compileRoute(tryReadCh03Night()!);
    for (const [nodeId, text] of Object.entries(CH03_PUSH)) {
      const push = ch03.nodes.get(nodeId)?.choices?.find((c) => c.choiceId === "c_push");
      expect(push?.text, nodeId).toBe(text);
      expect(push?.requiresEntitlement).toBe("edge_lock");
      expect(PRICE_ON_CHIP.test(push!.text)).toBe(false);
      const leave = ch03.nodes.get(nodeId)?.choices?.find((c) => c.choiceId === "c_leave");
      expect(leave?.text).toBe("离开。");
      expect(leave?.requiresEntitlement).toBeUndefined();
    }
  });

  it("keeps prices on the overlay only, never on ChoiceList or dialog chrome", () => {
    const choices = readFileSync(path.join(root, "components/ChoiceList.tsx"), "utf8");
    const dialog = readFileSync(path.join(root, "components/DialogBox.tsx"), "utf8");
    const overlay = readFileSync(path.join(root, "components/PaywallOverlay.tsx"), "utf8");
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");

    expect(choices).toContain('data-chip-price="off"');
    expect(choices).not.toMatch(PRICE_ON_CHIP);
    expect(choices).not.toContain("PASS_PRICE");
    expect(dialog).not.toMatch(PRICE_ON_CHIP);
    expect(overlay).toContain("一次性通行证");
    expect(overlay).toContain("PASS_PRICE");
    expect(overlay).toContain("zh.tertiary");

    expect(css).toContain(".btn-choice:hover .choice-bar");
    expect(css).toContain(".choice-bar {\n  width: 0.25rem;");
    expect(css).not.toContain(".choice-bar.is-pass");
    expect(css).not.toContain(".btn-choice-pass");
  });
});
