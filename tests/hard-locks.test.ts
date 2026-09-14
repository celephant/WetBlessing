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
  it("uses only the 0.4.7-feel content pack on main", () => {
    expect(content.contentVersion).toBe("0.4.7-feel");
    expect(content.project).toBe("WetBlessing");
    expect(readdirSync(path.join(root, "content")).sort()).toEqual([
      "CONTENT-ch01-free-to-firstsub.json",
      "UI-tokens.json",
      "compile-allowlist.json",
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
