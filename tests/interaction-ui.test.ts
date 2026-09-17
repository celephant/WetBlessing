import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { playerFacingChoiceText } from "../lib/choice-label";
import {
  choicesAreArmed,
  INTERACTION,
  shouldSkipMotion,
  typeCharMs,
} from "../lib/interaction";
import { parsePlayPrefs } from "../lib/play-prefs";

const root = path.resolve(__dirname, "..");

describe("player-facing choice labels", () => {
  it("keeps axis tags off the button and never shows hearts", () => {
    expect(playerFacingChoiceText("接招：「箱子我来。」")).toBe("「箱子我来。」");
    expect(playerFacingChoiceText("圆场：看那排纸箱。")).toBe("看那排纸箱。");
    expect(playerFacingChoiceText("躲开：谁也不跟。")).toBe("谁也不跟。");
    expect(playerFacingChoiceText("跟她上楼")).toBe("跟她上楼");
    expect(playerFacingChoiceText("接招：吻♥")).toBe("吻");
    expect(playerFacingChoiceText("进去。")).toBe("进去。");
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
    });
    expect(JSON.stringify(prefs)).not.toMatch(/skipUnread/);
  });
});

describe("private-interaction chrome contracts", () => {
  it("keeps the 28% dock, hide-ui restore, and equal choice weight", () => {
    const player = readFileSync(path.join(root, "components/VNPlayer.tsx"), "utf8");
    const dialog = readFileSync(path.join(root, "components/DialogBox.tsx"), "utf8");
    const choices = readFileSync(path.join(root, "components/ChoiceList.tsx"), "utf8");
    const paywall = readFileSync(path.join(root, "components/PaywallOverlay.tsx"), "utf8");
    const title = readFileSync(path.join(root, "components/TitleScreen.tsx"), "utf8");
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
    const toolbar = readFileSync(path.join(root, "components/PlayToolbar.tsx"), "utf8");

    expect(player).toContain("data-night-pass-dock");
    expect(player).toContain("NIGHT_PASS_DIALOG_DOCK_CSS");
    expect(player).toContain("data-ui-hidden");
    expect(player).toContain("data-ui-restore");
    expect(player).toContain("data-choice-overlay");
    expect(player).toContain("items-end");
    expect(player).toContain("data-reduce-motion");
    expect(player).toContain("setEcho");
    expect(dialog).toContain("data-dialog-complete");
    expect(dialog).toContain("data-advance-caret");
    expect(dialog).toContain("data-choice-echo");
    expect(choices).toContain("data-choice-armed");
    expect(choices).toContain('data-choice-weight="equal"');
    expect(choices).toContain("playerFacingChoiceText");
    expect(choices).not.toContain("variantBarClass");
    expect(choices).not.toContain("bg-hot");
    expect(choices).not.toContain("animate-gold-sweep");
    expect(choices).not.toMatch(/♥|♡/);
    expect(toolbar).toContain("data-hide-ui");
    expect(toolbar).toContain("看图");
    expect(paywall).toContain("bg-void/70");
    expect(paywall).toContain("进度已保存");
    expect(paywall).toContain("zh.tertiary");
    expect(paywall).not.toMatch(/倒计时|失去她|bg-black/);
    expect(title).toContain("继续上次进度");
    expect(title).toContain('data-title-start="resume"');
    expect(title.indexOf("btn-primary")).toBeLessThan(title.indexOf("新开一局"));
    expect(css).toContain("--night-pass-dock: 28%");
    expect(css).toContain("--stage: #191620");
    expect(css).toContain("--rose: #eaa2ae");
    expect(css).toContain("min-height: 54px");
    expect(css).toContain("translateY(1px)");
    expect(css).not.toMatch(/#ff0033|#FF0033/i);
    expect(css).toContain("[data-reduce-motion=\"on\"]");
  });

  it("does not paint jie/yuan as a correct-answer gold button", () => {
    const choices = readFileSync(path.join(root, "components/ChoiceList.tsx"), "utf8");
    expect(choices).not.toContain("shadow-[0_0_24px_rgba(232,197,106");
    expect(choices).not.toContain("bg-gold");
    expect(choices).not.toContain("好感");
    expect(choices).not.toContain("最佳选择");
  });
});
