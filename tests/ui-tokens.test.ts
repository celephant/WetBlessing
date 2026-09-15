import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { showsYuanGoldSweep } from "../lib/choice-variant";
import { UI_TOKENS_SHA256, tokens } from "../lib/tokens";
import type { Choice } from "../lib/types";

const root = path.resolve(__dirname, "..");

describe("UI-tokens.json Night Pass v1.1.1", () => {
  it("matches the locked SHA256 payload", () => {
    const raw = readFileSync(path.join(root, "content/UI-tokens.json"));
    expect(createHash("sha256").update(raw).digest("hex")).toBe(
      UI_TOKENS_SHA256,
    );
    expect(UI_TOKENS_SHA256).toBe(
      "452d7671f71c8b870242d00aa67cc8ac0e170f58ee842e352132b2a344102072",
    );
  });

  it("locks dialog / continue / stagger / cuts / grade", () => {
    expect(tokens.version).toBe("1.1.1");
    expect(tokens.intimateBeats.forbidFadeOnly).toBe(true);
    expect(tokens.intimateBeats.near_miss.transition).toBe("softZoom");
    expect(tokens.intimateBeats.door_lock.transition).toBe("dip");
    expect(tokens.transitions.softZoomCrop.msMax).toBe(280);
    expect(tokens.transitions.softZoomCrop.msDefault).toBeLessThanOrEqual(280);
    expect(tokens.motion.dialogMs).toBe(220);
    expect(tokens.motion.dialogContinueMs).toBe(140);
    expect(tokens.motion.choiceStaggerMs).toBe(48);
    expect(tokens.transitions.fade.ms).toBe(320);
    expect(tokens.transitions.softZoom.ms).toBe(420);
    expect(tokens.transitions.dip.ms).toBe(380);
    expect(tokens.transitions.dip.overlay.toLowerCase()).toBe("#07080c");
    expect(tokens.transitions.defaults.smsOrPaywall).toBe("dip");
    expect(tokens.transitions.defaults.afterPurchase).toBe("softZoom");
    expect(tokens.transitions.defaults.intimate).toBe("softZoom");
    expect(tokens.grade.defaultIntimate).toBe("warm");
    expect(tokens.grade.defaultSmsWall).toBe("night");
    expect(tokens.grade.warmVeil).toContain("255, 140, 120");
    expect(tokens.grade.magentaMist).toContain("220, 90, 140");
    expect(tokens.grade.forbid.join(" ")).toMatch(/#FF0033|adult neon/i);
    expect(tokens.motion.kenBurnsScale).toBe(1.028);
    expect(tokens.motion.kenBurnsMs).toBe(14_000);
    expect(tokens.paywall.goldOnlyOnYuan).toBe(true);
    expect(tokens.paywall.forbidAllChipsGold).toBe(true);
  });

  it("sweeps gold once on yuan/pass only", () => {
    const yuan: Choice = {
      choiceId: "c_yuan",
      text: "圆场那句",
      next: "n_x",
    };
    const pass: Choice = {
      choiceId: "c_sub",
      text: "把圆场那句说出口",
      next: "n_x",
      gateChoice: "subscribe",
      cta: "story_pass_month",
      onLocked: "show_pass_chip",
    };
    const duo: Choice = {
      choiceId: "c_busy",
      text: "「忙。」",
      next: "n_x",
      gateChoice: "free",
    };
    expect(showsYuanGoldSweep(yuan)).toBe(true);
    expect(showsYuanGoldSweep(pass)).toBe(true);
    expect(showsYuanGoldSweep(duo)).toBe(false);
  });
});
