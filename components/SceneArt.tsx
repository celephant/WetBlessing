"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  cropRect,
  cropToTransform,
  selectCropName,
  type CropName,
} from "@/lib/camera-crops";
import {
  detectIntimateBeat,
  intimateFallbackCamera,
} from "@/lib/feel-density";
import {
  CROP_CUT_TRANSITION,
  cutDurationMs,
  isFreePathFeel,
  isNightGradeNode,
  phoneGlowAllowed,
  selectAssetChangeTransition,
  selectSameAssetMotion,
  selectSceneFx,
  shouldPlayAssetTransition,
  sceneIdentity,
  type CropCutTransition,
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

type ActiveCut = SceneTransitionName | CropCutTransition | null;

const PLACEHOLDER_BG =
  "bg-[radial-gradient(ellipse_at_top,_rgba(255,140,120,0.22),_transparent_55%),radial-gradient(ellipse_at_center,_rgba(220,90,140,0.10),_transparent_58%),radial-gradient(ellipse_at_bottom,_rgba(94,224,192,0.16),_transparent_48%),linear-gradient(180deg,#2a1a28_0%,#161820_52%,#122028_100%)]";

type Plate = {
  src: string;
  failed: boolean;
  cropName?: CropName;
};

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
    useState<ActiveCut>("fade");
  const lockCrop =
    forceNightGrade || isNightGradeNode(nodeId, gate);
  const intimateBeat = detectIntimateBeat({
    nodeId,
    assetId,
    artCue,
    text: nodeText,
  });
  const [motion, setMotion] = useState<SceneMotion>(() =>
    selectSameAssetMotion({
      explicitCamera: camera,
      holdCount: 0,
      allowHold: true,
      intimateBeat: Boolean(intimateBeat),
      frozen: frozen || beforeChoices,
    }),
  );
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
  const [lineCameraChanged, setLineCameraChanged] = useState(false);

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
  const prevCameraRef = useRef(camera);
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
    }, cutDurationMs("fade"));
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
      beforeChoices: arrivingChoices,
      intimateBeat: arrivingIntimate,
    } = hooksRef.current;
    const cameraChanged = Boolean(cam && cam !== prevCameraRef.current);
    prevCameraRef.current = cam;
    setLineCameraChanged(cameraChanged);

    if (shouldPlayAssetTransition(identityRef.current, next)) {
      changeCountRef.current += 1;
      const nextTransition = selectAssetChangeTransition({
        explicit: cut,
        changeCount: changeCountRef.current,
        nodeId: arrivingId,
        gate: arrivingGate,
        afterPurchase: purchased,
        intimateBeat: arrivingIntimate,
      });
      setOutgoing({
        src: plateRef.current.src,
        failed: plateFailedRef.current,
        cropName: selectCropName({
          explicitCamera:
            cam ??
            intimateFallbackCamera(
              typeof arrivingIntimate === "string" ? arrivingIntimate : null,
            ),
          holdCount: holdCountRef.current,
          lockCrop,
          beforeChoices: arrivingChoices,
          cameraChanged,
        }),
      });
      setPlate({ src: next.url, failed: false });
      plateFailedRef.current = false;
      setActiveTransition(nextTransition);
      holdCountRef.current = 0;
      setHoldCount(0);
      setLineCameraChanged(false);
      setMotion("hold");
      identityRef.current = next;
      if (cutTimerRef.current !== null) {
        clearTimeout(cutTimerRef.current);
      }
      cutTimerRef.current = setTimeout(() => {
        setOutgoing(null);
        setActiveTransition(null);
        cutTimerRef.current = null;
      }, cutDurationMs(nextTransition));
      return;
    }

    // Same plate: freeze. Do not Ken Burns, breathe, or crop-hunt.
    holdCountRef.current += 1;
    setHoldCount(holdCountRef.current);
    setMotion("hold");
  }, [assetId, beatKey, lockCrop]);

  const showImage = !plate.failed;
  const cropName = selectCropName({
    explicitCamera: camera ?? intimateFallbackCamera(intimateBeat),
    holdCount,
    lockCrop,
    beforeChoices,
    cameraChanged: lineCameraChanged,
  });
  const cropStyleFor = (name: CropName, rawCamera?: string) => {
    const fromCrop = cropToTransform(cropRect(name, assetId, rawCamera), 1);
    return {
      "--crop-from-scale": String(fromCrop.scale),
      "--crop-from-tx": `${fromCrop.tx}%`,
      "--crop-from-ty": `${fromCrop.ty}%`,
    } as CSSProperties;
  };
  const cropStyle = cropStyleFor(cropName, camera);
  const motionClass = "scene-crop-hold";
  const incomingClass = activeTransition ? `scene-in-${activeTransition}` : "";
  const outgoingClass = activeTransition ? `scene-out-${activeTransition}` : "";

  return (
    <div
      className={`absolute inset-0 z-0 overflow-hidden ${PLACEHOLDER_BG}`}
      data-scene-art={showImage ? "image" : "placeholder"}
      data-scene-src={plate.src}
      data-scene-transition={activeTransition ?? "none"}
      data-scene-motion="hold"
      data-scene-frozen={frozen || beforeChoices ? "on" : "off"}
      data-scene-fx={overlay}
      data-scene-hold={String(holdCount)}
      data-scene-crop={cropName}
      data-density-line={String(holdCount + 1)}
      data-intimate-beat={intimateBeat ?? "off"}
      data-crop-cut={
        activeTransition === CROP_CUT_TRANSITION ? "soft-zoom" : "off"
      }
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
          cropStyle={cropStyleFor(outgoing.cropName ?? cropName, camera)}
          layerClass={`scene-plate-out ${outgoingClass}`}
        />
      ) : null}

      <ScenePlate
        key={`in-${plate.src}`}
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
          <div className="h-full w-full">
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
