import { describe, expect, it } from "vitest";
import { DIALOG_BAR_PERCENT, tokenCssVars, ui } from "./tokens";

describe("Night Pass tokens + Ch01 fixture", () => {
  it("locks the in-dialogue monthly CTA without a store URL", () => {
    expect(ui.paywall.sku).toBe("story_pass_month");
    expect(ui.paywall.gate).toBe("first_sub");
    expect(ui.paywall.nodeId).toBe("n_ch01_first_sub");
    expect(JSON.stringify(ui)).not.toMatch(/https?:\/\//);
  });

  it("reserves the Night Pass dialog bar at 28%", () => {
    expect(ui.name).toBe("WetBlessing Night Pass");
    expect(DIALOG_BAR_PERCENT).toBe(28);
    expect(tokenCssVars()["--wb-dialog-h"]).toBe("28%");
  });
});
