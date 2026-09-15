import type { FlagValue, Flags } from "./types";

function flagEquals(flags: Flags, key: string, expected: string): boolean {
  const current = flags[key];
  if (typeof current === "boolean") {
    return String(current) === expected;
  }
  return String(current ?? "") === expected;
}

/**
 * Fixture flag expressions: `key==value`, `key!=value`, `a && b`, and `default`.
 * `default` is a last-resort key used by fourweek hidden routers.
 */
export function matchFlagExpr(flags: Flags, expr: string): boolean {
  const trimmed = expr.trim();
  if (!trimmed) return false;
  if (trimmed === "default") return true;
  if (trimmed.includes("&&")) {
    return trimmed.split("&&").every((part) => matchFlagExpr(flags, part.trim()));
  }
  const ne = trimmed.indexOf("!=");
  if (ne !== -1) {
    const key = trimmed.slice(0, ne).trim();
    const value = trimmed.slice(ne + 2).trim();
    return !flagEquals(flags, key, value);
  }
  const eq = trimmed.indexOf("==");
  if (eq === -1) {
    return Boolean(flags[trimmed]);
  }
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 2).trim();
  return flagEquals(flags, key, value);
}

export function flagMatches(
  flags: Flags,
  key: string,
  expected: FlagValue,
): boolean {
  return flags[key] === expected;
}
