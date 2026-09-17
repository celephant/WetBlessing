import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { content } from "../lib/content";
import { NIGHT_PASS_DIALOG_DOCK, NIGHT_PASS_DIALOG_DOCK_CSS } from "../lib/tokens";

const root = path.resolve(__dirname, "..");

function walkFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, acc);
    } else if (/\.(ts|tsx|css|json|md)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

describe("Slice-0 hard locks", () => {
  it("uses only the 0.4.8-feel-hot content pack on main", () => {
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(
      createHash("sha256")
        .update(readFileSync(path.join(root, "content/CONTENT-ch01-free-to-firstsub.json")))
        .digest("hex"),
    ).toBe("b5052f4568e44ef62c1506d471771b8aea0cd5caaef98bc6c7348eb60d2c2a80");
    expect(content.project).toBe("WetBlessing");
    expect(readdirSync(path.join(root, "content")).sort()).toEqual([
      "ART-camera-crops-v1.json",
      "ART-climax-manifest.json",
      "CONTENT-ch01-free-to-firstsub.json",
      "CONTENT-ch02-office.json",
      "CONTENT-ch03-night.json",
      "CONTENT-ch04-endings.json",
      "CONTENT-fourweek-mini-0.5.0.json",
      "CONTENT-landing-funnel.json",
      "CONTENT-w2-tug-draft.json",
      "CONTENT-w3-edge-draft.json",
      "CONTENT-w4-close-draft.json",
      "UI-tokens.json",
      "compile-allowlist.json",
      "copy",
    ]);
  });

  it("reserves Night Pass dialog dock at 28%", () => {
    expect(NIGHT_PASS_DIALOG_DOCK).toBe(0.28);
    expect(NIGHT_PASS_DIALOG_DOCK_CSS).toBe("28%");
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
    expect(css).toContain("--night-pass-dock: 28%");
    const player = readFileSync(path.join(root, "components/VNPlayer.tsx"), "utf8");
    expect(player).toContain("data-night-pass-dock");
    expect(player).toContain("NIGHT_PASS_DIALOG_DOCK_CSS");
  });

  it("keeps Night Pass grade off adult-site neon", () => {
    const css = readFileSync(path.join(root, "app/globals.css"), "utf8");
    expect(css).not.toMatch(/#ff0033|#ff0000|#FF0033/i);
    expect(css).toContain("#07080c");
    expect(css).not.toMatch(/scene-crop-kenburns|scene-breathe|kenburns-right/);
    expect(css).toContain("rgba(220, 90, 140");
    expect(css).toContain("--motion-dialog-continue-ms, 140ms");
    expect(css).toContain("--motion-choice-ms, 160ms");
    expect(css).toContain("scene-fade-in");
    const paywall = readFileSync(path.join(root, "components/PaywallOverlay.tsx"), "utf8");
    expect(paywall).not.toMatch(/bg-black/);
    expect(paywall).toContain("bg-void/70");
    const fixture = readFileSync(
      path.join(root, "content/CONTENT-ch01-free-to-firstsub.json"),
      "utf8",
    );
    expect(fixture).not.toMatch(/梥/);
  });

  it("does not fetch runtime external URLs", () => {
    const files = walkFiles(root).filter((file) => {
      const rel = path.relative(root, file);
      if (rel === "package-lock.json" || rel === "next-env.d.ts") return false;
      if (rel.startsWith("content/")) return false;
      if (rel === "tests/hard-locks.test.ts") return false;
      return true;
    });
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      const stripped = text
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      if (/https?:\/\//.test(stripped) || /fonts\.googleapis|fonts\.gstatic|cdn\./.test(stripped)) {
        hits.push(path.relative(root, file));
      }
    }
    expect(hits).toEqual([]);
  });
});
