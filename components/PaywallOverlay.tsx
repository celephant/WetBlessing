"use client";

import {
  CHAPTER_UNLOCK_PRICE,
  paywallCopyForGate,
  scopeForGate,
} from "@/lib/paywall-copy";
import { choiceCueFace } from "@/lib/choice-cue";
import { playerFacingChoiceText } from "@/lib/choice-label";
import { PASS_PRICE, SKU_STORY_PASS } from "@/lib/tokens";
import type { Choice } from "@/lib/types";

type PaywallOverlayProps = {
  choice: Choice;
  gate?: string;
  entitled?: boolean;
  onDevUnlock: () => void;
  onUnlockScope: () => void;
  onClose: () => void;
};

export function PaywallOverlay({
  choice,
  gate,
  entitled = false,
  onDevUnlock,
  onUnlockScope,
  onClose,
}: PaywallOverlayProps) {
  const pack = paywallCopyForGate(gate);
  const zh = pack["zh-CN"];
  const ownedPrimary = Boolean(entitled && zh.primaryOwned);
  const scope = scopeForGate(gate);

  return (
    <div
      className="paywall-overlay absolute inset-0 z-[5] flex items-end justify-center bg-void/70 p-4"
      data-paywall-grade="night"
      data-phone-glow="off"
      data-paywall-code={pack.errorCode}
      data-paywall-scope={scope}
      data-paywall-owned={ownedPrimary ? "on" : "off"}
    >
      <div className="mb-8 w-full max-w-dialog rounded-dialog border border-gold/30 bg-night/95 p-5 shadow-[0_0_40px_rgba(232,197,106,0.2)]">
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-gold">
          一次性通行证
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-paper">{zh.title}</h2>
        <p className="mt-3 font-ui text-[17px] leading-7 text-paper/90">{zh.body}</p>
        <p className="mt-3 font-ui text-sm text-mute">
          {choiceCueFace(choice).choice || playerFacingChoiceText(choice.text)}
        </p>

        {ownedPrimary ? (
          <button
            type="button"
            onClick={onDevUnlock}
            className="btn-face mt-5 w-full bg-gold font-medium text-ink"
          >
            {zh.primaryOwned}
          </button>
        ) : (
          <button
            type="button"
            disabled
            data-sku={SKU_STORY_PASS}
            className="btn-face mt-5 w-full border border-gold/40 bg-gold/15 font-medium text-gold/80"
          >
            {/* TODO(slice-1): Stripe Checkout for story_pass */}
            {zh.primary}
          </button>
        )}

        {ownedPrimary ? null : (
          <button
            type="button"
            onClick={onUnlockScope}
            className="btn-face mt-2 w-full border border-white/15 bg-white/[0.08]"
            data-sku="chapter_unlock"
            data-dev-scope={scope}
          >
            {/* DEV fake-unlock of this wall only. Stripe stays later. */}
            DEV · {zh.secondary}
          </button>
        )}

        {ownedPrimary ? null : (
          <button
            type="button"
            onClick={onDevUnlock}
            className="btn-face mt-2 w-full bg-mint/90 font-medium text-ink"
          >
            DEV · 假开通一次性通行证，立刻接上这句
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2 font-ui text-sm text-mute"
        >
          {zh.tertiary}
        </button>
        <p className="mt-1 text-center font-ui text-[11px] text-mute">进度已保存</p>
        <p className="sr-only">{`${SKU_STORY_PASS} ${PASS_PRICE} chapter_unlock ${CHAPTER_UNLOCK_PRICE} scope ${scope}`}</p>
      </div>
    </div>
  );
}
