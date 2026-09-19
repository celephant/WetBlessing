import { compiledStory } from "./content";
import type { CompiledStory } from "./types";

export type PlayPackId = "default";

export function playPackId(_pack?: string | null): PlayPackId {
  return "default";
}

export function resolvePlayRoute(_pack?: string | null): CompiledStory {
  return compiledStory;
}
