import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileRoute, route } from "../lib/content";
import { tryReadCh02Office, tryReadCh03Night } from "../lib/dev-packs.node";
import { splitChoiceFace } from "../lib/choice-label";
import { showsPassChip } from "../lib/choice-variant";

const root = path.resolve(__dirname, "..");

export const CATCH_CHIPS = {
  miaPaid: "进去。灯只一盏。屏幕还热着贴在她腿间，领口歪着，她还没准你看。",
  jadePaid: "抓住。闪光关了。干砖楼梯上她伸着手，裙边掀着一截，等你接住。",
  linaPaid: "下去。池是空的。毛巾只挂在肩上，锁骨还湿，她看你下来没有。",
  raePaid: "从里面关。水手领湿着贴着胸口。她回了头，热气还往外涌。",
  miaSwitch: "去宿舍。灯只一盏。屏幕还热着贴在她腿间，她没抬头。",
  jadeSwitch: "去楼梯。闪光关了。干砖上她伸着手，裙边掀着一截。",
  linaSwitch: "去水边。池是空的。毛巾只挂在肩上，她还站在池边看你。",
  raeSwitch: "去对门。水手领湿着贴着胸口。她回了头，门缝还开着。",
  leave: "离开。",
} as const;

const CH02_ENTER = "进去。门还开着。黑丝已经压过桌沿，近到你没法把眼睛抬回去。";
const CH03_PUSH = {
  n_s19_mia: "推门。锁还没转。缝里她微张着嘴，呼吸热，腰已经自己往前。",
  n_s19_jade: "推门。廊灯灭了。闪光也关着，缝里只剩她贴过来的呼吸。",
  n_s19_lina: "推门。插销还没落下。湿衣还在滴，她站在缝里看你锁不锁。",
  n_s19_rae: "推门。防火门虚掩着。她竖着指，隔墙听得见你们贴得很近。",
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

  it("writes fluent Catch chips, no shot-list parens, no hearts, and keeps 离开 free", () => {
    const dodge = route.nodes.get("n_ch01_first_sub")!;
    expect(dodge.choices?.map((c) => c.text)).toEqual([
      CATCH_CHIPS.miaPaid,
      CATCH_CHIPS.jadePaid,
      CATCH_CHIPS.linaPaid,
      CATCH_CHIPS.raePaid,
      CATCH_CHIPS.leave,
    ]);
    expect(dodge.choices).toHaveLength(5);

    expect(route.nodes.get("n_ch01_catch_mia")?.choices?.map((c) => c.text)).toEqual([
      CATCH_CHIPS.miaPaid,
      CATCH_CHIPS.jadeSwitch,
      CATCH_CHIPS.linaSwitch,
      CATCH_CHIPS.raeSwitch,
      CATCH_CHIPS.leave,
    ]);
    expect(route.nodes.get("n_ch01_catch_jade")?.choices?.map((c) => c.text)).toEqual([
      CATCH_CHIPS.jadePaid,
      CATCH_CHIPS.miaSwitch,
      CATCH_CHIPS.linaSwitch,
      CATCH_CHIPS.raeSwitch,
      CATCH_CHIPS.leave,
    ]);
    expect(route.nodes.get("n_ch01_catch_lina")?.choices?.map((c) => c.text)).toEqual([
      CATCH_CHIPS.linaPaid,
      CATCH_CHIPS.miaSwitch,
      CATCH_CHIPS.jadeSwitch,
      CATCH_CHIPS.raeSwitch,
      CATCH_CHIPS.leave,
    ]);
    expect(route.nodes.get("n_ch01_catch_rae")?.choices?.map((c) => c.text)).toEqual([
      CATCH_CHIPS.raePaid,
      CATCH_CHIPS.miaSwitch,
      CATCH_CHIPS.jadeSwitch,
      CATCH_CHIPS.linaSwitch,
      CATCH_CHIPS.leave,
    ]);

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
      expect(node.choices?.some((c) => /（|）/.test(c.text))).toBe(false);
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
    expect(enter!.text).not.toMatch(/（|）/);

    const ch03 = compileRoute(tryReadCh03Night()!);
    for (const [nodeId, text] of Object.entries(CH03_PUSH)) {
      const push = ch03.nodes.get(nodeId)?.choices?.find((c) => c.choiceId === "c_push");
      expect(push?.text, nodeId).toBe(text);
      expect(push?.requiresEntitlement).toBe("edge_lock");
      expect(PRICE_ON_CHIP.test(push!.text)).toBe(false);
      expect(push!.text).not.toMatch(/（|）/);
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
    expect(css).toContain("--font-hint");
    expect(css).toContain(".choice-hint {");
    expect(css).toContain(".choice-bark {");
    expect(css).toContain('url("/fonts/noto-serif-sc-hint.ttf")');
    expect(css).not.toMatch(/font-style:\s*italic/);
    expect(choices).toContain("splitChoiceFace");
    expect(choices).toContain("data-choice-bark");
    expect(choices).toContain("data-choice-hint");
  });

  it("splits a short bark from a serif whisper hint", () => {
    expect(splitChoiceFace(CATCH_CHIPS.miaPaid)).toEqual({
      bark: "进去。",
      hint: "灯只一盏。屏幕还热着贴在她腿间，领口歪着，她还没准你看。",
    });
    expect(splitChoiceFace(CATCH_CHIPS.leave)).toEqual({
      bark: "离开。",
      hint: null,
    });
    expect(splitChoiceFace("接招：「箱子我来。」箱角顶着胸口。她肩带已经滑了一截，还看着你。")).toEqual({
      bark: "「箱子我来。」",
      hint: "箱角顶着胸口。她肩带已经滑了一截，还看着你。",
    });
    expect(splitChoiceFace("接招：「电梯口是 Mia。晚上也是。」门还开着。黑丝压着桌沿，等你把话说完。")).toEqual({
      bark: "「电梯口是 Mia。晚上也是。」",
      hint: "门还开着。黑丝压着桌沿，等你把话说完。",
    });
  });
});
