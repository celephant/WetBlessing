import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  CH02_OFFICE_PATH,
  CH03_NIGHT_PATH,
  CH04_ENDINGS_PATH,
  FOURWEEK_MINI_PATH,
  FOURWEEK_WEEK_PATHS,
} from "./dev-packs";
import type { ContentFile } from "./types";

export function tryReadJsonFile<T>(relPath: string, root = process.cwd()): T | null {
  const full = path.join(root, relPath);
  if (!existsSync(full)) return null;
  return JSON.parse(readFileSync(full, "utf8")) as T;
}

/** Official DEV fourweek bytes. Null when the fixture is not installed. */
export function tryReadFourweekMini(root = process.cwd()): ContentFile | null {
  return tryReadJsonFile<ContentFile>(FOURWEEK_MINI_PATH, root);
}

/** DEV Ch02 office pack. Null when the fixture is not installed. */
export function tryReadCh02Office(root = process.cwd()): ContentFile | null {
  return tryReadJsonFile<ContentFile>(CH02_OFFICE_PATH, root);
}

/** DEV Ch03 闭馆夜 pack. Null when the fixture is not installed. */
export function tryReadCh03Night(root = process.cwd()): ContentFile | null {
  return tryReadJsonFile<ContentFile>(CH03_NIGHT_PATH, root);
}

/** DEV Ch04 名分 pack. Null when the fixture is not installed. */
export function tryReadCh04Endings(root = process.cwd()): ContentFile | null {
  return tryReadJsonFile<ContentFile>(CH04_ENDINGS_PATH, root);
}

export function listInstalledFourweekDrafts(root = process.cwd()): string[] {
  return [FOURWEEK_MINI_PATH, ...FOURWEEK_WEEK_PATHS].filter((rel) =>
    existsSync(path.join(root, rel)),
  );
}
