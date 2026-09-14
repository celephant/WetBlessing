"use client";

import { useMemo, useState } from "react";
import { ChoiceList } from "@/components/ChoiceList";
import { CgStage } from "@/components/CgStage";
import { DialogBar } from "@/components/DialogBar";
import { TitleScreen } from "@/components/TitleScreen";
import { content } from "@/engine/content";
import {
  advance,
  canClickAdvance,
  createInitialState,
  getView,
  selectChoice,
  unlockNext,
} from "@/engine/engine";
import type { EngineState } from "@/engine/types";

export function Player() {
  const [playing, setPlaying] = useState(false);
  const [state, setState] = useState<EngineState>(() => createInitialState(content));
  const view = useMemo(() => getView(state, content), [state]);

  const lockedChoice = view.choices.find((choice) => choice.choiceId === view.pendingUnlock?.choiceId);

  const start = () => {
    setState(createInitialState(content));
    setPlaying(true);
  };

  const onAdvance = () => {
    if (!canClickAdvance(state, content)) return;
    setState((current) => advance(current, content));
  };

  const onChoose = (choiceId: string) => {
    setState((current) => selectChoice(current, content, choiceId));
  };

  if (!playing || view.node.nodeId === "n_title") {
    return <TitleScreen onStart={start} />;
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[var(--wb-void)]" data-player="slice-0">
      <CgStage node={view.node} />

      <header
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 py-3"
        style={{ zIndex: 4 }}
      >
        <p className="font-display text-[13px] tracking-[0.2em] text-[var(--wb-paper)]/80">WetBlessing</p>
        <p className="text-[11px] text-[var(--wb-mute)]" data-testid="choice-index">
          choiceIndex {view.choiceIndex}
        </p>
      </header>

      {view.showingChoices && (
        <div
          className="absolute inset-x-0 px-3 sm:px-4"
          style={{ bottom: "calc(var(--wb-dialog-h) + 8px)", zIndex: 3 }}
        >
          <div className="mx-auto w-full max-w-[720px]">
            <ChoiceList
              choices={view.choices}
              pendingChoiceId={view.pendingUnlock?.choiceId ?? null}
              locked={Boolean(view.pendingUnlock)}
              onChoose={onChoose}
            />
          </div>
        </div>
      )}

      <DialogBar
        view={view}
        lockedLine={lockedChoice?.text ?? null}
        onAdvance={onAdvance}
        onUnlockNext={() => setState((current) => unlockNext(current, content))}
        onDismissPaywall={() =>
          setState((current) => ({ ...current, pendingUnlock: null }))
        }
      />

      {view.settle && view.node.nodeId === "n_pay_settle" && (
        <div className="absolute inset-0 z-[5] flex items-end justify-center bg-black/40 pb-[30%]">
          <button
            type="button"
            onClick={start}
            className="rounded-full bg-[var(--wb-paper)] px-5 py-3 text-sm text-[var(--wb-ink)]"
          >
            回标题
          </button>
        </div>
      )}
    </div>
  );
}
