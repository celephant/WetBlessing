import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");

describe("immersive UI as frost on the still", () => {
  it("keeps Night Pass dock and frosts chrome instead of a black well", () => {
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
    const player = readFileSync(path.join(root, "components/VNPlayer.tsx"), "utf8");
    const toolbar = readFileSync(
      path.join(root, "components/PlayToolbar.tsx"),
      "utf8",
    );
    const paywall = readFileSync(
      path.join(root, "components/PaywallOverlay.tsx"),
      "utf8",
    );
    const choices = readFileSync(
      path.join(root, "components/ChoiceList.tsx"),
      "utf8",
    );

    expect(css).toContain("--night-pass-dock: 28%");
    expect(player).toContain('data-night-pass-dock="28"');
    expect(css).toContain("--glass-blur: 32px");
    expect(css).toContain("--glass-blur-chip: 20px");
    expect(css).toContain("blur(var(--glass-blur, 32px))");
    expect(css).toContain("rgba(18, 20, 28, 0.34)");
    expect(css).toContain("rgba(18, 20, 28, 0.26)");
    expect(css).not.toContain("rgba(25, 22, 32, 0.88)");
    expect(css).not.toContain("blur(12px)");
    expect(css).toContain("background: #ff4b6b");
    expect(css).toContain("scale(0.98)");
    expect(css).not.toMatch(/@keyframes\s+(bounce|shake|screen-shake)/i);
    expect(css).not.toMatch(/animation:[^;]*infinite[^;]*neon/i);
    expect(css).not.toContain("cursor: url(");

    expect(toolbar).toContain("标题");
    expect(toolbar).toContain("历史");
    expect(toolbar).toContain("自动");
    expect(toolbar).toContain("看图");
    expect(toolbar).toContain("静音");
    expect(toolbar).toContain("data-pause-toggle");
    expect(toolbar).toContain("data-mute-toggle");
    expect(player).toContain("data-muted");
    expect(player).toContain("onToggleMute");

    expect(choices).toContain("ChoiceCueFace");
    expect(choices).toContain("onClick={() => onSelect(choice.choiceId)}");
    expect(paywall).toContain("zh.tertiary");
    expect(paywall).toContain("paywall-card");
    expect(paywall).not.toMatch(/一键深入|免密|艾莉西亚|#FFB800|#ffb800/i);
  });
});
