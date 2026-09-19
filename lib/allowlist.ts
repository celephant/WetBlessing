import type { StoryFile } from "./types";
import allowlistJson from "../content/compile-allowlist.json";

export type CompileAllowEntry = {
  path: string;
  contentVersion: string;
  routeId: string;
};

export type CompileAllowlist = {
  defaultAllow: CompileAllowEntry[];
  denyDefaultGlobs: string[];
  note: string;
};

export const compileAllowlist = allowlistJson as CompileAllowlist;

export function assertDefaultLoad(file: StoryFile, sourcePath: string): void {
  const allowed = compileAllowlist.defaultAllow.some(
    (entry) =>
      entry.path === sourcePath &&
      entry.contentVersion === file.storyVersion &&
      entry.routeId === "route_tomorrow_1",
  );
  if (!allowed) {
    throw new Error(`Default load must be content/story.json @ tomorrow.1 (${sourcePath})`);
  }
}
