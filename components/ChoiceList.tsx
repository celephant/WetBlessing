"use client";

import { choiceBarColor, choiceVariant } from "@/engine/choiceVariant";
import type { StoryChoice } from "@/engine/types";
import { ui } from "@/lib/tokens";

export function ChoiceList({
  choices,
  pendingChoiceId,
  locked,
  onChoose,
}: {
  choices: StoryChoice[];
  pendingChoiceId: string | null;
  locked: boolean;
  onChoose: (choiceId: string) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-2" data-testid="choices">
      {choices.map((choice, index) => {
        const variant = choiceVariant(choice);
        const bar = choiceBarColor(variant);
        const accent =
          variant === "yuan"
            ? ui.colors.gold
            : variant === "jie"
              ? ui.colors.hot
              : bar;
        const needsPass = Boolean(choice.requiresEntitlement);
        const pending = pendingChoiceId === choice.choiceId;

        return (
          <button
            key={choice.choiceId}
            type="button"
            disabled={locked && !needsPass}
            data-choice={choice.choiceId}
            data-variant={variant}
            data-cta={choice.cta ?? undefined}
            onClick={() => onChoose(choice.choiceId)}
            className="wb-choice-in flex min-h-[52px] items-stretch overflow-hidden rounded-[14px] border text-left backdrop-blur-md disabled:opacity-40"
            style={{
              animationDelay: `${index * ui.motion.choiceStaggerMs}ms`,
              background: pending ? "rgba(232,197,106,0.16)" : ui.colors.glass,
              borderColor: pending ? ui.colors.gold : ui.colors.line,
            }}
          >
            <span
              className="w-1.5 shrink-0"
              style={{ background: accent ?? "transparent" }}
              aria-hidden
            />
            <span className="flex flex-1 items-center px-3 py-2 text-[15px] leading-5 text-[var(--wb-paper)]">
              {choice.text}
              {needsPass && (
                <span className="ml-2 shrink-0 text-[11px] text-[var(--wb-gold)]">
                  Night Pass
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
