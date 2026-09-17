"use client";

import { useEffect, useRef, useState } from "react";
import { typeCharMs } from "@/lib/interaction";
import type { TextSpeed } from "@/lib/play-prefs";
import { speakerColor, speakerLabel } from "@/lib/tokens";
import type { Beat } from "@/lib/types";

type DialogBoxProps = {
  beat: Beat;
  echo?: { text: string } | null;
  showCaret: boolean;
  onAdvance: () => void;
  onRevealChange?: (complete: boolean) => void;
  entranceKey: string;
  continueBeat?: boolean;
  textSpeed: TextSpeed;
  reduceMotion?: boolean;
  alreadyRead?: boolean;
  hasChoices?: boolean;
  nameplateEnter?: boolean;
};

export function DialogBox({
  beat,
  echo = null,
  showCaret,
  onAdvance,
  onRevealChange,
  entranceKey,
  continueBeat = false,
  textSpeed,
  reduceMotion = false,
  alreadyRead = false,
  hasChoices = false,
  nameplateEnter = true,
}: DialogBoxProps) {
  const name = speakerLabel(beat.speaker);
  const color = speakerColor(beat.speaker);
  const enterClass = continueBeat ? "dialog-continue" : "dialog-enter";
  const full = beat.text ?? "";
  const charMs = typeCharMs(textSpeed, reduceMotion, alreadyRead);
  const [shown, setShown] = useState(charMs === 0 ? full.length : 0);
  const complete = shown >= full.length;
  const onRevealChangeRef = useRef(onRevealChange);
  onRevealChangeRef.current = onRevealChange;

  useEffect(() => {
    const instant = typeCharMs(textSpeed, reduceMotion, alreadyRead) === 0;
    setShown(instant ? full.length : 0);
  }, [entranceKey, full.length, textSpeed, reduceMotion, alreadyRead]);

  useEffect(() => {
    if (complete) return;
    const ms = typeCharMs(textSpeed, reduceMotion, alreadyRead);
    if (ms === 0) {
      setShown(full.length);
      return;
    }
    const tick = window.setTimeout(() => {
      setShown((count) => Math.min(full.length, count + 1));
    }, ms);
    return () => window.clearTimeout(tick);
  }, [complete, shown, full.length, textSpeed, reduceMotion, alreadyRead]);

  useEffect(() => {
    onRevealChangeRef.current?.(complete);
  }, [complete, entranceKey]);

  const onClick = () => {
    if (!complete) {
      setShown(full.length);
      return;
    }
    if (hasChoices) return;
    onAdvance();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full w-full flex-col justify-end text-left"
      aria-label={complete ? "Advance dialogue" : "Show full line"}
      data-dialog-complete={complete ? "on" : "off"}
    >
      <div className="dialog-dock flex h-full flex-col justify-end px-5 py-4">
        <div
          key={entranceKey}
          data-dialog-enter={entranceKey}
          data-dialog-motion={continueBeat ? "continue" : "enter"}
          className={`${enterClass} mx-auto flex w-full max-w-dialog flex-1 flex-col justify-center`}
        >
          {echo ? (
            <p
              className="mb-2 font-ui text-[15px] leading-6 text-paper/80"
              data-choice-echo=""
            >
              <span className="font-display text-[13px] text-rose">你</span>
              <span className="text-paper/45"> · </span>
              {echo.text}
            </p>
          ) : null}
          {name ? (
            <p
              className={`${
                nameplateEnter ? "dialog-nameplate" : ""
              } mb-1 font-display text-[13px] tracking-wide`}
              style={{ color }}
            >
              {name}
            </p>
          ) : null}
          <p className="font-ui text-[17px] leading-7 text-paper">
            {full.slice(0, shown)}
            {!complete ? (
              <span className="text-paper/40" aria-hidden>
                ▍
              </span>
            ) : null}
          </p>
          {showCaret && complete && !hasChoices ? (
            <span
              className="advance-caret mt-2 block text-right font-display text-rose"
              data-advance-caret=""
            >
              ▸
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
