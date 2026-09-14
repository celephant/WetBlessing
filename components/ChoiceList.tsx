"use client";

import { choiceVariant, showsPassChip, variantBarClass } from "@/lib/choice-variant";
import { PASS_PRICE } from "@/lib/tokens";
import type { Choice } from "@/lib/types";

type ChoiceListProps = {
  choices: Choice[];
  entitled: boolean;
  onSelect: (choiceId: string) => void;
};

export function ChoiceList({ choices, entitled, onSelect }: ChoiceListProps) {
  if (choices.length === 0) return null;

  return (
    <div className="relative z-[3] mx-auto flex w-full max-w-dialog flex-col gap-2 px-3 pb-2">
      {choices.map((choice, index) => {
        const variant = choiceVariant(choice);
        const passChip = showsPassChip(choice);
        const locked =
          passChip &&
          Boolean(choice.requiresEntitlement) &&
          !entitled;
        return (
          <button
            key={choice.choiceId}
            type="button"
            onClick={() => onSelect(choice.choiceId)}
            style={{ animationDelay: `${index * 40}ms` }}
            className={`animate-fade-up flex min-h-[52px] items-stretch overflow-hidden rounded-chip border border-white/10 bg-white/[0.08] text-left backdrop-blur-md transition hover:bg-white/[0.12] ${
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
                <span className="shrink-0 rounded-full bg-gradient-to-r from-[#E8C56A] via-[#F6F1E8] to-[#E8C56A] bg-[length:200%_100%] px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink animate-gold-sweep">
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
