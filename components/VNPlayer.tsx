"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChoiceList } from "@/components/ChoiceList";
import { DialogBox } from "@/components/DialogBox";
import { PauseOverlay } from "@/components/PauseOverlay";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { SceneArt } from "@/components/SceneArt";
import { route, type CompiledRoute } from "@/lib/content";
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
  grantFullEntitleDev,
  isFullyEntitled,
  loadEntitlements,
  revokeStoryPassDev,
} from "@/lib/entitlement";
import {
  isFreePathFeel,
  isNightGradeNode,
  isPaywallWallNode,
  presentationHooksForBeat,
  TRANSITION_MS,
  WALL_RHYTHM,
} from "@/lib/scene-presentation";
import { NIGHT_PASS_DIALOG_DOCK_CSS } from "@/lib/tokens";
import type { Choice, Entitlements, GameState } from "@/lib/types";

function saveKey(packId: string) {
  return packId === "default" ? SAVE_STORAGE_KEY : `${SAVE_STORAGE_KEY}:${packId}`;
}

function persistSave(state: GameState, packId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(saveKey(packId), JSON.stringify(state));
}

function readSave(packId: string): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(saveKey(packId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function VNPlayer({
  resume = false,
  compiled = route,
  packId = "default",
}: {
  resume?: boolean;
  compiled?: CompiledRoute;
  packId?: string;
}) {
  const [state, setState] = useState<GameState | null>(null);
  const [locked, setLocked] = useState<Choice | null>(null);
  const [afterPurchase, setAfterPurchase] = useState(false);
  const [paused, setPaused] = useState(false);
  const pack = compiled.content;

  useEffect(() => {
    const entitlements = loadEntitlements();
    if (resume) {
      const saved = readSave(packId);
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
    setState(startGame(entitlements, compiled));
  }, [resume, compiled, packId]);

  useEffect(() => {
    if (!afterPurchase) return;
    const cut = window.setTimeout(
      () => setAfterPurchase(false),
      TRANSITION_MS["soft-zoom"],
    );
    return () => window.clearTimeout(cut);
  }, [afterPurchase]);

  if (!state) {
    return <div className="h-dvh bg-void" />;
  }

  const snapshot = view(state, compiled);
  const beatKey = `${state.nodeId}:${state.beatIndex}`;
  const sceneHooks = presentationHooksForBeat(snapshot.node, state.beatIndex);

  const commit = (next: GameState) => {
    persistSave(next, packId);
    setState(next);
  };

  const onDialogClick = () => {
    if (paused || locked) return;
    if (snapshot.choices.length > 0 || snapshot.isSettle) return;
    commit(clickAdvance(state, compiled));
  };

  const onChoice = (choiceId: string) => {
    if (paused) return;
    const result = selectChoice(state, choiceId, compiled);
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
    grantFullEntitleDev(state.entitlements);
    const result = unlockNext(state, undefined, compiled);
    if (result.ok) {
      setLocked(null);
      setAfterPurchase(true);
      commit(result.state);
    }
  };

  const toggleDevPass = () => {
    const nextGranted = !isFullyEntitled(state.entitlements);
    const entitlements: Entitlements = nextGranted
      ? grantFullEntitleDev(state.entitlements)
      : revokeStoryPassDev(state.entitlements);
    commit(withEntitlement(state, "full_entitle", Boolean(entitlements.story_pass_month)));
  };

  const wallsUnlocked =
    state.entitlements.story_pass_month || Boolean(state.entitlements.edge_lock);

  const wallNode = isPaywallWallNode(
    snapshot.node.nodeId,
    snapshot.node.gate,
  );
  const nightGrade =
    Boolean(locked) ||
    snapshot.isPaywall ||
    isNightGradeNode(snapshot.node.nodeId, snapshot.node.gate);
  const freezePlate =
    paused ||
    snapshot.isSettle ||
    snapshot.choices.length > 0 ||
    Boolean(locked) ||
    wallNode;

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-void text-paper"
      data-wall-rhythm={
        wallNode ? "dip-chips-gold-unlock" : afterPurchase ? "unlock-soft-zoom" : undefined
      }
      data-phone-glow={nightGrade ? "off" : undefined}
      data-free-feel={
        !nightGrade && isFreePathFeel(snapshot.node.nodeId, snapshot.node.gate)
          ? "on"
          : "off"
      }
      data-paused={paused ? "on" : "off"}
      data-full-entitle={isFullyEntitled(state.entitlements) ? "on" : "off"}
      data-play-pack={packId}
      data-content-version={pack.contentVersion}
      data-unlock-gates="first_sub,edge_lock"
      data-entitle-first-sub={state.entitlements.story_pass_month ? "on" : "off"}
      data-entitle-edge-lock={
        state.entitlements.edge_lock || state.entitlements.story_pass_month
          ? "on"
          : "off"
      }
    >
      <SceneArt
        assetId={snapshot.node.assetId}
        artCue={snapshot.node.artCue}
        nodeText={`${snapshot.node.text ?? ""} ${snapshot.beat.text ?? ""}`}
        nodeId={snapshot.node.nodeId}
        beatKey={beatKey}
        transition={sceneHooks.transition}
        camera={sceneHooks.camera}
        fx={sceneHooks.fx}
        afterPurchase={afterPurchase}
        forceNightGrade={nightGrade}
        gate={snapshot.node.gate}
        beforeChoices={snapshot.choices.length > 0}
        frozen={freezePlate}
      />

      <header className="absolute inset-x-0 top-0 z-[7] flex items-center justify-between px-3 pt-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-night/70 px-3 py-1.5 font-ui text-xs text-paper/80 backdrop-blur"
          >
            标题
          </Link>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="rounded-full border border-white/10 bg-night/70 px-3 py-1.5 font-ui text-xs text-paper/80 backdrop-blur"
            data-pause-toggle=""
          >
            {paused ? "继续" : "暂停"}
          </button>
        </div>
        <div className="text-center">
          <p className="font-display text-[11px] uppercase tracking-[0.22em] text-mint">
            Night Pass
          </p>
          <p className="font-ui text-xs text-paper/70">{pack.routeTitle}</p>
        </div>
        <button
          type="button"
          onClick={toggleDevPass}
          className="rounded-full border border-white/10 bg-night/70 px-3 py-1.5 font-ui text-[10px] uppercase tracking-wide text-gold backdrop-blur"
        >
          DEV {wallsUnlocked ? "PASS ON" : "PASS OFF"}
        </button>
      </header>

      {paused ? null : snapshot.isSettle ? (
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
              key={snapshot.node.nodeId}
              choices={snapshot.choices}
              entitled={wallsUnlocked}
              onSelect={onChoice}
              enterDelayMs={wallNode ? WALL_RHYTHM.chipEnterDelayMs : 0}
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
              entranceKey={beatKey}
              continueBeat={state.beatIndex > 0}
            />
          </div>
        </>
      )}

      {paused ? <PauseOverlay onResume={() => setPaused(false)} /> : null}

      {locked ? (
        <PaywallOverlay
          choice={locked}
          gate={snapshot.node.gate}
          entitled={wallsUnlocked}
          onDevUnlock={onDevUnlock}
          onClose={() => setLocked(null)}
        />
      ) : null}
    </div>
  );
}
