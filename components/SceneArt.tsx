"use client";

import { useEffect, useRef, useState } from "react";
import { detectIntimateBeat } from "@/lib/feel-density";
import {
  cutDurationMs,
  isFreePathFeel,
  isNightGradeNode,
  phoneGlowAllowed,
  selectAssetChangeTransition,
  selectSceneFx,
  shouldPlayAssetTransition,
  sceneIdentity,
  TRANSITION_FADE,
  type SceneMotion,
} from "@/lib/scene-presentation";
import { artAlt } from "@/lib/tokens";
import type { ArtCue, SceneFxName, SceneTransitionName } from "@/lib/types";

type SceneArtProps = {
  assetId?: string;
  artCue?: ArtCue;
  nodeText?: string;
  nodeId: string;
  beatKey: string;
  transition?: string;
  camera?: string;
  fx?: string;
  afterPurchase?: boolean;
  forceNightGrade?: boolean;
  gate?: string;
  beforeChoices?: boolean;
  frozen?: boolean;
};

type Plate = {
  src: string;
  failed: boolean;
};

const PLACEHOLDER_BG =
  "bg-[radial-gradient(ellipse_at_top,_rgba(255,140,120,0.22),_transparent_55%),radial-gradient(ellipse_at_center,_rgba(220,90,140,0.10),_transparent_58%),radial-gradient(ellipse_at_bottom,_rgba(94,224,192,0.16),_transparent_48%),linear-gradient(180deg,#2a1a28_0%,#161820_52%,#122028_100%)]";

export function SceneArt({
  assetId,
  artCue,
  nodeText,
  nodeId,
  beatKey,
  transition,
  camera,
  fx,
  afterPurchase = false,
  forceNightGrade = false,
  gate,
  beforeChoices = false,
  frozen = false,
}: SceneArtProps) {
  // Always `assetId` from JSON — never derive `${nodeId}.webp` (paid aliases differ).
  // Missing files remap to a shipped webp so investor play is never a black void.
  const identity = sceneIdentity(assetId);
  const src = identity.url;
  const alt = artAlt(artCue, nodeId);

  const [plate, setPlate] = useState<Plate>({ src, failed: false });
  const [outgoing, setOutgoing] = useState<Plate | null>(null);
  const [activeTransition, setActiveTransition] =
    useState<SceneTransitionName | null>(TRANSITION_FADE);
  const intimateBeat = detectIntimateBeat({
    nodeId,
    assetId,
    artCue,
    text: nodeText,
  });
  const motion: SceneMotion = "hold";
  const [overlay, setOverlay] = useState<SceneFxName>(() =>
    selectSceneFx({
      explicit: fx,
      nodeId,
      gate,
      forceNightGrade,
      intimateBeat: Boolean(intimateBeat),
    }),
  );
  const [holdCount, setHoldCount] = useState(0);

  const identityRef = useRef(identity);
  const plateRef = useRef(plate);
  const plateFailedRef = useRef(false);
  const changeCountRef = useRef(0);
  const holdCountRef = useRef(0);
  const hooksRef = useRef({
    transition,
    camera,
    fx,
    afterPurchase,
    forceNightGrade,
    nodeId,
    gate,
    beforeChoices,
    frozen,
    intimateBeat,
  });
  const didMountRef = useRef(false);
  const prevBeatRef = useRef(beatKey);
  const prevAssetRef = useRef(assetId);
  const cutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  plateRef.current = plate;
  hooksRef.current = {
    transition,
    camera,
    fx,
    afterPurchase,
    forceNightGrade,
    nodeId,
    gate,
    beforeChoices,
    frozen,
    intimateBeat,
  };

  useEffect(() => {
    setOverlay(
      selectSceneFx({
        explicit: fx,
        nodeId,
        gate,
        forceNightGrade,
        intimateBeat: Boolean(intimateBeat),
      }),
    );
  }, [fx, nodeId, gate, forceNightGrade, intimateBeat]);

  useEffect(() => {
    const entrance = window.setTimeout(() => {
      if (changeCountRef.current === 0) {
        setActiveTransition(null);
      }
    }, cutDurationMs(TRANSITION_FADE));
    return () => {
      clearTimeout(entrance);
      if (cutTimerRef.current !== null) {
        clearTimeout(cutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!frozen) return;
    if (cutTimerRef.current !== null) {
      clearTimeout(cutTimerRef.current);
      cutTimerRef.current = null;
    }
    setOutgoing(null);
    setActiveTransition(null);
  }, [frozen]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      identityRef.current = sceneIdentity(assetId);
      prevBeatRef.current = beatKey;
      prevAssetRef.current = assetId;
      return;
    }

    const assetChanged = prevAssetRef.current !== assetId;
    const beatChanged = prevBeatRef.current !== beatKey;
    prevBeatRef.current = beatKey;
    prevAssetRef.current = assetId;
    if (!assetChanged && !beatChanged) return;

    const next = sceneIdentity(assetId);
    const { frozen: plateFrozen } = hooksRef.current;

    if (shouldPlayAssetTransition(identityRef.current, next)) {
      changeCountRef.current += 1;
      const nextTransition = plateFrozen
        ? null
        : selectAssetChangeTransition({
            changeCount: changeCountRef.current,
          });
      setOutgoing({
        src: plateRef.current.src,
        failed: plateFailedRef.current,
      });
      setPlate({ src: next.url, failed: false });
      plateFailedRef.current = false;
      setActiveTransition(nextTransition);
      holdCountRef.current = 0;
      setHoldCount(0);
      identityRef.current = next;
      if (cutTimerRef.current !== null) {
        clearTimeout(cutTimerRef.current);
      }
      if (nextTransition) {
        cutTimerRef.current = setTimeout(() => {
          setOutgoing(null);
          setActiveTransition(null);
          cutTimerRef.current = null;
        }, cutDurationMs(nextTransition));
      } else {
        setOutgoing(null);
      }
      return;
    }

    // Same plate: freeze. Do not Ken Burns, breathe, or crop-hunt.
    holdCountRef.current += 1;
    setHoldCount(holdCountRef.current);
  }, [assetId, beatKey]);

  const showImage = !plate.failed;
  const incomingClass = activeTransition ? `scene-in-${activeTransition}` : "";
  const outgoingClass = activeTransition ? `scene-out-${activeTransition}` : "";

  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden ${PLACEHOLDER_BG}`}
      data-scene-art={showImage ? "image" : "placeholder"}
      data-scene-src={plate.src}
      data-scene-transition={activeTransition ?? "none"}
      data-scene-motion={motion}
      data-scene-fit="contain"
      data-scene-frozen={frozen || beforeChoices ? "on" : "off"}
      data-scene-fx={overlay}
      data-scene-hold={String(holdCount)}
      data-scene-crop="full"
      data-density-line={String(holdCount + 1)}
      data-intimate-beat={intimateBeat ?? "off"}
      data-crop-cut="off"
      data-free-feel={
        !forceNightGrade && isFreePathFeel(nodeId, gate) ? "on" : "off"
      }
      data-phone-glow={
        overlay === "soft-light" &&
        phoneGlowAllowed({ nodeId, gate, forceNightGrade })
          ? "on"
          : "off"
      }
    >
      {outgoing ? (
        <ScenePlate
          src={outgoing.src}
          alt=""
          failed={outgoing.failed}
          layerClass={`scene-plate-out ${outgoingClass}`}
        />
      ) : null}

      <ScenePlate
        key={`in-${plate.src}`}
        src={plate.src}
        alt={alt}
        failed={plate.failed}
        layerClass={`scene-plate-in ${incomingClass}`}
        onError={() => {
          plateFailedRef.current = true;
          setPlate((current) => ({ ...current, failed: true }));
        }}
      />

      {overlay !== "none" ? (
        <div
          className={`pointer-events-none absolute inset-0 z-[2] scene-fx-${overlay}`}
          data-scene-overlay={overlay}
        />
      ) : null}

      {showImage ? (
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-void via-void/25 to-black/20" />
      ) : null}
    </div>
  );
}

function ScenePlate({
  src,
  alt,
  failed,
  layerClass,
  onError,
}: {
  src: string;
  alt: string;
  failed: boolean;
  layerClass: string;
  onError?: () => void;
}) {
  return (
    <div className={`absolute inset-0 ${layerClass}`}>
      {failed ? (
        <div className="relative z-[1] flex h-full w-full flex-col items-center justify-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-mint/80">
            placeholder
          </p>
          {alt ? (
            <p className="mt-2 max-w-sm px-6 text-center font-ui text-sm text-paper/80">
              {alt}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="scene-still-hold absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-contain object-center"
            onError={onError}
          />
        </div>
      )}
    </div>
  );
}
