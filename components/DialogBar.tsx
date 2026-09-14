"use client";

import { NightPassChip } from "@/components/NightPassChip";
import type { PlayerView } from "@/engine/types";
import { speakerLabel, speakerTone } from "@/lib/assets";

export function DialogBar({
  view,
  lockedLine,
  onAdvance,
  onUnlockNext,
  onDismissPaywall,
}: {
  view: PlayerView;
  lockedLine: string | null;
  onAdvance: () => void;
  onUnlockNext: () => void;
  onDismissPaywall: () => void;
}) {
  const speaker = view.line?.speaker;
  const name = speakerLabel(speaker);
  const paywalled = Boolean(view.pendingUnlock && lockedLine);

  return (
    <div
      className="absolute inset-x-0 bottom-0 box-border"
      style={{ height: "var(--wb-dialog-h)", zIndex: 2 }}
      data-dialog-bar="night-pass"
    >
      <div className="flex h-full w-full flex-col px-3 sm:px-4">
        <div
          className="wb-dialog-in flex h-full min-h-0 flex-col justify-end rounded-[var(--wb-radius-dialog)] border border-[var(--wb-line)] px-5 py-4"
          style={{ background: "rgba(18,20,28,0.82)", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}
          data-testid="dialog-advance"
          role={paywalled ? undefined : "button"}
          tabIndex={paywalled ? undefined : 0}
          onClick={paywalled ? undefined : onAdvance}
          onKeyDown={
            paywalled
              ? undefined
              : (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onAdvance();
                  }
                }
          }
        >
          {paywalled ? (
            <NightPassChip
              lockedLine={lockedLine!}
              onUnlockNext={onUnlockNext}
              onDismiss={onDismissPaywall}
            />
          ) : (
            <>
              {name ? (
                <p
                  className="mb-1 text-[13px] font-medium tracking-wide"
                  style={{ color: speakerTone(speaker) }}
                >
                  {name}
                </p>
              ) : null}
              <p className="max-w-[720px] text-[17px] leading-7 text-[var(--wb-paper)]">
                {view.settle ? view.node.text : view.line?.text}
              </p>
              {!view.showingChoices && !view.settle && (
                <p className="mt-2 text-[11px] tracking-[0.18em] text-[var(--wb-mute)]">点击继续</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
