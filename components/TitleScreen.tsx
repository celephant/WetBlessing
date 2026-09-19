"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { story } from "@/lib/content";
import { orientedStill, PORTRAIT_SOURCE_MEDIA, TITLE_LANDSCAPE_ASSET_KEY } from "@/lib/orientation-stills";
import { persistPlayerDevFlag } from "@/lib/player-dev";
import { clearTomorrowSave, hasTomorrowSave, readStorySave } from "@/lib/save";

export function TitleScreen() {
  const [canContinue, setCanContinue] = useState(false);
  const [incompatible, setIncompatible] = useState<string | null>(null);
  const [canNewRun, setCanNewRun] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const titleStill = orientedStill(TITLE_LANDSCAPE_ASSET_KEY);

  useEffect(() => {
    const saved = readStorySave();
    setCanContinue(saved.status === "ok");
    setIncompatible(saved.status === "incompatible" ? saved.reason : null);
    setCanNewRun(saved.status === "ok" || hasTomorrowSave());
    setShowDev(persistPlayerDevFlag(window.location.search, window.localStorage));
  }, []);

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-void text-paper"
      data-title-idle=""
      data-title-dev={showDev ? "on" : "off"}
      data-still-pair={titleStill.pair}
      data-desktop-fit="contain"
      data-mobile-fit="cover"
      data-story-version={story.storyVersion}
      data-title-asset={TITLE_LANDSCAPE_ASSET_KEY}
      data-portrait-src={titleStill.portraitUrl ?? ""}
    >
      <div className="absolute inset-0" data-title-still="">
        <picture>
          {titleStill.portraitUrl ? (
            <source media={PORTRAIT_SOURCE_MEDIA} srcSet={titleStill.portraitUrl} />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={titleStill.landscapeUrl} alt={story.title} className="scene-still-fill" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-dialog flex-col justify-end px-6 pb-12 pt-16">
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-paper">明天见</h1>
        <p className="mt-3 font-ui text-base text-paper/80">{story.title}</p>
        <p className="mt-2 font-ui text-sm text-mute">
          校园恋爱视觉小说 · tomorrow.1 · 成年大学生设定
        </p>

        {incompatible ? (
          <p className="mt-4 max-w-md font-ui text-sm leading-6 text-gold" data-save-incompatible="">
            {incompatible}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-2">
          {canContinue ? (
            <Link
              href="/play?resume=1"
              className="btn-face btn-primary choice-press"
              data-title-start="resume"
            >
              继续
            </Link>
          ) : (
            <Link href="/play" className="btn-face btn-primary choice-press" data-title-start="new">
              开始
            </Link>
          )}
          {incompatible ? (
            <Link
              href="/play"
              className="btn-face btn-choice choice-press"
              data-title-start="new-from-incompatible"
            >
              开始新的一局
            </Link>
          ) : null}
          {canContinue ? (
            <Link href="/play" className="btn-face btn-choice-ghost choice-press" data-title-start="fresh">
              从开头阅读
            </Link>
          ) : null}
          {canNewRun ? (
            <button
              type="button"
              data-title-start="new-run"
              onClick={() => {
                clearTomorrowSave();
                window.location.assign("/play");
              }}
              className="btn-face btn-choice-ghost choice-press"
            >
              新开一局
            </button>
          ) : null}
        </div>

        <p className="mt-6 font-ui text-[11px] leading-5 text-mute">
          story {story.storyVersion}
          {showDev ? (
            <>
              <br />
              商业 / 登录 / 支付关闭 · 竖图自动替换关闭
            </>
          ) : null}
        </p>
      </div>
    </main>
  );
}
