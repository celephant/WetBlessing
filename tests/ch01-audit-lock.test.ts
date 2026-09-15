import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveAssetUrl } from "../lib/assets";
import { selectCropName } from "../lib/camera-crops";
import { content, route } from "../lib/content";
import { playChoices } from "../lib/engine";
import {
  resolveScenePresentation,
  selectSameAssetMotion,
} from "../lib/scene-presentation";

const root = path.resolve(__dirname, "..");

const BANNED =
  /认领|两条认领|不是雨|没有蒸汽|衣服都是干的|氯，不是雨|账单会来|两张嘴|身体却先认你|选的人不会被扔/;

function spokenHay(): string {
  return content.stages[0]!.nodes
    .flatMap((node) => [
      node.text ?? "",
      ...(node.lines?.map((line) => line.text) ?? []),
      ...(node.choices?.map((choice) => choice.text) ?? []),
    ])
    .join("\n");
}

describe("Ch01 story + drift audit lock", () => {
  it("plays S01 as its own still, not the dual-lobby fallback", () => {
    expect(route.entryNodeId).toBe("n_open");
    expect(route.nodes.get("n_open")?.assetId).toBe(
      "assets/scenes/ch01/n_open.webp",
    );
    expect(resolveAssetUrl("assets/scenes/ch01/n_open.webp")).toBe(
      "/assets/scenes/ch01/n_open.webp",
    );
    expect(resolveAssetUrl("assets/scenes/ch01/n_see_both.webp")).toBe(
      "/assets/scenes/ch01/n_see_both.webp",
    );
    expect(existsSync(path.join(root, "public/assets/scenes/ch01/n_open.webp"))).toBe(
      true,
    );
  });

  it("sends Jade desk to Rae steam, not Mia elevator", () => {
    const desk = route.nodes.get("n_jade_desk")!;
    expect(desk.choices?.every((choice) => choice.next === "n_dorm_steam")).toBe(
      true,
    );
    expect(route.nodes.has("n_mia_tease_auto")).toBe(false);
    const jade = playChoices(
      ["c_talk_jade", "c_jade_ok"],
      { story_pass_month: false },
      route,
      { pumpAfter: false },
    );
    expect(jade.nodeId).toBe("n_dorm_steam");
    expect(jade.nodeId).not.toBe("n_mia_edge_1");
  });

  it("keeps S14 / Reina office off the free path; S07 mail is dry", () => {
    expect(route.nodes.has("n_reina_monday")).toBe(false);
    expect(route.nodes.get("n_sms_auto")?.advance).toBe("n_ch01_first_sub");
    for (const node of route.nodes.values()) {
      expect(node.assetId ?? "").not.toMatch(/S14\.webp/);
    }
    const sms = [
      route.nodes.get("n_sms_auto")?.text ?? "",
      ...(route.nodes.get("n_sms_auto")?.lines?.map((line) => line.text) ?? []),
    ].join("\n");
    expect(sms).toMatch(/办公时间。带学生证。周一见/);
    expect(sms).not.toMatch(/黑丝|二十九/);
    expect(sms).not.toMatch(BANNED);
  });

  it("freezes stills: hold motion, no crop-cycle, no looping Ken Burns", () => {
    expect(selectSameAssetMotion({ holdCount: 0 })).toBe("hold");
    expect(selectSameAssetMotion({ holdCount: 2, explicitCamera: "wide" })).toBe(
      "hold",
    );
    expect(selectCropName({ holdCount: 0 })).toBe("wide");
    expect(selectCropName({ holdCount: 2, explicitCamera: "close" })).toBe("wide");
    expect(selectCropName({ holdCount: 0, beforeChoices: true })).toBe("wide");
    const open = route.nodes.get("n_open")!;
    const resolved = resolveScenePresentation(open, 0, {
      changeCount: 0,
      holdCount: 0,
      beforeChoices: true,
    });
    expect(resolved.motion).toBe("hold");
    expect(resolved.cropName).toBe("wide");
  });

  it("rewrites spoken copy to cause→reaction Chinese without slogan paste", () => {
    const spoken = spokenHay();
    expect(spoken).not.toMatch(BANNED);
    expect(spoken).not.toMatch(/二十九|黑丝|ぬぷ|ぎち|ずぶ/);
    expect(spoken).toMatch(/十八/);
    expect(spoken).toMatch(/水手领/);
    expect(spoken).toMatch(/办公时间/);
    expect(spoken).toMatch(/周一还在/);
    expect(route.nodes.get("n_see_both")?.choices?.map((c) => c.text)).toEqual([
      "接招：「箱子我来。」",
      "接招：「三十秒。」",
      "躲开：刷卡进门。",
    ]);
  });

  it("gives Rae OT its own file and keeps with/catch/OT unique", () => {
    expect(route.nodes.get("n_kiss_rae")?.assetId).toBe(
      "assets/scenes/heat/n_heat_kiss_rae.webp",
    );
    expect(route.nodes.get("n_pay_02_ot_rae")?.assetId).toBe(
      "assets/scenes/heat/n_heat_ot_rae.webp",
    );
    expect(route.nodes.get("n_kiss_rae")?.assetId).not.toBe(
      route.nodes.get("n_pay_02_ot_rae")?.assetId,
    );
    for (const who of ["mia", "jade", "lina", "rae"] as const) {
      const trio = [
        route.nodes.get(`n_with_${who}`)?.assetId,
        route.nodes.get(`n_pay_01_catch_${who}`)?.assetId,
        route.nodes.get(`n_pay_02_ot_${who}`)?.assetId,
      ];
      expect(new Set(trio).size, `${who} ${trio.join(" ")}`).toBe(3);
    }
  });
});
