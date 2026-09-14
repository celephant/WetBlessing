import hard from "../content/copy/ENG-copy-PAYWALL_HARD.json";
import edge from "../content/copy/ENG-copy-PAYWALL_EDGE_LOCK.json";

export const SKU_CHAPTER_UNLOCK = "chapter_unlock";
export const CHAPTER_UNLOCK_PRICE = 2.99;

export type PaywallCopyPack = {
  errorCode: string;
  http: number;
  "zh-CN": {
    title: string;
    body: string;
    primary: string;
    primaryOwned?: string;
    secondary: string;
    tertiary: string;
  };
  behavior: {
    primaryAction: string;
    primaryOwnedAction?: string;
    secondaryAction: string;
    tertiaryAction: string;
    tone: string;
  };
};

export const PAYWALL_HARD = hard as PaywallCopyPack;
export const PAYWALL_EDGE_LOCK = edge as PaywallCopyPack;

export function isWallGate(gate?: string): boolean {
  return gate === "first_sub" || gate === "edge_lock";
}

export function paywallCopyForGate(gate?: string): PaywallCopyPack {
  return gate === "edge_lock" ? PAYWALL_EDGE_LOCK : PAYWALL_HARD;
}
