"use client";

import { PASS_FOOTNOTE, PASS_HEADLINE, PASS_PRICE } from "@/lib/tokens";
import type { Choice } from "@/lib/types";

type PaywallOverlayProps = {
  choice: Choice;
  onDevUnlock: () => void;
  onClose: () => void;
};

export function PaywallOverlay({
  choice,
  onDevUnlock,
  onClose,
}: PaywallOverlayProps) {
  return (
    <div
      className="absolute inset-0 z-[5] flex items-end justify-center bg-void/70 p-4 backdrop-blur-sm"
      data-paywall-grade="night"
      data-phone-glow="off"
    >
      <div className="mb-8 w-full max-w-dialog rounded-dialog border border-gold/30 bg-night/95 p-5 shadow-[0_0_40px_rgba(232,197,106,0.2)]">
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-gold">
          Night Pass
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-paper">
          {PASS_HEADLINE}
        </h2>
        <p className="mt-3 font-ui text-[17px] leading-7 text-paper/90">
          {choice.text}
        </p>
        <p className="mt-3 font-ui text-sm text-mute">{PASS_FOOTNOTE}</p>

        <button
          type="button"
          disabled
          className="mt-5 flex min-h-[52px] w-full items-center justify-center rounded-chip border border-gold/40 bg-gold/15 font-ui text-[15px] text-gold/80"
        >
          {/* TODO(slice-1): Stripe Checkout for story_pass_month */}
          开通月卡 ${PASS_PRICE} · 即将接入
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
          先不说
        </button>
      </div>
    </div>
  );
}
