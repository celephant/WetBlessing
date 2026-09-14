"use client";

import { speakerColor, speakerLabel } from "@/lib/tokens";
import type { Beat } from "@/lib/types";

type DialogBoxProps = {
  beat: Beat;
  showCaret: boolean;
  onAdvance: () => void;
  entranceKey: string;
  continueBeat?: boolean;
};

export function DialogBox({
  beat,
  showCaret,
  onAdvance,
  entranceKey,
  continueBeat = false,
}: DialogBoxProps) {
  const name = speakerLabel(beat.speaker);
  const color = speakerColor(beat.speaker);
  const enterClass = continueBeat ? "dialog-continue" : "dialog-enter";

  return (
    <button
      type="button"
      onClick={onAdvance}
      className="flex h-full w-full flex-col justify-end text-left"
      aria-label="Advance dialogue"
    >
      <div className="flex h-full flex-col justify-end border-t border-white/10 bg-night/88 px-5 py-4 backdrop-blur-xl">
        <div
          key={entranceKey}
          data-dialog-enter={entranceKey}
          data-dialog-motion={continueBeat ? "continue" : "enter"}
          className={`${enterClass} mx-auto flex w-full max-w-dialog flex-1 flex-col justify-center`}
        >
          {name ? (
            <p
              className="dialog-nameplate mb-1 font-display text-[13px] font-semibold tracking-wide"
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
      </div>
    </button>
  );
}
