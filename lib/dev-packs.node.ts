import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  FOURWEEK_MINI_PATH,
  FOURWEEK_WEEK_PATHS,
} from "./dev-packs";
import type { ContentFile } from "./types";

export function tryReadJsonFile<T>(relPath: string, root = process.cwd()): T | null {
  const full = path.join(root, relPath);
  if (!existsSync(full)) return null;
  return JSON.parse(readFileSync(full, "utf8")) as T;
}

/** Official PART F bytes only. Returns null until the valid tar is installed. */
export function tryReadFourweekMini(root = process.cwd()): ContentFile | null {
  return tryReadJsonFile<ContentFile>(FOURWEEK_MINI_PATH, root);
}

export function listInstalledFourweekDrafts(root = process.cwd()): string[] {
  return [FOURWEEK_MINI_PATH, ...FOURWEEK_WEEK_PATHS].filter((rel) =>
    existsSync(path.join(root, rel)),
  );
}
