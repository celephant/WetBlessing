import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileRoute, listNodes } from "../lib/content";
import {
  tryReadCh02Office,
  tryReadCh03Night,
  tryReadCh04Endings,
} from "../lib/dev-packs.node";
import {
  orientedStill,
  pickStillUrl,
  PORTRAIT_SOURCE_MEDIA,
  PORTRAIT_STILL_BY_LANDSCAPE,
  TITLE_LANDSCAPE_ASSET_ID,
  HALL_OPEN_LANDSCAPE_ASSET_ID,
} from "../lib/orientation-stills";

const root = path.resolve(__dirname, "..");

function publicFile(url: string): string {
  expect(url.startsWith("/")).toBe(true);
  return path.join(root, "public", url.slice(1));
}

describe("orientation still pick (9:16 vs 16:9)", () => {
  it("maps the title hook to S06a and keeps n_open as the Ch01 hall pair", () => {
    expect(pickStillUrl(TITLE_LANDSCAPE_ASSET_ID, "portrait")).toBe(
      "/media/ch01-portrait/C1-M1-portrait.png",
    );
    expect(pickStillUrl(TITLE_LANDSCAPE_ASSET_ID, "landscape")).toBe(
      "/assets/scenes/heat/S06a.webp",
    );
    expect(TITLE_LANDSCAPE_ASSET_ID).not.toContain("n_open");
    expect(HALL_OPEN_LANDSCAPE_ASSET_ID).toBe("assets/scenes/ch01/n_open.webp");
    expect(pickStillUrl(HALL_OPEN_LANDSCAPE_ASSET_ID, "portrait")).toBe(
      "/media/ch01-portrait/title-portrait.png",
    );
    expect(pickStillUrl(HALL_OPEN_LANDSCAPE_ASSET_ID, "landscape")).toBe(
      "/assets/scenes/ch01/n_open.webp",
    );
    expect(pickStillUrl("assets/scenes/ch01/n_conflict.webp", "portrait")).toBe(
      "/media/ch01-portrait/C1-01-portrait.png",
    );
    expect(pickStillUrl("/assets/scenes/ch01/n_conflict.webp", "landscape")).toBe(
      "/assets/scenes/ch01/n_conflict.webp",
    );
    expect(orientedStill("assets/scenes/ch01/n_open.webp").pair).toBe("paired");
    expect(orientedStill("assets/scenes/heat/S06a.webp").pair).toBe("paired");
    expect(orientedStill("assets/scenes/heat/S06c.webp").pair).toBe("paired");
  });

  it("leaves unmatched landscape webps landscape-only (no CSS-crop substitute)", () => {
    expect(pickStillUrl("assets/scenes/ch01/n_jade_desk.webp", "portrait")).toBe(
      "/assets/scenes/ch01/n_jade_desk.webp",
    );
    expect(pickStillUrl("assets/scenes/ch01/n_dodge_corridor.webp", "portrait")).toBe(
      "/assets/scenes/ch01/n_dodge_corridor.webp",
    );
    expect(orientedStill("assets/scenes/ch01/n_jade_desk.webp").pair).toBe(
      "landscape-only",
    );
    expect(orientedStill("assets/scenes/ch01/n_pay_02_ot_a.webp").portraitUrl).toBeNull();
  });

  it("ships every mapped portrait next to the landscape webp", () => {
    for (const [landscape, portrait] of Object.entries(PORTRAIT_STILL_BY_LANDSCAPE)) {
      expect(existsSync(path.join(root, "public", landscape)), landscape).toBe(
        true,
      );
      expect(existsSync(path.join(root, "public", portrait)), portrait).toBe(
        true,
      );
    }
  });

  it("resolves a file on disk for every playable node in both orientations", () => {
    const packs = [
      listNodes(),
      compileRoute(tryReadCh02Office(root)!).nodes.values(),
      compileRoute(tryReadCh03Night(root)!).nodes.values(),
      compileRoute(tryReadCh04Endings(root)!).nodes.values(),
    ];
    for (const nodes of packs) {
      for (const node of nodes) {
        if (!node.assetId) continue;
        for (const orient of ["portrait", "landscape"] as const) {
          const url = pickStillUrl(node.assetId, orient);
          expect(
            existsSync(publicFile(url)),
            `${node.nodeId} ${orient} ${node.assetId} → ${url}`,
          ).toBe(true);
        }
      }
    }
  });

  it("uses a picture source media query so the viewport picks 9:16 vs 16:9", () => {
    const sceneArt = readFileSync(path.join(root, "components/SceneArt.tsx"), "utf8");
    const title = readFileSync(path.join(root, "components/TitleScreen.tsx"), "utf8");
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");

    expect(PORTRAIT_SOURCE_MEDIA).toBe("(orientation: portrait)");
    expect(sceneArt).toContain("<picture>");
    expect(sceneArt).toContain("PORTRAIT_SOURCE_MEDIA");
    expect(sceneArt).toContain("const identity = sceneIdentity");
    expect(sceneArt).toContain("data-still-pair");
    expect(sceneArt).toContain("data-scene-portrait");
    expect(sceneArt).not.toMatch(/object-cover object-top/);

    expect(title).toContain("<picture>");
    expect(title).toContain("TITLE_LANDSCAPE_ASSET_ID");
    expect(title).toContain("data-still-pair");

    expect(css).toContain('data-still-pair="paired"');
    expect(css).toContain(":not([data-still-pair=\"paired\"])");
    expect(css).toContain("bottom: var(--night-pass-dock, 28%)");
    expect(css).toMatch(/orientation:\s*portrait/);
  });
});
