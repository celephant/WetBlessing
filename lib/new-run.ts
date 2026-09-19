import { clearTomorrowSave, hasTomorrowSave, persistStorySave, readStorySave } from "./save";
import type { GameState } from "./types";

export function persistPackSave(state: GameState): void {
  persistStorySave(state);
}

export function readPackSave(): GameState | null {
  const result = readStorySave();
  return result.status === "ok" ? result.state : null;
}

export function hasAnyRunSave(): boolean {
  return hasTomorrowSave();
}

export function packResumeHref(): string {
  return "/play?resume=1";
}

export function clearRunProgress(): void {
  clearTomorrowSave();
}

export function dismissPaywallToTitle(state: GameState): GameState {
  return state;
}
