"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChoiceList } from "@/components/ChoiceList";
import { DialogBox } from "@/components/DialogBox";
import { FunnelAuthDock } from "@/components/FunnelAuthDock";
import { FunnelHud, funnelLookBeat } from "@/components/FunnelHud";
import { PauseOverlay } from "@/components/PauseOverlay";
import { PaywallOverlay } from "@/components/PaywallOverlay";
import { SceneArt } from "@/components/SceneArt";
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
  revokeStoryPassDev,
} from "@/lib/entitlement";
import { scopeForGate } from "@/lib/paywall-copy";
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
  WALL_RHYTHM,
} from "@/lib/scene-presentation";
import { NIGHT_PASS_DIALOG_DOCK_CSS } from "@/lib/tokens";
import type { Choice, Entitlements, GameState } from "@/lib/types";
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
  const router = useRouter();
  const pack = compiled.content;

  useEffect(() => {
    const entitlements = loadEntitlements();
    const saved = readPackSave(packId);
    if (resume || (packId === "funnel" && saved)) {
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

  if (!state) {
    return <div className="h-dvh bg-void" />;
  }

  if (!compiled.nodes.has(state.nodeId)) {
    return <div className="h-dvh bg-void" data-pack-switch="" />;
  }

  const snapshot = view(state, compiled);
  const beatKey = `${state.nodeId}:${state.beatIndex}`;
  const sceneHooks = presentationHooksForBeat(snapshot.node, state.beatIndex);
  const lookBeat = isFunnelLookNode(state.nodeId) ? funnelLookBeat(funnelLook) : null;
  const showFunnelChoices =
    snapshot.choices.length > 0 &&
    (!isFunnelLookNode(state.nodeId) || Boolean(funnelLook));
  const authDock = isFunnelAuthNode(state.nodeId);

  const commit = (next: GameState) => {
    persistPackSave(next, packId);
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
    const entitlements: Entitlements = nextGranted
      ? grantFullEntitleDev(state.entitlements)
      : revokeStoryPassDev(state.entitlements);
    commit(withEntitlement(state, "full_entitle", Boolean(entitlements.story_pass_month)));
  };

  const passOn = isFullyEntitled(state.entitlements);
  const w1On =
    passOn || Boolean(state.entitlements.w1_continue);
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
          DEV {passOn ? "PASS ON" : "PASS OFF"}
        </button>
      </header>

      {paused ? null : snapshot.isSettle ? (
        <div
          className="absolute inset-x-0 bottom-0 z-[3] flex items-end"
          data-settle-dock=""
          style={{ height: NIGHT_PASS_DIALOG_DOCK_CSS }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center border-t border-white/10 bg-night/88 px-5 text-center backdrop-blur-xl">
            <p className="max-w-dialog font-ui text-[17px] leading-7 text-paper">
              {snapshot.node.text}
            </p>
            {continueTo ? (
              <Link
                href={continueTo.href}
                onClick={() => saveSeasonCarry(state)}
                className="mt-4 inline-flex min-h-[52px] items-center justify-center rounded-chip bg-mint px-6 font-ui text-[15px] font-medium text-ink"
                data-season-continue={continueTo.pack}
              >
                {continueTo.label}
              </Link>
            ) : null}
            <Link
              href="/"
              className={`${continueTo ? "mt-2" : "mt-4"} inline-flex min-h-[52px] items-center justify-center rounded-chip ${
                continueTo
                  ? "border border-white/15 px-6 font-ui text-[15px] text-paper/80"
                  : "bg-mint px-6 font-ui text-[15px] font-medium text-ink"
              }`}
            >
              回到标题
            </Link>
          </div>
        </div>
      ) : (
        <>
          {showFunnelChoices ? (
            <div
              className="choice-overlay z-[5] flex items-center justify-center px-3"
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
                enterDelayMs={wallNode ? WALL_RHYTHM.chipEnterDelayMs : 0}
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
                showCaret={
                  snapshot.canClickAdvance &&
                  snapshot.choices.length === 0 &&
                  !lookBeat
                }
                onAdvance={onDialogClick}
                entranceKey={lookBeat ? `${beatKey}:${lookBeat.speaker}` : beatKey}
                continueBeat={state.beatIndex > 0 || Boolean(lookBeat)}
              />
            )}
          </div>
        </>
      )}

      {paused ? <PauseOverlay onResume={() => setPaused(false)} /> : null}

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
    </div>
  );
}
