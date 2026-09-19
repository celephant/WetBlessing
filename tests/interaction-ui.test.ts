import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { story } from "../lib/content";
import { playerFacingChoiceText, splitChoiceFace } from "../lib/choice-label";
import {
  choicesAreArmed,
  INTERACTION,
  shouldSkipMotion,
  typeCharMs,
} from "../lib/interaction";
import { parsePlayPrefs } from "../lib/play-prefs";

const root = path.resolve(__dirname, "..");

describe("player-facing choice labels", () => {
  it("renders tomorrow.1 choice text without Ch01 axis tags or hearts", () => {
    const texts = story.nodes.flatMap((node) => node.choices.map((choice) => choice.text));
    expect(texts).toContain("给 Jade 送毛巾，把她的邀约接到手上");
    expect(texts).toContain("陪 Mia 回宿舍取投影线，进她的房间");
    for (const text of texts) {
      expect(text).not.toMatch(/接招|圆场|躲开|入学夜/);
      expect(text).not.toMatch(/[♥♡]/);
      expect(text).not.toMatch(/拟定|待核/);
      expect(playerFacingChoiceText(text)).toBe(text);
    }
    expect(splitChoiceFace("给 Jade 送毛巾，把她的邀约接到手上")).toEqual({
      bark: "给 Jade 送毛巾，把她的邀约接到手上",
      hint: null,
    });
    expect(splitChoiceFace("先把想说的话说完，今晚先不接吻")).toEqual({
      bark: "先把想说的话说完，今晚先不接吻",
      hint: null,
    });
  });
});

describe("interaction timings", () => {
  it("arms new choices after the dismiss guard", () => {
    expect(choicesAreArmed(0, 100)).toBe(false);
    expect(choicesAreArmed(0, INTERACTION.choiceArmMs)).toBe(true);
    expect(typeCharMs("normal", false)).toBe(18);
    expect(typeCharMs("normal", true)).toBe(0);
    expect(typeCharMs("fast", false, true)).toBe(0);
    expect(shouldSkipMotion(false, 400)).toBe(false);
    expect(shouldSkipMotion(false, 80)).toBe(true);
    expect(shouldSkipMotion(true, 400)).toBe(true);
  });

  it("parses reading prefs without inventing skip-unread", () => {
    const prefs = parsePlayPrefs({
      textSpeed: "fast",
      autoAdvance: true,
      skipReadOnly: true,
      reduceMotion: true,
    });
    expect(prefs).toEqual({
      textSpeed: "fast",
      autoAdvance: true,
      skipReadOnly: true,
      reduceMotion: true,
      muted: false,
    });
    expect(JSON.stringify(prefs)).not.toMatch(/skipUnread/);
  });
});

describe("private-interaction chrome contracts", () => {
  it("keeps the 28% dock, hide-ui restore, pause, and keyboard", () => {
    const player = readFileSync(path.join(root, "components/VNPlayer.tsx"), "utf8");
    const dialog = readFileSync(path.join(root, "components/DialogBox.tsx"), "utf8");
    const choices = readFileSync(path.join(root, "components/ChoiceList.tsx"), "utf8");
    const title = readFileSync(path.join(root, "components/TitleScreen.tsx"), "utf8");
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
    const toolbar = readFileSync(path.join(root, "components/PlayToolbar.tsx"), "utf8");

    expect(player).toContain("data-night-pass-dock");
    expect(player).toContain("NIGHT_PASS_DIALOG_DOCK_CSS");
    expect(player).toContain("data-dialog-glass");
    expect(player).toContain("data-ui-hidden");
    expect(player).toContain("data-ui-restore");
    expect(player).toContain("data-choice-overlay");
    expect(player).toContain("Escape");
    expect(dialog).toContain("data-dialog-complete");
    expect(dialog).toContain("data-advance-caret");
    expect(dialog).toContain("data-beat-thought");
    expect(choices).toContain("data-choice-armed");
    expect(choices).toContain('data-choice-weight="equal"');
    expect(choices).toContain('data-chip-price="off"');
    expect(choices).not.toContain("PASS_PRICE");
    expect(choices).not.toContain("通行证");
    expect(toolbar).toContain("data-hide-ui");
    expect(toolbar).toContain("看图");
    expect(toolbar).toContain("data-pause-toggle");
    expect(title).toContain("明天见");
    expect(title).toContain('data-title-start="resume"');
    expect(title).not.toContain("开始入学夜");
    expect(css).toContain("--night-pass-dock: 28%");
    expect(css).toContain("object-fit: contain");
    expect(css).toContain("object-fit: cover");
    expect(css).toContain(".dialog-glass");
    expect(css).toContain("[data-reduce-motion=\"on\"]");
  });

  it("does not paint jie/yuan as a correct-answer gold button", () => {
    const choices = readFileSync(path.join(root, "components/ChoiceList.tsx"), "utf8");
    expect(choices).not.toContain("variantBarClass");
    expect(choices).not.toContain("好感");
    expect(choices).not.toContain("最佳选择");
    expect(choices).not.toMatch(/接招|圆场|躲开/);
  });
});
