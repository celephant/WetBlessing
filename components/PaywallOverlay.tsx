"use client";

import {
  CHAPTER_UNLOCK_PRICE,
  paywallCopyForGate,
} from "@/lib/paywall-copy";
import { PASS_PRICE } from "@/lib/tokens";
import type { Choice } from "@/lib/types";

type PaywallOverlayProps = {
  choice: Choice;
  gate?: string;
  entitled?: boolean;
  onDevUnlock: () => void;
  onClose: () => void;
};

export function PaywallOverlay({
  choice,
  gate,
  entitled = false,
  onDevUnlock,
  onClose,
}: PaywallOverlayProps) {
  const pack = paywallCopyForGate(gate);
  const zh = pack["zh-CN"];
  const ownedPrimary = Boolean(entitled && zh.primaryOwned);

  return (
    <div
      className="absolute inset-0 z-[5] flex items-end justify-center bg-void/70 p-4 backdrop-blur-sm"
      data-paywall-grade="night"
      data-phone-glow="off"
      data-paywall-code={pack.errorCode}
    >
      <div className="mb-8 w-full max-w-dialog rounded-dialog border border-gold/30 bg-night/95 p-5 shadow-[0_0_40px_rgba(232,197,106,0.2)]">
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-gold">
          Night Pass
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-paper">
          {zh.title}
        </h2>
        <p className="mt-3 font-ui text-[17px] leading-7 text-paper/90">
          {zh.body}
        </p>
        <p className="mt-3 font-ui text-sm text-mute">{choice.text}</p>

        {ownedPrimary ? (
          <button
            type="button"
            onClick={onDevUnlock}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-chip bg-gold font-ui text-[15px] font-medium text-ink"
          >
            {zh.primaryOwned}
          </button>
        ) : (
          <button
            type="button"
            disabled
            data-sku="story_pass_month"
            className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-chip border border-gold/40 bg-gold/15 font-ui text-[15px] text-gold/80"
          >
            {/* TODO(slice-1): Stripe Checkout for story_pass_month */}
            {zh.primary}
          </button>
        )}

        <button
          type="button"
          disabled
          className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-chip border border-white/10 bg-white/[0.04] font-ui text-[15px] text-paper/70"
          data-sku="chapter_unlock"
        >
          {zh.secondary}
        </button>

        <button
          type="button"
          onClick={onDevUnlock}
          className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-chip bg-mint/90 font-ui text-[15px] font-medium text-ink"
        >
          DEV · 假开通，立刻接上这句
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2 font-ui text-sm text-mute"
        >
          {zh.tertiary}
        </button>
        <p className="sr-only">{`story_pass_month ${PASS_PRICE} chapter_unlock ${CHAPTER_UNLOCK_PRICE}`}</p>
      </div>
    </div>
  );
}
