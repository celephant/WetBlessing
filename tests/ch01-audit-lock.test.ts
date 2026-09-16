import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveAssetUrl } from "../lib/assets";
import { selectCropName } from "../lib/camera-crops";
import { content, route } from "../lib/content";
import { clickAdvance, playChoices, selectChoice, startGame, view } from "../lib/engine";
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
    expect(desk.choices?.find((choice) => choice.choiceId === "c_jade_smirk")?.next).toBe(
      "n_dorm_steam",
    );
    expect(desk.choices?.find((choice) => choice.choiceId === "c_jade_ok")?.next).toBe(
      "n_jade_desk_hold",
    );
    expect(desk.choices?.find((choice) => choice.choiceId === "c_jade_go")?.next).toBe(
      "n_dodge_corridor",
    );
    expect(route.nodes.has("n_mia_tease_auto")).toBe(false);
    const jade = playChoices(
      ["c_talk_jade", "c_jade_smirk"],
      { story_pass_month: false },
      route,
      { pumpAfter: false },
    );
    expect(jade.nodeId).toBe("n_dorm_steam");
    expect(jade.nodeId).not.toBe("n_mia_edge_1");
  });

  it("keeps S14 / Reina office off the free path; S07 mail is dry", () => {
    expect(route.nodes.has("n_reina_monday")).toBe(false);
    expect(route.nodes.get("n_sms_auto")?.choices?.map((c) => c.choiceId).sort()).toEqual([
      "c_sms_open",
      "c_sms_shut",
    ]);
    for (const node of route.nodes.values()) {
      expect(node.assetId ?? "").not.toMatch(/S14\.webp/);
    }
    const sms = [
      route.nodes.get("n_sms_auto")?.text ?? "",
      ...(route.nodes.get("n_sms_auto")?.lines?.map((line) => line.text) ?? []),
    ].join("\n");
    expect(sms).toMatch(/学生事务|带学生证/);
    expect(sms).toMatch(/拼贴|同一只手/);
    expect(sms).not.toMatch(/吻|唇/);
    expect(sms).not.toMatch(/黑丝|二十九|周一还在|办公时间/);
    expect(sms).not.toMatch(BANNED);

    const wall = route.nodes.get("n_ch01_first_sub")!;
    expect(wall.assetId).toBe("assets/scenes/ch01/ch01-s05-party.webp");
    expect(wall.text).toMatch(/四块地/);
    expect(wall.text).not.toMatch(/吻|周一/);
  });

  it("R1 dodge-all unpaid never speaks a kiss", () => {
    const texts: string[] = [];
    let state = startGame({ story_pass_month: false });
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
    for (const choiceId of ["c_dodge_both", "c_dodge_party", "c_sms_shut"] as const) {
      const result = selectChoice(state, choiceId);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      state = result.state;
      drain();
    }
    expect(state.nodeId).toBe("n_ch01_first_sub");
    expect(texts.join("\n")).not.toMatch(/吻|唇/);
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

  it("pauses as a designed letterbox over a frozen still", () => {
    const player = readFileSync(path.join(root, "components/VNPlayer.tsx"), "utf8");
    const overlay = readFileSync(
      path.join(root, "components/PauseOverlay.tsx"),
      "utf8",
    );
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
    expect(player).toContain("frozen={freezePlate}");
    expect(player).toMatch(/paused\s*\|\|/);
    expect(player).toContain("<PauseOverlay");
    expect(overlay).toContain("data-pause-overlay");
    expect(overlay).toContain("data-pause-letterbox");
    expect(overlay).toContain("画面停住");
    expect(overlay).toContain("Night Pass");
    expect(overlay).not.toContain("backdrop-blur-[2px]");
    expect(css).toContain(".pause-freeze-frame");
  });

  it("rewrites spoken copy to cause→reaction Chinese without slogan paste", () => {
    const spoken = spokenHay();
    expect(spoken).not.toMatch(BANNED);
    expect(spoken).not.toMatch(/二十九|黑丝|ぬぷ|ぎち|ずぶ/);
    expect(spoken).not.toMatch(/只是坐|周一还在|认领/);
    expect(spoken).toMatch(/水手领/);
    expect(spoken).toMatch(/学生事务|带学生证/);
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
