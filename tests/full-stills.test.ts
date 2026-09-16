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
  it("covers the art pane above the dock, fade-on-change, hold", () => {
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
    expect(sceneArt).not.toMatch(/object-contain/);
    expect(sceneArt).not.toMatch(/inset-\[-8%\]/);
    expect(sceneArt).not.toMatch(/cropToTransform|scene-crop-kenburns|breathe-layer/);
    expect(sceneArt).toContain('data-scene-fit="cover"');
    expect(sceneArt).toContain('data-scene-crop="full"');

    expect(css).toContain(".scene-art-pane");
    expect(css).toContain("bottom: var(--night-pass-dock, 28%)");
    expect(css).toContain("object-fit: cover");
    expect(css).toContain("object-position: center 30%");
    expect(css).not.toMatch(/@keyframes scene-crop-kenburns|@keyframes scene-breathe/);

    expect(title).toContain("scene-still-fill");
    expect(title).not.toMatch(/object-contain/);
    expect(title).toContain("data-title-idle");

    expect(pause).toContain("data-choice-overlay");
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
