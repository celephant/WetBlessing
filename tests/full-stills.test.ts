import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FULL_STILL_RECT, cropToTransform } from "../lib/camera-crops";
import {
  selectAssetChangeTransition,
  selectSameAssetMotion,
} from "../lib/scene-presentation";

const root = path.resolve(__dirname, "..");

describe("full stills (no Ken Burns / postage stamp)", () => {
  it("frames the complete still on portrait; covers the pane on desktop", () => {
    const sceneArt = readFileSync(
      path.join(root, "components/SceneArt.tsx"),
      "utf8",
    );
    const title = readFileSync(
      path.join(root, "components/TitleScreen.tsx"),
      "utf8",
    );
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
    const pause = readFileSync(
      path.join(root, "components/VNPlayer.tsx"),
      "utf8",
    );
    const paywall = readFileSync(
      path.join(root, "components/PaywallOverlay.tsx"),
      "utf8",
    );

    expect(sceneArt).toContain("scene-art-pane");
    expect(sceneArt).toContain("scene-still-fill");
    expect(sceneArt).not.toMatch(/inset-\[-8%\]/);
    expect(sceneArt).not.toMatch(/cropToTransform|scene-crop-kenburns|breathe-layer/);
    expect(sceneArt).toContain('data-scene-fit="frame"');
    expect(sceneArt).toContain('data-scene-crop="full"');

    expect(css).toContain(".scene-art-pane");
    expect(css).toContain("--scene-still-aspect: 16 / 9");
    expect(css).toContain("bottom: var(--night-pass-dock, 28%)");
    expect(css).toContain("object-fit: cover");
    expect(css).toContain("object-position: center 30%");
    expect(css).toMatch(/orientation:\s*portrait/);
    expect(css).toContain("max-width: 719px");
    expect(css).toContain("object-fit: contain");
    expect(css).toContain("aspect-ratio: var(--scene-still-aspect, 16 / 9)");
    expect(css).toContain("100cqw");
    expect(css).toContain(".scene-art-pane .scene-still-fill");
    expect(css).toContain(".choice-overlay");
    expect(css).not.toMatch(/@keyframes scene-crop-kenburns|@keyframes scene-breathe/);

    expect(title).toContain("scene-still-fill");
    expect(title).toContain("data-title-idle");

    expect(pause).toContain("vn-stage");
    expect(pause).toContain("data-choice-overlay");
    expect(pause).toContain("data-settle-dock");
    expect(pause).toContain("choice-overlay");
    expect(pause).toMatch(/snapshot\.choices\.length > 0/);
    expect(pause).toContain("pause-overlay");
    expect(pause).toContain("data-pause-overlay");
    expect(paywall).toContain("paywall-overlay");

    expect(selectSameAssetMotion({ holdCount: 3 })).toBe("hold");
    expect(selectAssetChangeTransition({ changeCount: 2 })).toBe("fade");
    expect(cropToTransform(FULL_STILL_RECT)).toEqual({
      scale: 1,
      tx: 0,
      ty: 0,
    });
  });
});
