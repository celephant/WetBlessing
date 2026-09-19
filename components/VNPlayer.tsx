"use client";

import { useEffect, useRef, useState } from "react";
import { ChoiceList } from "@/components/ChoiceList";
import { DialogBox } from "@/components/DialogBox";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { PauseOverlay } from "@/components/PauseOverlay";
import { PlayToolbar } from "@/components/PlayToolbar";
import { SceneArt } from "@/components/SceneArt";
import { compiledStory } from "@/lib/content";
import { clickAdvance, selectChoice, startGame, view } from "@/lib/engine";
import { INTERACTION, shouldSkipMotion } from "@/lib/interaction";
import {
  DEFAULT_PLAY_PREFS,
  loadPlayPrefs,
  savePlayPrefs,
  type PlayPrefs,
} from "@/lib/play-prefs";
import { persistStorySave, readStorySave } from "@/lib/save";
import { NIGHT_PASS_DIALOG_DOCK_CSS } from "@/lib/tokens";
import type { Beat, CompiledStory, GameState } from "@/lib/types";

export function VNPlayer({
  resume = false,
  compiled = compiledStory,
}: {
  resume?: boolean;
  compiled?: CompiledStory;
}) {
  const [state, setState] = useState<GameState | null>(null);
  const [incompatible, setIncompatible] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [prefs, setPrefs] = useState<PlayPrefs>(DEFAULT_PLAY_PREFS);
  const [readyBeat, setReadyBeat] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [uiHidden, setUiHidden] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<Beat[]>([]);
  const [lastSpeaker, setLastSpeaker] = useState("");
  const seenBeats = useRef(new Set<string>());
  const lastClickMs = useRef(0);
  const confirmTimer = useRef<number | null>(null);
  const trackedBeat = useRef("");
  const dialogClickRef = useRef<() => void>(() => undefined);
  const choiceRef = useRef<(choiceId: string) => void>(() => undefined);

  useEffect(() => {
    setPrefs(loadPlayPrefs());
  }, []);

  useEffect(() => {
    if (resume) {
      const saved = readStorySave();
      if (saved.status === "ok" && compiled.nodes.has(saved.state.nodeId)) {
        setState(saved.state);
        return;
      }
      if (saved.status === "incompatible") {
        setIncompatible(saved.reason);
        return;
      }
    }
    setState(startGame(compiled));
  }, [resume, compiled]);

  useEffect(() => {
    return () => {
      if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
    };
  }, []);

  const beatKey = state ? `${state.nodeId}:${state.beatIndex}` : "";

  useEffect(() => {
    if (!state || !beatKey) return;
    if (trackedBeat.current === beatKey) return;
    trackedBeat.current = beatKey;
    setSelectedId(null);
    setConfirming(false);
  }, [beatKey, state]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setPaused((value) => !value);
        return;
      }
      if (!state || paused || uiHidden || confirming || incompatible) return;
      const snapshot = view(state, compiled);
      if (snapshot.choices.length > 0 && /^[1-9]$/.test(event.key)) {
        const choice = snapshot.choices[Number(event.key) - 1];
        if (choice) {
          event.preventDefault();
          choiceRef.current(choice.id);
        }
        return;
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        dialogClickRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, paused, uiHidden, confirming, incompatible, compiled]);

  if (incompatible) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-void px-6 text-center text-paper">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-mint">明天见</p>
        <p className="mt-3 max-w-md font-ui text-[17px] leading-7" data-save-incompatible="">
          {incompatible}
        </p>
        <button
          type="button"
          className="btn-face btn-primary mt-6"
          data-start-new-run=""
          onClick={() => {
            setIncompatible(null);
            setState(startGame(compiled));
          }}
        >
          开始新的一局
        </button>
        <a href="/" className="mt-3 font-ui text-sm text-gold underline">
          回到标题
        </a>
      </div>
    );
  }

  if (!state) {
    return <div className="h-dvh bg-void" />;
  }

  const snapshot = view(state, compiled);
  const alreadyRead = seenBeats.current.has(beatKey);
  const lineReady = readyBeat === beatKey;
  const showChoices = snapshot.choices.length > 0 && lineReady;
  const canHide = !paused && !showChoices && snapshot.choices.length === 0;

  const commit = (next: GameState) => {
    persistStorySave(next);
    setState(next);
  };

  const onDialogClick = () => {
    if (paused || confirming) return;
    const current = view(state, compiled);
    if (current.choices.length > 0) return;
    lastClickMs.current = performance.now();
    seenBeats.current.add(beatKey);
    commit(clickAdvance(state, compiled));
  };

  const finishChoice = (choiceId: string) => {
    const result = selectChoice(state, choiceId, compiled);
    setConfirming(false);
    setSelectedId(null);
    if (result.ok) commit(result.state);
  };

  const onChoice = (choiceId: string) => {
    if (paused || confirming) return;
    const current = view(state, compiled);
    const choice = current.choices.find((item) => item.id === choiceId);
    if (!choice) return;
    const sinceLast = performance.now() - lastClickMs.current;
    setSelectedId(choiceId);
    setConfirming(true);
    lastClickMs.current = performance.now();
    const wait = shouldSkipMotion(prefs.reduceMotion, sinceLast)
      ? 0
      : INTERACTION.pressMs + INTERACTION.othersFadeMs;
    if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
    confirmTimer.current = window.setTimeout(() => {
      confirmTimer.current = null;
      finishChoice(choiceId);
    }, wait);
  };

  dialogClickRef.current = onDialogClick;
  choiceRef.current = onChoice;

  const recordHistory = (complete: boolean) => {
    if (!complete) return;
    setReadyBeat(beatKey);
    seenBeats.current.add(beatKey);
    const line = snapshot.beat;
    setLastSpeaker(line.speaker);
    setHistory((lines) => {
      const last = lines[lines.length - 1];
      if (last && last.speaker === line.speaker && last.text === line.text) return lines;
      return [...lines, line];
    });
  };

  return (
    <div
      className="vn-stage relative h-dvh w-full overflow-hidden bg-void text-paper"
      data-paused={paused ? "on" : "off"}
      data-ui-hidden={uiHidden ? "on" : "off"}
      data-story-version={compiled.storyVersion}
      data-entry={compiled.entryNodeId}
      data-commercial="off"
      data-portrait-swap="off"
      tabIndex={0}
    >
      <SceneArt
        assetKey={snapshot.node.assetKey}
        title={snapshot.node.title}
        nodeId={snapshot.node.id}
        beatKey={beatKey}
        frozen={paused || snapshot.choices.length > 0}
      />

      <PlayToolbar
        paused={paused}
        autoAdvance={prefs.autoAdvance}
        muted={prefs.muted}
        uiHidden={uiHidden}
        canHide={canHide}
        historyOpen={historyOpen}
        routeTitle={compiled.story.title}
        onTitleHref="/"
        onTogglePause={() => setPaused((value) => !value)}
        onToggleAuto={() => patchPrefs(prefs, setPrefs)}
        onToggleHistory={() => setHistoryOpen((value) => !value)}
        onToggleHide={() => {
          if (!canHide) return;
          setHistoryOpen(false);
          setUiHidden(true);
        }}
        onToggleMute={() => setPrefs(savePlayPrefs({ muted: !prefs.muted }))}
      />

      {uiHidden ? (
        <button
          type="button"
          className="absolute inset-0 z-[8]"
          data-ui-restore=""
          aria-label="显示界面"
          onClick={() => setUiHidden(false)}
        />
      ) : null}

      {paused || uiHidden ? null : (
        <div
          className="vn-chrome-bottom absolute inset-x-0 bottom-0 z-[5] flex flex-col justify-end gap-2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none"
          data-night-pass-dock="glass"
          data-dialog-glass=""
        >
          {showChoices ? (
            <div
              className="choice-overlay pointer-events-auto relative flex max-h-[42vh] items-end justify-center overflow-hidden px-0"
              data-choice-overlay=""
            >
              <ChoiceList
                key={snapshot.node.id}
                choices={snapshot.choices}
                onSelect={onChoice}
                selectedId={selectedId}
                confirming={confirming}
                reduceMotion={prefs.reduceMotion}
              />
            </div>
          ) : null}
          <div
            className="dialog-glass pointer-events-auto mx-auto w-full max-w-dialog"
            style={{ maxHeight: NIGHT_PASS_DIALOG_DOCK_CSS }}
          >
            <DialogBox
              beat={snapshot.beat}
              showCaret={snapshot.canClickAdvance && snapshot.choices.length === 0}
              onAdvance={onDialogClick}
              onRevealChange={recordHistory}
              entranceKey={beatKey}
              continueBeat={state.beatIndex > 0}
              textSpeed={prefs.textSpeed}
              reduceMotion={prefs.reduceMotion}
              alreadyRead={alreadyRead && prefs.skipReadOnly}
              hasChoices={snapshot.choices.length > 0}
              nameplateEnter={snapshot.beat.speaker !== lastSpeaker}
            />
          </div>
        </div>
      )}

      {paused ? (
        <PauseOverlay
          onResume={() => setPaused(false)}
          prefs={prefs}
          onPrefs={(patch) => setPrefs(savePlayPrefs(patch))}
        />
      ) : null}

      <HistoryDrawer
        open={historyOpen && !paused && !uiHidden}
        lines={history}
        onClose={() => setHistoryOpen(false)}
      />

      <AutoAdvance
        enabled={prefs.autoAdvance && !paused && !uiHidden && !confirming}
        ready={lineReady}
        canAdvance={snapshot.canClickAdvance && snapshot.choices.length === 0}
        textLength={snapshot.beat.text.length + (snapshot.beat.thought?.length ?? 0)}
        reduceMotion={prefs.reduceMotion}
        beatKey={beatKey}
        advance={onDialogClick}
      />
    </div>
  );
}

function patchPrefs(prefs: PlayPrefs, setPrefs: (next: PlayPrefs) => void) {
  setPrefs(savePlayPrefs({ autoAdvance: !prefs.autoAdvance }));
}

function AutoAdvance({
  enabled,
  ready,
  canAdvance,
  textLength,
  reduceMotion,
  beatKey,
  advance,
}: {
  enabled: boolean;
  ready: boolean;
  canAdvance: boolean;
  textLength: number;
  reduceMotion: boolean;
  beatKey: string;
  advance: () => void;
}) {
  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  useEffect(() => {
    if (!enabled || !ready || !canAdvance) return;
    const wait = reduceMotion ? 80 : INTERACTION.autoBaseMs + Math.min(textLength, 80) * 12;
    const cut = window.setTimeout(() => advanceRef.current(), wait);
    return () => window.clearTimeout(cut);
  }, [enabled, ready, canAdvance, textLength, reduceMotion, beatKey]);
  return null;
}
