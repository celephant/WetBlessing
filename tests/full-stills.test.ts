import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FULL_STILL_RECT, cropToTransform } from "../lib/camera-crops";
import {
  selectAssetChangeTransition,
  selectSameAssetMotion,
} from "../lib/scene-presentation";

const root = path.resolve(__dirname, "..");

describe("full stills (no crop / Ken Burns)", () => {
  it("pins contain, fade-on-change, hold — never cover or Ken Burns", () => {
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

    expect(sceneArt).toContain("object-contain");
    expect(sceneArt).not.toMatch(/object-cover/);
    expect(sceneArt).not.toMatch(/inset-\[-8%\]/);
    expect(sceneArt).not.toMatch(/cropToTransform|scene-crop-kenburns|breathe-layer/);
    expect(sceneArt).toContain('data-scene-fit="contain"');
    expect(sceneArt).toContain('data-scene-crop="full"');

    expect(title).toContain("object-contain");
    expect(title).not.toMatch(/object-cover/);
    expect(title).toContain("data-title-idle");

    expect(css).not.toMatch(/@keyframes scene-crop-kenburns|@keyframes scene-breathe/);
    expect(css).toContain(".pause-overlay");
    expect(css).toContain(".paywall-overlay");
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
