"use client";

import { ui } from "@/lib/tokens";
import { STORY_PASS_MONTH } from "@/engine/types";

export function NightPassChip({
  lockedLine,
  onUnlockNext,
  onDismiss,
}: {
  lockedLine: string;
  onUnlockNext: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className="wb-dialog-in rounded-[var(--wb-radius-chip)] border border-[var(--wb-line)] bg-black/40 p-3"
      data-paywall="first_sub"
      data-sku={STORY_PASS_MONTH}
    >
      <p className="font-display text-sm tracking-wide text-[var(--wb-gold)]">{ui.paywall.headline}</p>
      <p className="mt-1 text-[13px] leading-5 text-[var(--wb-paper)]/90">{lockedLine}</p>
      <p className="mt-1 text-[12px] text-[var(--wb-mute)]">{ui.paywall.footnote}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-cta={STORY_PASS_MONTH}
          data-dev-unlock="true"
          onClick={onUnlockNext}
          className="min-h-10 rounded-full bg-[var(--wb-gold)] px-4 text-[13px] font-medium text-[var(--wb-ink)]"
        >
          开通 Night Pass · ${ui.paywall.price}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-10 rounded-full border border-[var(--wb-line)] px-3 text-[12px] text-[var(--wb-mute)]"
        >
          {ui.paywall.ghost}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[var(--wb-mute)]">
        DEV 假开通 · unlockNext · 未接 Stripe / 外链商城
      </p>
    </div>
  );
}
