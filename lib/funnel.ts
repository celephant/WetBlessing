export const FUNNEL_COMPLETED_KEY = "wb.funnel.completed";

export function readFunnelCompleted(): boolean {
  return false;
}

export function isFunnelAuthNode(): boolean {
  return false;
}

export function isFunnelLookNode(): boolean {
  return false;
}

export type FunnelZone = never;

export function funnelChipStyle(_choiceId?: string): { variant?: string; barClass?: string } {
  return {};
}
