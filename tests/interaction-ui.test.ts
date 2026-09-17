import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
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
  it("keeps axis tags off the button and never shows hearts", () => {
    expect(playerFacingChoiceText("接招：「箱子我来。」")).toBe("「箱子我来。」");
    expect(playerFacingChoiceText("圆场：看那排纸箱。")).toBe("看那排纸箱。");
    expect(playerFacingChoiceText("躲开：谁也不跟。")).toBe("谁也不跟。");
    expect(playerFacingChoiceText("跟她上楼")).toBe("跟她上楼");
    expect(playerFacingChoiceText("接招：吻♥")).toBe("吻");
    expect(playerFacingChoiceText("进去。")).toBe("进去。");
    expect(splitChoiceFace("进去。灯只一盏。屏幕还热着贴在她腿间。")).toEqual({
      bark: "进去。",
      hint: "灯只一盏。屏幕还热着贴在她腿间。",
    });
    expect(splitChoiceFace("离开。")).toEqual({ bark: "离开。", hint: null });
    expect(splitChoiceFace("离开。今晚就到这里")).toEqual({
      bark: "离开。",
      hint: "今晚就到这里",
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
  it("keeps the 28% dock, hide-ui restore, and equal choice weight", () => {
    const player = readFileSync(path.join(root, "components/VNPlayer.tsx"), "utf8");
    const dialog = readFileSync(path.join(root, "components/DialogBox.tsx"), "utf8");
    const choices = readFileSync(path.join(root, "components/ChoiceList.tsx"), "utf8");
    const cueFace = readFileSync(path.join(root, "components/ChoiceCueButton.tsx"), "utf8");
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
    expect(choices).toContain("choiceCueFace");
    expect(choices).toContain("ChoiceCueFace");
    expect(cueFace).toContain("choice-hint");
    expect(cueFace).toContain("choice-cue");
    expect(cueFace).toContain("choice-connector");
    expect(cueFace).toContain("›");
    expect(choices).toContain('data-choice-chain="on"');
    expect(choices).toContain('data-choice-cue="on"');
    expect(choices).toContain("onClick={() => onSelect(choice.choiceId)}");
    expect(choices).toContain('data-chip-price="off"');
    expect(choices).not.toContain("PASS_PRICE");
    expect(choices).not.toContain("通行证");
    expect(choices).not.toContain("from-[#E8C56A]");
    expect(choices).not.toContain("variantBarClass");
    expect(choices).not.toContain("bg-hot");
    expect(choices).not.toContain("animate-gold-sweep");
    expect(choices).not.toContain("btn-choice-pass");
    expect(choices).not.toMatch(/♥|♡/);
    expect(toolbar).toContain("data-hide-ui");
    expect(toolbar).toContain("看图");
    expect(toolbar).toContain("静音");
    expect(toolbar).toContain("data-mute-toggle");
    expect(toolbar).toContain("标题");
    expect(toolbar).toContain("历史");
    expect(toolbar).toContain("自动");
    expect(toolbar).toContain("data-pause-toggle");
    expect(paywall).toContain("bg-void/70");
    expect(paywall).toContain("进度已保存");
    expect(paywall).toContain("zh.tertiary");
    expect(paywall).toContain("一次性通行证");
    expect(paywall).toContain("假开通一次性通行证");
    expect(paywall).not.toMatch(/月卡|订阅|本月/);
    expect(paywall).toContain("bg-gold");
    expect(paywall).not.toMatch(/倒计时|失去她|bg-black/);
    expect(title).toContain("{resume.label}");
    expect(title).not.toContain("继续上次进度");
    expect(title).toContain('data-title-start="resume"');
    expect(title).toContain('data-title-start="funnel"');
    expect(title).toContain("btn-primary");
    expect(title).toContain("btn-choice-ghost");
    expect(title.indexOf("resume.label")).toBeLessThan(title.indexOf("新开一局"));
    expect(css).toContain("--night-pass-dock: 28%");
    expect(css).toContain("--stage: #191620");
    expect(css).toContain("--rose: #eaa2ae");
    expect(css).toContain("min-height: 52px");
    expect(css).toContain("background: #ff4b6b");
    expect(css).toContain("rgba(18, 20, 28, 0.34)");
    expect(css).toContain("blur(var(--glass-blur, 24px))");
    expect(css).toContain("blur(var(--glass-blur-chip, 20px))");
    expect(css).not.toContain("rgba(18, 20, 28, 0.75)");
    expect(css).not.toContain("rgba(25, 22, 32, 0.88)");
    expect(css).toContain("translateY(1px)");
    expect(css).toContain("scale(0.98)");
    expect(css).toContain(".btn-primary:hover");
    expect(css).toContain(".btn-choice:hover");
    expect(css).toContain(".btn-choice-ghost:hover");
    expect(css).toContain(".btn-choice:hover .choice-bar");
    expect(css).toContain(".btn-choice:hover .choice-connector");
    expect(css).toContain("translateX(2px)");
    expect(css).toContain("max-width: 480px");
    expect(css).not.toContain(".btn-choice-pass");
    expect(css).not.toContain(".choice-bar.is-pass");
    expect(css).toContain("brightness(1.08)");
    expect(css).toContain("brightness(0.96)");
    expect(css).toContain(".paywall-overlay .btn-face:hover");
    expect(css).toContain(".paywall-overlay .btn-face.is-pressed");
    expect(css).not.toContain("#ff5d7a");
    expect(css).not.toMatch(/#f7f1f8|#efe6f0|#fbf6fb/i);
    expect(css).not.toMatch(/font-style:\s*italic/);
    expect(css).not.toMatch(/#ff0033|#FF0033/i);
    expect(css).toContain("[data-reduce-motion=\"on\"]");
    const primaryHover = css.slice(
      css.indexOf(".btn-primary:hover"),
      css.indexOf(".btn-choice {"),
    );
    expect(primaryHover).not.toMatch(/background:/);
    expect(primaryHover).toContain("filter: brightness(1.08)");
  });

  it("does not paint jie/yuan as a correct-answer gold button", () => {
    const choices = readFileSync(path.join(root, "components/ChoiceList.tsx"), "utf8");
    expect(choices).not.toContain("variantBarClass");
    expect(choices).not.toContain("好感");
    expect(choices).not.toContain("最佳选择");
    expect(choices).not.toMatch(/接招|圆场|躲开/);
  });
});
