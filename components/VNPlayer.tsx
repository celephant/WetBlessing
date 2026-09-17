"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChoiceList } from "@/components/ChoiceList";
import { DialogBox } from "@/components/DialogBox";
import { FunnelAuthDock } from "@/components/FunnelAuthDock";
import { FunnelHud, funnelLookBeat } from "@/components/FunnelHud";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { PauseOverlay } from "@/components/PauseOverlay";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { PlayToolbar } from "@/components/PlayToolbar";
import { SceneArt } from "@/components/SceneArt";
import { playerFacingChoiceText, splitChoiceFace } from "@/lib/choice-label";
import { route, type CompiledRoute } from "@/lib/content";
import type { PlayPackId } from "@/lib/dev-packs";
import {
  clickAdvance,
  hasEntitlement,
  selectChoice,
  startGame,
  unlockNext,
  unlockScope,
  view,
  withEntitlement,
} from "@/lib/engine";
import {
  grantFullEntitleDev,
  grantScopeDev,
  isFullyEntitled,
  loadEntitlements,
  normalizeEntitlements,
  revokeStoryPassDev,
} from "@/lib/entitlement";
import { INTERACTION, shouldSkipMotion } from "@/lib/interaction";
import { scopeForGate } from "@/lib/paywall-copy";
import {
  loadPlayPrefs,
  savePlayPrefs,
  type PlayPrefs,
} from "@/lib/play-prefs";
import {
  applySeasonCarry,
  loadSeasonCarry,
  saveSeasonCarry,
  seasonContinueTarget,
} from "@/lib/season-continue";
import {
  isFreePathFeel,
  isNightGradeNode,
  isPaywallWallNode,
  presentationHooksForBeat,
  TRANSITION_MS,
} from "@/lib/scene-presentation";
import { NIGHT_PASS_DIALOG_DOCK_CSS } from "@/lib/tokens";
import type { Beat, Choice, GameState } from "@/lib/types";
import {
  isFunnelAuthNode,
  isFunnelLookNode,
  type FunnelZone,
} from "@/lib/funnel";
import { dismissPaywallToTitle, persistPackSave, readPackSave } from "@/lib/new-run";

export function VNPlayer({
  resume = false,
  compiled = route,
  packId = "default",
  seasonContinue = false,
}: {
  resume?: boolean;
  compiled?: CompiledRoute;
  packId?: PlayPackId;
  seasonContinue?: boolean;
}) {
  const [state, setState] = useState<GameState | null>(null);
  const [locked, setLocked] = useState<Choice | null>(null);
  const [afterPurchase, setAfterPurchase] = useState(false);
  const [paused, setPaused] = useState(false);
  const [funnelLook, setFunnelLook] = useState<FunnelZone | null>(null);
  const [prefs, setPrefs] = useState<PlayPrefs>({
    textSpeed: "normal",
    autoAdvance: false,
    skipReadOnly: false,
    reduceMotion: false,
  });
  const [readyBeat, setReadyBeat] = useState("");
  const [echo, setEcho] = useState<{ text: string } | null>(null);
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
  const router = useRouter();
  const pack = compiled.content;

  useEffect(() => {
    setPrefs(loadPlayPrefs());
  }, []);

  useEffect(() => {
    const entitlements = loadEntitlements();
    const saved = readPackSave(packId);
    if (resume || (packId === "funnel" && saved)) {
      if (saved) {
        setState({
          ...saved,
          entitlements: normalizeEntitlements({
            ...saved.entitlements,
            ...entitlements,
          }),
          pendingChoiceId: saved.pendingChoiceId ?? null,
        });
        return;
      }
    }
    let started = startGame(entitlements, compiled);
    if (seasonContinue) {
      started = applySeasonCarry(started, loadSeasonCarry());
    }
    setState(started);
  }, [resume, compiled, packId, seasonContinue]);

  useEffect(() => {
    if (!isFunnelLookNode(state?.nodeId ?? "")) {
      setFunnelLook(null);
    }
  }, [state?.nodeId]);

  useEffect(() => {
    if (!afterPurchase) return;
    const cut = window.setTimeout(
      () => setAfterPurchase(false),
      TRANSITION_MS["soft-zoom"],
    );
    return () => window.clearTimeout(cut);
  }, [afterPurchase]);

  useEffect(() => {
    return () => {
      if (confirmTimer.current !== null) {
        window.clearTimeout(confirmTimer.current);
      }
    };
  }, []);

  const beatKey = state ? `${state.nodeId}:${state.beatIndex}` : "";

  useEffect(() => {
    if (!state || !beatKey) return;
    if (trackedBeat.current === beatKey) return;
    trackedBeat.current = beatKey;
    setSelectedId(null);
    setConfirming(false);
    if (state.beatIndex > 0) {
      setEcho(null);
    }
  }, [beatKey, state]);

  if (!state) {
    return <div className="h-dvh bg-void" />;
  }

  if (!compiled.nodes.has(state.nodeId)) {
    return <div className="h-dvh bg-void" data-pack-switch="" />;
  }

  const snapshot = view(state, compiled);
  const sceneHooks = presentationHooksForBeat(snapshot.node, state.beatIndex);
  const lookBeat = isFunnelLookNode(state.nodeId) ? funnelLookBeat(funnelLook) : null;
  const showFunnelChoices =
    snapshot.choices.length > 0 &&
    (!isFunnelLookNode(state.nodeId) || Boolean(funnelLook));
  const authDock = isFunnelAuthNode(state.nodeId);
  const alreadyRead = seenBeats.current.has(beatKey);
  const lineReady = readyBeat === beatKey;
  const showChoices = showFunnelChoices && lineReady;
  const canHide =
    !locked &&
    !paused &&
    !authDock &&
    !showChoices &&
    snapshot.choices.length === 0;

  const commit = (next: GameState) => {
    persistPackSave(next, packId);
    setState(next);
  };

  const markClick = () => {
    lastClickMs.current = performance.now();
  };

  const patchPrefs = (patch: Partial<PlayPrefs>) => {
    setPrefs(savePlayPrefs(patch));
  };

  const onDialogClick = () => {
    if (paused || locked || confirming) return;
    if (snapshot.choices.length > 0 || snapshot.isSettle) return;
    markClick();
    setEcho(null);
    seenBeats.current.add(beatKey);
    commit(clickAdvance(state, compiled));
  };

  const finishChoice = (choiceId: string) => {
    const result = selectChoice(state, choiceId, compiled);
    setConfirming(false);
    setSelectedId(null);
    if (result.ok) {
      setLocked(null);
      commit(result.state);
      return;
    }
    if (result.reason === "locked") {
      setEcho(null);
      setLocked(result.choice);
      commit(result.state);
    }
  };

  const onChoice = (choiceId: string) => {
    if (paused || confirming) return;
    const choice = snapshot.choices.find((item) => item.choiceId === choiceId);
    if (!choice) return;
    const sinceLast = performance.now() - lastClickMs.current;
    markClick();
    setSelectedId(choiceId);
    setConfirming(true);
    const spoken = splitChoiceFace(choice.text).bark || playerFacingChoiceText(choice.text);
    setHistory((lines) => [
      ...lines,
      { speaker: "kai", text: spoken },
    ]);
    const skip = shouldSkipMotion(prefs.reduceMotion, sinceLast);
    const lockedChoice = Boolean(
      choice.requiresEntitlement &&
        !hasEntitlement(state, choice.requiresEntitlement, snapshot.node.gate),
    );
    if (!lockedChoice) {
      setEcho({ text: spoken });
    }
    const wait = skip
      ? 0
      : lockedChoice
        ? INTERACTION.pressMs
        : INTERACTION.pressMs + INTERACTION.othersFadeMs;
    if (confirmTimer.current !== null) {
      window.clearTimeout(confirmTimer.current);
    }
    confirmTimer.current = window.setTimeout(() => {
      confirmTimer.current = null;
      finishChoice(choiceId);
    }, wait);
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

  const onUnlockScope = () => {
    const scope = scopeForGate(snapshot.node.gate);
    grantScopeDev(scope, state.entitlements);
    const result = unlockScope(state, scope, undefined, compiled);
    if (result.ok) {
      setLocked(null);
      setAfterPurchase(true);
      commit(result.state);
    }
  };

  const toggleDevPass = () => {
    const nextGranted = !isFullyEntitled(state.entitlements);
    if (nextGranted) {
      grantFullEntitleDev(state.entitlements);
    } else {
      revokeStoryPassDev(state.entitlements);
    }
    commit(withEntitlement(state, "full_entitle", nextGranted));
  };

  const passOn = isFullyEntitled(state.entitlements);
  const w1On = passOn || Boolean(state.entitlements.w1_continue);
  const w2On = passOn || Boolean(state.entitlements.w2_office);
  const w3On =
    passOn ||
    Boolean(state.entitlements.w3_edge_night) ||
    Boolean(state.entitlements.edge_lock);
  const continueTo = seasonContinueTarget(
    packId,
    snapshot.node.nodeId,
    state.entitlements,
    state.flags,
  );

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

  const recordHistory = (complete: boolean) => {
    if (!complete) return;
    setReadyBeat(beatKey);
    seenBeats.current.add(beatKey);
    const line = lookBeat ?? snapshot.beat;
    setLastSpeaker(line.speaker);
    setHistory((lines) => {
      const last = lines[lines.length - 1];
      if (last && last.speaker === line.speaker && last.text === line.text) {
        return lines;
      }
      return [...lines, line];
    });
  };

  return (
    <div
      className="vn-stage relative h-dvh w-full overflow-hidden bg-void text-paper"
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
      data-ui-hidden={uiHidden ? "on" : "off"}
      data-reduce-motion={prefs.reduceMotion ? "on" : "off"}
      data-full-entitle={passOn ? "on" : "off"}
      data-play-pack={packId}
      data-content-version={pack.contentVersion}
      data-unlock-gates="first_sub,chapter_start,edge_lock"
      data-entitle-first-sub={w1On ? "on" : "off"}
      data-entitle-w1={w1On ? "on" : "off"}
      data-entitle-w2={w2On ? "on" : "off"}
      data-entitle-w3={w3On ? "on" : "off"}
      data-entitle-edge-lock={w3On ? "on" : "off"}
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

      {packId === "funnel" ? (
        <FunnelHud
          nodeId={state.nodeId}
          beatIndex={state.beatIndex}
          flags={state.flags}
          looked={funnelLook}
          onLook={(zone) => setFunnelLook(zone)}
        />
      ) : null}

      <PlayToolbar
        paused={paused}
        autoAdvance={prefs.autoAdvance}
        uiHidden={uiHidden}
        canHide={canHide}
        historyOpen={historyOpen}
        passOn={passOn}
        routeTitle={pack.routeTitle}
        onTitleHref="/"
        onTogglePause={() => setPaused((value) => !value)}
        onToggleAuto={() => patchPrefs({ autoAdvance: !prefs.autoAdvance })}
        onToggleHistory={() => setHistoryOpen((value) => !value)}
        onToggleHide={() => {
          if (!canHide) return;
          setHistoryOpen(false);
          setUiHidden(true);
        }}
        onToggleDevPass={toggleDevPass}
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

      {paused || uiHidden ? null : snapshot.isSettle ? (
        <SettleDock
          text={snapshot.node.text}
          continueTo={continueTo}
          onCarry={() => saveSeasonCarry(state)}
          reduceMotion={prefs.reduceMotion}
          nodeId={snapshot.node.nodeId}
        />
      ) : (
        <>
          {showChoices ? (
            <div
              className="choice-overlay z-[5] flex items-end justify-center overflow-hidden px-3"
              data-choice-overlay=""
            >
              <ChoiceList
                key={snapshot.node.nodeId}
                choices={snapshot.choices}
                choiceEntitled={(choice) =>
                  !choice.requiresEntitlement ||
                  hasEntitlement(state, choice.requiresEntitlement, snapshot.node.gate)
                }
                entitled={passOn}
                onSelect={onChoice}
                selectedId={selectedId}
                confirming={confirming}
                reduceMotion={prefs.reduceMotion}
              />
            </div>
          ) : null}
          <div
            className="absolute inset-x-0 bottom-0 z-[2]"
            data-night-pass-dock="28"
            style={{ height: NIGHT_PASS_DIALOG_DOCK_CSS }}
          >
            {authDock ? (
              <FunnelAuthDock caption={snapshot.beat.text} state={state} />
            ) : (
              <DialogBox
                beat={lookBeat ?? snapshot.beat}
                echo={echo}
                showCaret={
                  snapshot.canClickAdvance &&
                  snapshot.choices.length === 0 &&
                  !lookBeat
                }
                onAdvance={onDialogClick}
                onRevealChange={recordHistory}
                entranceKey={lookBeat ? `${beatKey}:${lookBeat.speaker}` : beatKey}
                continueBeat={state.beatIndex > 0 || Boolean(lookBeat)}
                textSpeed={prefs.textSpeed}
                reduceMotion={prefs.reduceMotion}
                alreadyRead={alreadyRead && prefs.skipReadOnly}
                hasChoices={snapshot.choices.length > 0}
                nameplateEnter={
                  !lookBeat &&
                  snapshot.beat.speaker !== lastSpeaker &&
                  snapshot.beat.speaker !== "narrator"
                }
              />
            )}
          </div>
        </>
      )}

      {paused ? (
        <PauseOverlay
          onResume={() => setPaused(false)}
          prefs={prefs}
          onPrefs={patchPrefs}
        />
      ) : null}

      <HistoryDrawer
        open={historyOpen && !paused && !uiHidden}
        lines={history}
        onClose={() => setHistoryOpen(false)}
      />

      {locked ? (
        <PaywallOverlay
          choice={locked}
          gate={snapshot.node.gate}
          entitled={passOn}
          onDevUnlock={onDevUnlock}
          onUnlockScope={onUnlockScope}
          onClose={() => {
            const next = dismissPaywallToTitle(state);
            persistPackSave(next, packId);
            setState(next);
            setLocked(null);
            router.push("/");
          }}
        />
      ) : null}

      <AutoAdvance
        enabled={prefs.autoAdvance && !paused && !locked && !uiHidden && !confirming}
        ready={lineReady}
        canAdvance={
          snapshot.canClickAdvance &&
          snapshot.choices.length === 0 &&
          !snapshot.isSettle &&
          !authDock
        }
        textLength={(lookBeat ?? snapshot.beat).text.length}
        reduceMotion={prefs.reduceMotion}
        beatKey={beatKey}
        advance={onDialogClick}
      />
    </div>
  );
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

function SettleDock({
  text,
  continueTo,
  onCarry,
  reduceMotion,
  nodeId,
}: {
  text?: string;
  continueTo: { href: string; pack: string; label: string } | null;
  onCarry: () => void;
  reduceMotion: boolean;
  nodeId: string;
}) {
  const [ready, setReady] = useState(reduceMotion);

  useEffect(() => {
    setReady(reduceMotion);
    if (reduceMotion) return;
    const cut = window.setTimeout(() => setReady(true), INTERACTION.settleActionsMs);
    return () => window.clearTimeout(cut);
  }, [nodeId, reduceMotion]);

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[3] flex items-end"
      data-settle-dock=""
      style={{ height: NIGHT_PASS_DIALOG_DOCK_CSS }}
    >
      <div className="dialog-dock flex h-full w-full flex-col items-center justify-center px-5 text-center">
        <p className="max-w-dialog font-ui text-[17px] leading-7 text-paper">{text}</p>
        <div
          className={`mt-4 flex w-full max-w-dialog flex-col items-center ${
            ready ? "settle-actions-in" : "invisible"
          }`}
          data-settle-actions={ready ? "on" : "off"}
        >
          {continueTo ? (
            <Link
              href={continueTo.href}
              onClick={onCarry}
              className="btn-face btn-primary inline-flex px-6"
              data-season-continue={continueTo.pack}
            >
              {continueTo.label}
            </Link>
          ) : null}
          <Link
            href="/"
            className={`${continueTo ? "btn-face btn-choice mt-2" : "btn-face btn-primary mt-4"} inline-flex px-6`}
          >
            回到标题
          </Link>
        </div>
      </div>
    </div>
  );
}
