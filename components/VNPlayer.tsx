"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChoiceList } from "@/components/ChoiceList";
import { DialogBox } from "@/components/DialogBox";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { SceneArt } from "@/components/SceneArt";
import { content } from "@/lib/content";
import {
  clickAdvance,
  selectChoice,
  startGame,
  unlockNext,
  view,
  withEntitlement,
} from "@/lib/engine";
import {
  SAVE_STORAGE_KEY,
  grantStoryPassDev,
  loadEntitlements,
  revokeStoryPassDev,
} from "@/lib/entitlement";
import { NIGHT_PASS_DIALOG_DOCK_CSS, SKU_STORY_PASS_MONTH } from "@/lib/tokens";
import type { Choice, Entitlements, GameState } from "@/lib/types";

function persistSave(state: GameState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
}

function readSave(): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SAVE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function VNPlayer({ resume = false }: { resume?: boolean }) {
  const [state, setState] = useState<GameState | null>(null);
  const [locked, setLocked] = useState<Choice | null>(null);

  useEffect(() => {
    const entitlements = loadEntitlements();
    if (resume) {
      const saved = readSave();
      if (saved) {
        setState({
          ...saved,
          entitlements: {
            ...saved.entitlements,
            ...entitlements,
          },
          pendingChoiceId: saved.pendingChoiceId ?? null,
        });
        return;
      }
    }
    setState(startGame(entitlements));
  }, [resume]);

  if (!state) {
    return <div className="h-dvh bg-void" />;
  }

  const snapshot = view(state);

  const commit = (next: GameState) => {
    persistSave(next);
    setState(next);
  };

  const onDialogClick = () => {
    if (locked) return;
    if (snapshot.choices.length > 0 || snapshot.isSettle) return;
    commit(clickAdvance(state));
  };

  const onChoice = (choiceId: string) => {
    const result = selectChoice(state, choiceId);
    if (result.ok) {
      setLocked(null);
      commit(result.state);
      return;
    }
    if (result.reason === "locked") {
      setLocked(result.choice);
      commit(result.state);
    }
  };

  const onDevUnlock = () => {
    grantStoryPassDev(state.entitlements);
    const result = unlockNext(state);
    if (result.ok) {
      setLocked(null);
      commit(result.state);
    }
  };

  const toggleDevPass = () => {
    const nextGranted = !state.entitlements.story_pass_month;
    const entitlements: Entitlements = nextGranted
      ? grantStoryPassDev(state.entitlements)
      : revokeStoryPassDev(state.entitlements);
    commit(withEntitlement(state, SKU_STORY_PASS_MONTH, entitlements.story_pass_month));
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-void text-paper">
      <SceneArt
        assetId={snapshot.node.assetId}
        artCue={snapshot.node.artCue}
        nodeId={snapshot.node.nodeId}
      />

      <header className="absolute inset-x-0 top-0 z-[4] flex items-center justify-between px-3 pt-3">
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-night/70 px-3 py-1.5 font-ui text-xs text-paper/80 backdrop-blur"
        >
          标题
        </Link>
        <div className="text-center">
          <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mint">
            Night Pass
          </p>
          <p className="font-ui text-xs text-paper/70">{content.routeTitle}</p>
        </div>
        <button
          type="button"
          onClick={toggleDevPass}
          className="rounded-full border border-white/10 bg-night/70 px-3 py-1.5 font-ui text-[10px] uppercase tracking-wide text-gold backdrop-blur"
        >
          DEV {state.entitlements.story_pass_month ? "PASS ON" : "PASS OFF"}
        </button>
      </header>

      {snapshot.isSettle ? (
        <div
          className="absolute inset-x-0 bottom-0 z-[3] flex items-end"
          style={{ height: NIGHT_PASS_DIALOG_DOCK_CSS }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center border-t border-white/10 bg-night/88 px-5 text-center backdrop-blur-xl">
            <p className="max-w-dialog font-ui text-[17px] leading-7 text-paper">
              {snapshot.node.text}
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex min-h-[52px] items-center justify-center rounded-chip bg-mint px-6 font-ui text-[15px] font-medium text-ink"
            >
              回到标题
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div
            className="absolute inset-x-0 z-[3] flex flex-col justify-end pb-2"
            style={{ bottom: NIGHT_PASS_DIALOG_DOCK_CSS }}
          >
            <ChoiceList
              choices={snapshot.choices}
              entitled={state.entitlements.story_pass_month}
              onSelect={onChoice}
            />
          </div>
          <div
            className="absolute inset-x-0 bottom-0 z-[2]"
            data-night-pass-dock="28"
            style={{ height: NIGHT_PASS_DIALOG_DOCK_CSS }}
          >
            <DialogBox
              beat={snapshot.beat}
              showCaret={snapshot.canClickAdvance && snapshot.choices.length === 0}
              onAdvance={onDialogClick}
            />
          </div>
        </>
      )}

      {locked ? (
        <PaywallOverlay
          choice={locked}
          onDevUnlock={onDevUnlock}
          onClose={() => setLocked(null)}
        />
      ) : null}
    </div>
  );
}
