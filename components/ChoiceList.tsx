"use client";

import { useEffect, useState } from "react";
import { INTERACTION } from "@/lib/interaction";
import type { StoryChoice } from "@/lib/types";

type ChoiceListProps = {
  choices: StoryChoice[];
  onSelect: (choiceId: string) => void;
  selectedId?: string | null;
  confirming?: boolean;
  reduceMotion?: boolean;
};

export function ChoiceList({
  choices,
  onSelect,
  selectedId = null,
  confirming = false,
  reduceMotion = false,
}: ChoiceListProps) {
  const [armed, setArmed] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setArmed(true);
      return;
    }
    setArmed(false);
    const arm = window.setTimeout(() => setArmed(true), INTERACTION.choiceArmMs);
    return () => window.clearTimeout(arm);
  }, [choices.map((choice) => choice.id).join("|"), reduceMotion]);

  if (choices.length === 0) return null;

  return (
    <div
      className="choice-group relative z-[3] pointer-events-auto mx-auto flex w-full flex-col overflow-y-auto px-3 pb-2"
      data-choice-armed={armed ? "on" : "off"}
      data-choice-weight="equal"
      data-chip-price="off"
    >
      {choices.map((choice, index) => {
        const selected = selectedId === choice.id;
        const fading = confirming && selectedId !== null && !selected;
        return (
          <button
            key={choice.id}
            type="button"
            disabled={!armed || confirming}
            onClick={() => onSelect(choice.id)}
            data-choice-id={choice.id}
            data-choice-index={index + 1}
            data-choice-selected={selected ? "on" : "off"}
            data-choice-label={choice.text}
            className={`btn-face btn-choice choice-press ${selected ? "is-selected" : ""} ${
              fading ? "is-fading" : ""
            } ${confirming && selected ? "is-pressed" : ""}`}
          >
            <span className="choice-bar bg-transparent" />
            <span className="choice-bark font-ui px-4 py-2">{choice.text}</span>
          </button>
        );
      })}
    </div>
  );
}
