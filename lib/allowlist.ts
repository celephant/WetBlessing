import allowlistJson from "../content/compile-allowlist.json";
import type { ContentFile } from "./types";

export type CompileAllowEntry = {
  path: string;
  contentVersion: string;
  routeId: string;
  supersedes?: string;
};

export type CompileAllowlist = {
  patch: string;
  amendedFor?: string;
  defaultAllow: CompileAllowEntry[];
  denyDefaultGlobs: string[];
  note: string;
};

export const compileAllowlist = allowlistJson as CompileAllowlist;

export const DEFAULT_LOAD_VERSIONS = new Set([
  "0.4.8-feel-hot",
  "0.4.8-feel",
]);

export function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`, "u");
}

const implicitIdDeny = ["stage_0*", "route_li_*", "persona_li_*"];

export function matchesDenyGlob(
  value: string,
  globs = compileAllowlist.denyDefaultGlobs,
): boolean {
  const base = value.split("/").pop() ?? value;
  const all = [...new Set([...globs, ...implicitIdDeny])];
  return all.some((glob) => globToRegExp(glob).test(value) || globToRegExp(glob).test(base));
}

export function versionsMatch(allowed: string, fileVersion: string): boolean {
  if (allowed === fileVersion) return true;
  if (DEFAULT_LOAD_VERSIONS.has(allowed) && DEFAULT_LOAD_VERSIONS.has(fileVersion)) {
    return true;
  }
  return false;
}

export function isDefaultAllowlisted(
  file: ContentFile,
  sourcePath: string,
  allow = compileAllowlist,
): boolean {
  return allow.defaultAllow.some(
    (entry) =>
      entry.path === sourcePath &&
      versionsMatch(entry.contentVersion, file.contentVersion) &&
      entry.routeId === file.routeId,
  );
}

export function collectDeniedIds(file: ContentFile, sourcePath: string): string[] {
  const hits: string[] = [];
  if (matchesDenyGlob(sourcePath)) hits.push(sourcePath);
  if (matchesDenyGlob(file.routeId)) hits.push(file.routeId);
  for (const stage of file.stages) {
    if (matchesDenyGlob(stage.stageId)) hits.push(stage.stageId);
  }
  for (const personaId of Object.keys(file.personas ?? {})) {
    if (matchesDenyGlob(personaId)) hits.push(personaId);
  }
  return hits;
}

/** Default player/compile load: allowlisted 0.4.8-feel-hot Kai Ch01 only. */
export function assertDefaultLoad(file: ContentFile, sourcePath: string): void {
  const denied = collectDeniedIds(file, sourcePath);
  if (denied.length > 0) {
    throw new Error(
      `P-D2 deny: frozen/non-MVP ids are not default-loadable (${denied.join(", ")})`,
    );
  }
  if (!isDefaultAllowlisted(file, sourcePath)) {
    throw new Error(
      `P-D2 deny: default load requires contentVersion=0.4.8-feel-hot routeId=route_kai_ch01 (${sourcePath})`,
    );
  }
}
