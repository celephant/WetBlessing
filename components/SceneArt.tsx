"use client";

import { useEffect, useRef, useState } from "react";
import {
  orientedStill,
  PORTRAIT_SOURCE_MEDIA,
  type StillPairKind,
} from "@/lib/orientation-stills";
import {
  cutDurationMs,
  selectAssetChangeTransition,
  shouldPlayAssetTransition,
  sceneIdentity,
  TRANSITION_FADE,
  type SceneMotion,
} from "@/lib/scene-presentation";
import type { SceneTransitionName } from "@/lib/types";

type SceneArtProps = {
  assetKey: string;
  title: string;
  nodeId: string;
  beatKey: string;
  frozen?: boolean;
};

type Plate = {
  landscapeSrc: string;
  portraitSrc: string | null;
  pair: StillPairKind;
  failed: boolean;
};

const PLACEHOLDER_BG =
  "bg-[radial-gradient(ellipse_at_top,_rgba(255,140,120,0.22),_transparent_55%),radial-gradient(ellipse_at_center,_rgba(220,90,140,0.10),_transparent_58%),radial-gradient(ellipse_at_bottom,_rgba(94,224,192,0.16),_transparent_48%),linear-gradient(180deg,#2a1a28_0%,#161820_52%,#122028_100%)]";

function plateFromAsset(assetKey: string): Plate {
  const still = orientedStill(assetKey);
  return {
    landscapeSrc: still.landscapeUrl,
    portraitSrc: still.portraitUrl,
    pair: still.pair,
    failed: false,
  };
}

export function SceneArt({
  assetKey,
  title,
  nodeId,
  beatKey,
  frozen = false,
}: SceneArtProps) {
  const [plate, setPlate] = useState<Plate>(() => plateFromAsset(assetKey));
  const [outgoing, setOutgoing] = useState<Plate | null>(null);
  const [activeTransition, setActiveTransition] = useState<SceneTransitionName | null>(TRANSITION_FADE);
  const motion: SceneMotion = "hold";
  const identityRef = useRef(sceneIdentity(assetKey));
  const plateRef = useRef(plate);
  const changeCountRef = useRef(0);
  const didMountRef = useRef(false);
  const prevAssetRef = useRef(assetKey);
  const cutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  plateRef.current = plate;

  useEffect(() => {
    const entrance = window.setTimeout(() => {
      if (changeCountRef.current === 0) setActiveTransition(null);
    }, cutDurationMs(TRANSITION_FADE));
    return () => {
      clearTimeout(entrance);
      if (cutTimerRef.current !== null) clearTimeout(cutTimerRef.current);
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
      identityRef.current = sceneIdentity(assetKey);
      prevAssetRef.current = assetKey;
      setPlate(plateFromAsset(assetKey));
      return;
    }
    if (prevAssetRef.current === assetKey) return;
    prevAssetRef.current = assetKey;
    const next = sceneIdentity(assetKey);
    if (!shouldPlayAssetTransition(identityRef.current, next)) {
      setPlate(plateFromAsset(assetKey));
      return;
    }
    changeCountRef.current += 1;
    const nextTransition = frozen
      ? null
      : selectAssetChangeTransition({ changeCount: changeCountRef.current });
    setOutgoing(plateRef.current);
    setPlate(plateFromAsset(assetKey));
    setActiveTransition(nextTransition);
    identityRef.current = next;
    if (cutTimerRef.current !== null) clearTimeout(cutTimerRef.current);
    if (nextTransition) {
      cutTimerRef.current = setTimeout(() => {
        setOutgoing(null);
        setActiveTransition(null);
        cutTimerRef.current = null;
      }, cutDurationMs(nextTransition));
    } else {
      setOutgoing(null);
    }
  }, [assetKey, beatKey, frozen]);

  const incomingClass = activeTransition ? `scene-in-${activeTransition}` : "";
  const outgoingClass = activeTransition ? `scene-out-${activeTransition}` : "";

  return (
    <div
      className={`scene-art-pane z-0 overflow-hidden ${PLACEHOLDER_BG}`}
      data-scene-art={plate.failed ? "placeholder" : "image"}
      data-scene-src={plate.landscapeSrc}
      data-portrait-src={plate.portraitSrc ?? ""}
      data-still-pair={plate.pair}
      data-desktop-fit="contain"
      data-mobile-fit="cover"
      data-scene-fit="cover"
      data-portrait-swap="off"
      data-scene-transition={activeTransition ?? "none"}
      data-scene-motion={motion}
      data-scene-frozen={frozen ? "on" : "off"}
      data-node-id={nodeId}
    >
      {outgoing ? (
        <ScenePlate
          landscapeSrc={outgoing.landscapeSrc}
          portraitSrc={outgoing.portraitSrc}
          alt=""
          failed={outgoing.failed}
          layerClass={`scene-plate-out ${outgoingClass}`}
        />
      ) : null}
      <ScenePlate
        key={`in-${plate.landscapeSrc}`}
        landscapeSrc={plate.landscapeSrc}
        portraitSrc={plate.portraitSrc}
        alt={title}
        failed={plate.failed}
        layerClass={`scene-plate-in ${incomingClass}`}
        onError={() => setPlate((current) => ({ ...current, failed: true }))}
      />
    </div>
  );
}

function ScenePlate({
  landscapeSrc,
  portraitSrc,
  alt,
  failed,
  layerClass,
  onError,
}: {
  landscapeSrc: string;
  portraitSrc: string | null;
  alt: string;
  failed: boolean;
  layerClass: string;
  onError?: () => void;
}) {
  return (
    <div className={`absolute inset-0 ${layerClass}`}>
      {failed ? (
        <div className="relative z-[1] flex h-full w-full items-center justify-center">
          <p className="font-ui text-sm text-paper/80">画面无法载入</p>
        </div>
      ) : (
        <div className="scene-still-hold absolute inset-0">
          <picture>
            {portraitSrc ? (
              <source media={PORTRAIT_SOURCE_MEDIA} srcSet={portraitSrc} />
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={landscapeSrc}
              alt={alt}
              className="scene-still-fill"
              onError={onError}
            />
          </picture>
        </div>
      )}
    </div>
  );
}
