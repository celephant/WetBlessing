"use client";

import { speakerColor, speakerLabel } from "@/lib/tokens";
import type { Beat } from "@/lib/types";

type DialogBoxProps = {
  beat: Beat;
  showCaret: boolean;
  onAdvance: () => void;
};

export function DialogBox({ beat, showCaret, onAdvance }: DialogBoxProps) {
  const name = speakerLabel(beat.speaker);
  const color = speakerColor(beat.speaker);

  return (
    <button
      type="button"
      onClick={onAdvance}
      className="relative z-[2] mx-auto block w-full max-w-dialog px-3 pb-3 text-left"
      aria-label="Advance dialogue"
    >
      <div className="rounded-dialog border border-white/10 bg-night/80 px-5 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        {name ? (
          <p
            className="mb-1 font-display text-[13px] font-semibold tracking-wide"
            style={{ color }}
          >
            {name}
          </p>
        ) : null}
        <p className="font-ui text-[17px] leading-7 text-paper">{beat.text}</p>
        {showCaret ? (
          <span className="mt-2 block animate-caret-pulse text-right font-display text-mint">
            ▸
          </span>
        ) : null}
      </div>
    </button>
  );
}
