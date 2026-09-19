import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { story } from "../lib/content";

const root = path.resolve(__dirname, "..");
const marker = /拟定|待核/;

describe("player-facing copy", () => {
  it("strips review markers from speakers the player can see", () => {
    for (const node of story.nodes) {
      for (const beat of node.beats) {
        expect(beat.speaker, node.id).not.toMatch(marker);
        if (beat.speakerAuthored && marker.test(beat.speakerAuthored)) {
          expect(beat.speakerAuthored).not.toBe(beat.speaker);
        }
      }
      for (const variation of node.beatVariations) {
        expect(variation.beat.speaker, node.id).not.toMatch(marker);
      }
      for (const choice of node.choices) {
        expect(choice.text, choice.id).not.toMatch(marker);
      }
      if (node.endingResolver) {
        for (const variant of node.endingResolver.variants) {
          for (const beat of variant.beats) {
            expect(beat.speaker, variant.id).not.toMatch(marker);
          }
        }
      }
    }
  });

  it("keeps identity and extra-arm notes pending in metadata", () => {
    expect(story.nodes.every((node) => node.identityReviewStatus === "pending")).toBe(true);
    expect(story.nodes.every((node) => node.visualReleaseStatus === "requires-human-review")).toBe(
      true,
    );
    expect(compiledPendingArm()).toBe(true);
  });

  it("unbinds old pack query fallbacks and paywall chrome", () => {
    const playClient = readFileSync(path.join(root, "app/play/play-client.tsx"), "utf8");
    const title = readFileSync(path.join(root, "components/TitleScreen.tsx"), "utf8");
    const player = readFileSync(path.join(root, "components/VNPlayer.tsx"), "utf8");
    const toolbar = readFileSync(path.join(root, "components/PlayToolbar.tsx"), "utf8");
    const dialog = readFileSync(path.join(root, "components/DialogBox.tsx"), "utf8");
    expect(playClient).not.toContain("fourweek");
    expect(title).not.toContain("开始入学夜");
    expect(title).not.toContain("?content=funnel");
    expect(title).toContain("明天见");
    expect(player).toContain("Escape");
    expect(dialog).toContain("data-beat-thought");
    expect(player).toContain("data-save-incompatible");
    expect(toolbar).not.toContain("DEV PASS");
    expect(player).not.toContain("PaywallOverlay");
  });
});

function compiledPendingArm(): boolean {
  const kiss = story.nodes.find((node) => node.id === "scene.jade.stair.kiss");
  const stay = story.nodes.find((node) => node.id === "scene.jade.stair.stay");
  return Boolean(kiss?.extraArmPending && stay?.extraArmPending);
}
