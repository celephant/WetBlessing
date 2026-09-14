"use client";

import {
  choiceVariant,
  showsPassChip,
  showsYuanGoldSweep,
  variantBarClass,
} from "@/lib/choice-variant";
import { MOTION_SPEC } from "@/lib/scene-presentation";
import { PASS_PRICE } from "@/lib/tokens";
import type { Choice } from "@/lib/types";

type ChoiceListProps = {
  choices: Choice[];
  entitled: boolean;
  onSelect: (choiceId: string) => void;
  enterDelayMs?: number;
};

export function ChoiceList({
  choices,
  entitled,
  onSelect,
  enterDelayMs = 0,
}: ChoiceListProps) {
  if (choices.length === 0) return null;

  const goldDelayMs = enterDelayMs + MOTION_SPEC.choiceMs + MOTION_SPEC.paywallChipDelayMs;

  return (
    <div
      className="relative z-[3] mx-auto flex w-full max-w-dialog flex-col gap-2 px-3 pb-2"
      data-choice-stagger={MOTION_SPEC.choiceStaggerMs}
      data-wall-chips={enterDelayMs > 0 ? "after-dip" : "ready"}
    >
      {choices.map((choice, index) => {
        const variant = choiceVariant(choice);
        const passChip = showsPassChip(choice);
        const goldOnce = showsYuanGoldSweep(choice);
        const locked =
          passChip &&
          Boolean(choice.requiresEntitlement) &&
          !entitled;
        return (
          <button
            key={choice.choiceId}
            type="button"
            onClick={() => onSelect(choice.choiceId)}
            style={{
              animationDelay: `${enterDelayMs + index * MOTION_SPEC.choiceStaggerMs}ms`,
            }}
            className={`choice-enter flex min-h-[52px] items-stretch overflow-hidden rounded-chip border border-white/10 bg-white/[0.08] text-left backdrop-blur-md transition hover:bg-white/[0.12] ${
              variant === "pass"
                ? "shadow-[0_0_24px_rgba(232,197,106,0.18)]"
                : ""
            }`}
          >
            <span className={`w-1 shrink-0 ${variantBarClass(variant)}`} />
            <span className="flex flex-1 items-center justify-between gap-3 px-4 py-3">
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
                  {locked ? "锁 · " : ""}月卡 ${PASS_PRICE}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
