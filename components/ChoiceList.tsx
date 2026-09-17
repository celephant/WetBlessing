"use client";

import {
  choiceVariant,
  showsPassChip,
  showsYuanGoldSweep,
  variantBarClass,
} from "@/lib/choice-variant";
import { funnelChipStyle } from "@/lib/funnel";
import { MOTION_SPEC } from "@/lib/scene-presentation";
import { PASS_PRICE } from "@/lib/tokens";
import type { Choice } from "@/lib/types";

type ChoiceListProps = {
  choices: Choice[];
  choiceEntitled?: (choice: Choice) => boolean;
  entitled?: boolean;
  onSelect: (choiceId: string) => void;
  enterDelayMs?: number;
};

export function ChoiceList({
  choices,
  choiceEntitled,
  entitled = false,
  onSelect,
  enterDelayMs = 0,
}: ChoiceListProps) {
  if (choices.length === 0) return null;

  const goldDelayMs = enterDelayMs + MOTION_SPEC.choiceMs + MOTION_SPEC.paywallChipDelayMs;

  return (
    <div
      className="relative z-[3] pointer-events-auto mx-auto flex w-full max-w-dialog flex-col gap-2 px-3 pb-2"
      data-choice-stagger={MOTION_SPEC.choiceStaggerMs}
      data-wall-chips={enterDelayMs > 0 ? "after-dip" : "ready"}
    >
      {choices.map((choice, index) => {
        const goldOnce = showsYuanGoldSweep(choice);
        const owned = choiceEntitled ? choiceEntitled(choice) : entitled;
        const passChip = showsPassChip(choice);
        const funnelChip = funnelChipStyle(choice.choiceId);
        let variant = choiceVariant(choice);
        if (funnelChip.variant) variant = funnelChip.variant;
        const locked =
          passChip &&
          Boolean(choice.requiresEntitlement) &&
          !owned;
        return (
          <button
            key={choice.choiceId}
            type="button"
            onClick={() => onSelect(choice.choiceId)}
            style={{
              animationDelay: `${enterDelayMs + index * MOTION_SPEC.choiceStaggerMs}ms`,
            }}
            className={`choice-enter choice-press flex min-h-[52px] items-stretch overflow-hidden rounded-chip border text-left backdrop-blur-md transition hover:bg-night/85 ${
              variant === "ghost"
                ? "border-white/10 bg-transparent"
                : "border-white/15 bg-night/75"
            } ${
              variant === "pass"
                ? "shadow-[0_0_24px_rgba(232,197,106,0.18)]"
                : ""
            }`}
          >
            <span
              className={`w-1 shrink-0 ${funnelChip.barClass ?? variantBarClass(variant)}`}
            />
            <span className={`flex flex-1 items-center justify-between gap-3 px-4 py-3 ${
              variant === "ghost" ? "text-paper/70" : ""
            }`}>
              <span className="font-ui text-[15px] leading-snug text-paper">
                {choice.text}
              </span>
              {passChip ? (
                <span
                  data-gold-sweep={goldOnce ? "once" : "off"}
                  style={
                    goldOnce
                      ? {
                          animationDelay: `${goldDelayMs}ms`,
                          animationDuration: `${MOTION_SPEC.goldSweepMs}ms`,
                          animationIterationCount: 1,
                        }
                      : undefined
                  }
                  className={`shrink-0 rounded-full bg-gradient-to-r from-[#E8C56A] via-[#F6F1E8] to-[#E8C56A] bg-[length:200%_100%] px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink ${
                    goldOnce ? "animate-gold-sweep" : ""
                  }`}
                >
                  {locked ? "锁 · " : ""}通行证 ${PASS_PRICE}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
