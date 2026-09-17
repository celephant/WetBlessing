"use client";

import { useEffect, useState } from "react";
import { playerFacingChoiceText } from "@/lib/choice-label";
import { choiceVariant, showsPassChip } from "@/lib/choice-variant";
import { funnelChipStyle } from "@/lib/funnel";
import { INTERACTION } from "@/lib/interaction";
import { MOTION_SPEC } from "@/lib/scene-presentation";
import { PASS_PRICE } from "@/lib/tokens";
import type { Choice } from "@/lib/types";

type ChoiceListProps = {
  choices: Choice[];
  choiceEntitled?: (choice: Choice) => boolean;
  entitled?: boolean;
  onSelect: (choiceId: string) => void;
  selectedId?: string | null;
  confirming?: boolean;
  reduceMotion?: boolean;
};

export function ChoiceList({
  choices,
  choiceEntitled,
  entitled = false,
  onSelect,
  selectedId = null,
  confirming = false,
  reduceMotion = false,
}: ChoiceListProps) {
  const [armed, setArmed] = useState(reduceMotion);
  const [swept, setSwept] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setArmed(true);
      setSwept(true);
      return;
    }
    setArmed(false);
    setSwept(false);
    const arm = window.setTimeout(() => setArmed(true), INTERACTION.choiceArmMs);
    const sweep = window.setTimeout(() => setSwept(true), 560);
    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(sweep);
    };
  }, [choices.map((choice) => choice.choiceId).join("|"), reduceMotion]);

  if (choices.length === 0) return null;

  return (
    <div
      className="choice-group relative z-[3] pointer-events-auto mx-auto flex w-full max-w-dialog flex-col gap-2 px-3 pb-2"
      data-choice-stagger={MOTION_SPEC.choiceStaggerMs}
      data-wall-chips="ready"
      data-choice-armed={armed ? "on" : "off"}
      data-choice-weight="equal"
    >
      {choices.map((choice) => {
        const owned = choiceEntitled ? choiceEntitled(choice) : entitled;
        const passChip = showsPassChip(choice);
        const funnelChip = funnelChipStyle(choice.choiceId);
        const variant = funnelChip.variant ?? choiceVariant(choice);
        const locked =
          passChip && Boolean(choice.requiresEntitlement) && !owned;
        const selected = selectedId === choice.choiceId;
        const fading = confirming && selectedId !== null && !selected;
        const label = playerFacingChoiceText(choice.text);
        return (
          <button
            key={choice.choiceId}
            type="button"
            disabled={!armed || confirming}
            onClick={() => onSelect(choice.choiceId)}
            data-choice-id={choice.choiceId}
            data-choice-selected={selected ? "on" : "off"}
            className={`btn-face btn-choice choice-press ${
              !swept && !reduceMotion ? "btn-face-sweep" : ""
            } ${variant === "ghost" ? "btn-choice-ghost" : ""} ${
              passChip ? "btn-choice-pass" : ""
            } ${selected ? "is-selected" : ""} ${fading ? "is-fading" : ""} ${
              confirming && selected ? "is-pressed" : ""
            }`}
          >
            <span
              className={`choice-bar ${funnelChip.barClass ?? ""} ${
                passChip && !funnelChip.barClass ? "is-pass" : ""
              }`}
            />
            <span className="relative z-[1] flex flex-1 items-center justify-between gap-3 px-4 py-3">
              <span className="font-ui text-[15px] leading-snug text-paper">
                {label}
              </span>
              {passChip ? (
                <span
                  data-gold-sweep="off"
                  className="shrink-0 rounded-full bg-gradient-to-r from-[#E8C56A] via-[#F6F1E8] to-[#E8C56A] bg-[length:200%_100%] px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink"
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
