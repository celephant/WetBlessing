import { describe, expect, it } from "vitest";
import { story } from "../lib/content";
import { hasLegacySave, parseStorySave, STORY_SAVE_KEY } from "../lib/save";

describe("save isolation", () => {
  it("keeps a different storyVersion incompatible without migrating", () => {
    const result = parseStorySave(
      JSON.stringify({
        schemaVersion: 1,
        storyVersion: "0.4.8-feel-hot",
        nodeId: "n_open",
        beatIndex: 0,
        flags: {},
      }),
    );
    expect(result.status).toBe("incompatible");
    if (result.status === "incompatible") {
      expect(result.preserved).toBe(true);
      expect(result.reason).toMatch(/另一版|不能带到/);
    }
  });

  it("accepts a tomorrow.1 snapshot as-is", () => {
    const result = parseStorySave(
      JSON.stringify({
        schemaVersion: 1,
        storyVersion: "tomorrow.1",
        assetManifestVersion: 1,
        nodeId: "scene.invitation",
        beatIndex: 1,
        flags: { "choice.firstVisit": "jade" },
      }),
    );
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.state.nodeId).toBe("scene.invitation");
      expect(result.state.flags["choice.firstVisit"]).toBe("jade");
    }
  });

  it("uses a dedicated save key and leaves legacy keys listed", () => {
    expect(STORY_SAVE_KEY).toBe("wb:tomorrow.1:save");
    expect(STORY_SAVE_KEY).not.toContain("slice0");
    expect(hasLegacySave()).toBe(false);
  });

  it("does not treat firstVisit as the relationship route in a saved snapshot", () => {
    const result = parseStorySave(
      JSON.stringify({
        schemaVersion: 1,
        storyVersion: story.storyVersion,
        assetManifestVersion: 1,
        nodeId: "scene.screening.merge",
        beatIndex: 0,
        flags: {
          "choice.firstVisit": "mia",
          "relationship.route": "none",
        },
      }),
    );
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.state.flags["relationship.route"]).toBe("none");
    }
  });
});
