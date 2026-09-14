"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  cropRect,
  cropToTransform,
  nextCropName,
  selectCropName,
} from "@/lib/camera-crops";
import {
  isFreePathFeel,
  isNightGradeNode,
  MOTION_SPEC,
  phoneGlowAllowed,
  selectAssetChangeTransition,
  selectSameAssetMotion,
  selectSceneFx,
  shouldPlayAssetTransition,
  sceneIdentity,
  TRANSITION_MS,
  type SceneMotion,
} from "@/lib/scene-presentation";
import { artAlt } from "@/lib/tokens";
import type { SceneFxName, SceneTransitionName } from "@/lib/types";

type SceneArtProps = {
  assetId?: string;
  artCue?: string | { summary?: string };
  nodeId: string;
  beatKey: string;
  transition?: string;
  camera?: string;
  fx?: string;
  afterPurchase?: boolean;
  forceNightGrade?: boolean;
  gate?: string;
};

const PLACEHOLDER_BG =
  "bg-[radial-gradient(ellipse_at_top,_rgba(255,140,120,0.22),_transparent_55%),radial-gradient(ellipse_at_center,_rgba(220,90,140,0.10),_transparent_58%),radial-gradient(ellipse_at_bottom,_rgba(94,224,192,0.16),_transparent_48%),linear-gradient(180deg,#2a1a28_0%,#161820_52%,#122028_100%)]";

type Plate = {
  src: string;
  failed: boolean;
};

export function SceneArt({
  assetId,
  artCue,
  nodeId,
  beatKey,
  transition,
  camera,
  fx,
  afterPurchase = false,
  forceNightGrade = false,
  gate,
}: SceneArtProps) {
  // Always `assetId` from JSON — never derive `${nodeId}.webp` (paid aliases differ).
  // Missing files remap to a shipped webp so investor play is never a black void.
  const identity = sceneIdentity(assetId);
  const src = identity.url;
  const alt = artAlt(artCue, nodeId);

  const [plate, setPlate] = useState<Plate>({ src, failed: false });
  const [outgoing, setOutgoing] = useState<Plate | null>(null);
  const [activeTransition, setActiveTransition] =
    useState<SceneTransitionName | null>("fade");
  const lockCrop =
    forceNightGrade || isNightGradeNode(nodeId, gate);
  const [motion, setMotion] = useState<SceneMotion>(() =>
    selectSameAssetMotion({
      explicitCamera: camera,
      holdCount: 0,
      allowHold: lockCrop,
    }),
  );
  const [overlay, setOverlay] = useState<SceneFxName>(() =>
    selectSceneFx({ explicit: fx, nodeId, gate, forceNightGrade }),
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
  };

  useEffect(() => {
    setOverlay(selectSceneFx({ explicit: fx, nodeId, gate, forceNightGrade }));
  }, [fx, nodeId, gate, forceNightGrade]);

  useEffect(() => {
    const entrance = window.setTimeout(() => {
      if (changeCountRef.current === 0) {
        setActiveTransition(null);
      }
    }, TRANSITION_MS.fade);
    return () => {
      clearTimeout(entrance);
      if (cutTimerRef.current !== null) {
        clearTimeout(cutTimerRef.current);
      }
    };
  }, []);

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
    const {
      camera: cam,
      transition: cut,
      afterPurchase: purchased,
      nodeId: arrivingId,
      gate: arrivingGate,
    } = hooksRef.current;

    if (shouldPlayAssetTransition(identityRef.current, next)) {
      changeCountRef.current += 1;
      const nextTransition = selectAssetChangeTransition({
        explicit: cut,
        changeCount: changeCountRef.current,
        nodeId: arrivingId,
        gate: arrivingGate,
        afterPurchase: purchased,
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
      setMotion(
        selectSameAssetMotion({
          explicitCamera: cam,
          holdCount: 0,
          allowHold: lockCrop,
        }),
      );
      identityRef.current = next;
      if (cutTimerRef.current !== null) {
        clearTimeout(cutTimerRef.current);
      }
      cutTimerRef.current = setTimeout(() => {
        setOutgoing(null);
        setActiveTransition(null);
        cutTimerRef.current = null;
      }, TRANSITION_MS[nextTransition]);
      return;
    }

    holdCountRef.current += 1;
    setHoldCount(holdCountRef.current);
    setMotion(
      selectSameAssetMotion({
        explicitCamera: cam,
        holdCount: holdCountRef.current,
        allowHold: lockCrop,
      }),
    );
  }, [assetId, beatKey]);

  const showImage = !plate.failed;
  const cropName = selectCropName({
    explicitCamera: camera,
    holdCount,
    lockCrop,
  });
  const fromCrop = cropToTransform(cropRect(cropName), 1);
  const toCrop = cropToTransform(
    cropRect(nextCropName(cropName)),
    MOTION_SPEC.kenBurnsScale,
  );
  const cropStyle = {
    "--crop-from-scale": String(fromCrop.scale),
    "--crop-from-tx": `${fromCrop.tx}%`,
    "--crop-from-ty": `${fromCrop.ty}%`,
    "--crop-to-scale": String(toCrop.scale),
    "--crop-to-tx": `${toCrop.tx}%`,
    "--crop-to-ty": `${toCrop.ty}%`,
  } as CSSProperties;
  const motionClass =
    motion === "hold" ? "scene-crop-hold" : "scene-crop-kenburns";
  const incomingClass = activeTransition ? `scene-in-${activeTransition}` : "";
  const outgoingClass = activeTransition ? `scene-out-${activeTransition}` : "";

  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden ${PLACEHOLDER_BG}`}
      data-scene-art={showImage ? "image" : "placeholder"}
      data-scene-src={plate.src}
      data-scene-transition={activeTransition ?? "none"}
      data-scene-motion={motion}
      data-scene-fx={overlay}
      data-scene-hold={String(holdCount)}
      data-scene-crop={cropName}
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
          motionClass="scene-crop-hold"
          cropStyle={cropStyle}
          layerClass={`scene-plate-out ${outgoingClass}`}
        />
      ) : null}

      <ScenePlate
        key={`in-${cropName}-${holdCount}`}
        src={plate.src}
        alt={alt}
        failed={plate.failed}
        motionClass={motionClass}
        cropStyle={cropStyle}
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

      {activeTransition === "dip-to-black" ? (
        <div className="pointer-events-none absolute inset-0 z-[3] scene-dip-veil" />
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
  motionClass,
  cropStyle,
  layerClass,
  onError,
}: {
  src: string;
  alt: string;
  failed: boolean;
  motionClass: string;
  cropStyle?: CSSProperties;
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
        <div className={`absolute inset-[-8%] ${motionClass}`} style={cropStyle}>
          <div
            className={
              motionClass === "scene-crop-hold"
                ? "h-full w-full"
                : "scene-motion-breathe-layer h-full w-full"
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover object-top"
              onError={onError}
            />
          </div>
        </div>
      )}
    </div>
  );
}
