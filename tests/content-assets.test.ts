import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { listNodes, content } from "../lib/content";

const root = path.resolve(__dirname, "..");

describe("wired 0.4.6 assets", () => {
  it("ships ready scene webps under public/", () => {
    const ready = content.meta.artReady ?? [];
    expect(ready.length).toBeGreaterThan(0);

    for (const node of listNodes()) {
      if (!node.assetId) continue;
      const readyish =
        node.artStatus === "ready" || (node.artStatus ?? "").startsWith("ready_");
      if (!readyish) continue;
      const file = path.join(root, "public", node.assetId);
      expect(existsSync(file), `missing ready asset ${node.assetId}`).toBe(true);
    }
  });

  it("ships character refsheets", () => {
    for (const who of ["kai", "mia", "jade", "vanessa"]) {
      expect(
        existsSync(path.join(root, "public/assets/characters", who, "refsheet.png")),
      ).toBe(true);
    }
  });
});
