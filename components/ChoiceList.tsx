"use client";

import { useEffect, useState } from "react";
import { ChoiceCueFace } from "@/components/ChoiceCueButton";
import { choiceCueFace } from "@/lib/choice-cue";
import { playerFacingChoiceText } from "@/lib/choice-label";
import { choiceVariant } from "@/lib/choice-variant";
import { funnelChipStyle } from "@/lib/funnel";
import { INTERACTION } from "@/lib/interaction";
import { MOTION_SPEC } from "@/lib/scene-presentation";
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
      className="choice-group relative z-[3] pointer-events-auto mx-auto flex w-full flex-col overflow-y-auto px-3 pb-2"
      data-choice-stagger={MOTION_SPEC.choiceStaggerMs}
      data-wall-chips="ready"
      data-choice-armed={armed ? "on" : "off"}
      data-choice-weight="equal"
      data-chip-price="off"
      data-choice-chain="on"
      data-choice-cue="on"
    >
      {choices.map((choice) => {
        const owned = choiceEntitled ? choiceEntitled(choice) : entitled;
        const gated = Boolean(choice.requiresEntitlement);
        const funnelChip = funnelChipStyle(choice.choiceId);
        const variant = funnelChip.variant ?? choiceVariant(choice);
        const selected = selectedId === choice.choiceId;
        const fading = confirming && selectedId !== null && !selected;
        const label = playerFacingChoiceText(choice.text);
        const face = choiceCueFace(choice);
        return (
          <button
            key={choice.choiceId}
            type="button"
            disabled={!armed || confirming}
            onClick={() => onSelect(choice.choiceId)}
            data-choice-id={choice.choiceId}
            data-choice-selected={selected ? "on" : "off"}
            data-gated={gated ? (owned ? "owned" : "on") : "off"}
            data-choice-label={label}
            data-choice-face={face.cue ? "cue" : "bark"}
            className={`btn-face btn-choice choice-press ${
              !swept && !reduceMotion ? "btn-face-sweep" : ""
            } ${variant === "ghost" ? "btn-choice-ghost" : ""} ${
              selected ? "is-selected" : ""
            } ${fading ? "is-fading" : ""} ${
              confirming && selected ? "is-pressed" : ""
            }`}
          >
            <span className={`choice-bar ${funnelChip.barClass ?? ""}`} />
            <ChoiceCueFace choice={face.choice} cue={face.cue} />
          </button>
        );
      })}
    </div>
  );
}
