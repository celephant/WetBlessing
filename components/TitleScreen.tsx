"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { content } from "@/lib/content";
import { loadEntitlements } from "@/lib/entitlement";
import { readFunnelCompleted } from "@/lib/funnel";
import {
  clearRunProgress,
  hasAnyRunSave,
  readTitleResume,
  type TitleResume,
} from "@/lib/new-run";
import {
  orientedStill,
  PORTRAIT_SOURCE_MEDIA,
  TITLE_LANDSCAPE_ASSET_ID,
} from "@/lib/orientation-stills";

export function TitleScreen() {
  const [funnelDone, setFunnelDone] = useState(false);
  const [canNewRun, setCanNewRun] = useState(false);
  const [resume, setResume] = useState<TitleResume | null>(null);
  const titleStill = orientedStill(TITLE_LANDSCAPE_ASSET_ID);

  useEffect(() => {
    const funnel = readFunnelCompleted();
    const entitlements = loadEntitlements();
    const target = readTitleResume(funnel);
    setFunnelDone(funnel);
    setResume(target);
    setCanNewRun(
      hasAnyRunSave() ||
        funnel ||
        Boolean(entitlements.w1_continue) ||
        Boolean(entitlements.story_pass) ||
        Boolean(entitlements.story_pass_month),
    );
  }, []);

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-void text-paper"
      data-title-idle=""
      data-still-pair={titleStill.pair}
      data-title-asset={TITLE_LANDSCAPE_ASSET_ID}
    >
      <div className="absolute inset-0" data-title-still="">
        <picture>
          {titleStill.portraitUrl ? (
            <source
              media={PORTRAIT_SOURCE_MEDIA}
              srcSet={titleStill.portraitUrl}
            />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={titleStill.landscapeUrl}
            alt="WetBlessing"
            className="scene-still-fill"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-dialog flex-col justify-end px-6 pb-12 pt-16">
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-paper">
          WetBlessing
        </h1>
        <p className="mt-3 font-ui text-base text-paper/80">
          校园恋爱视觉小说 · {content.routeTitle}
        </p>
        <p className="mt-2 font-ui text-sm text-mute">
          擦边非成人 · 大学角色 18+ · Kai / Mia / Jade / Rae / Lina / Vanessa / Reina
        </p>

        <div className="mt-8 flex flex-col gap-2">
          {resume ? (
            <Link
              href={resume.href}
              className="btn-face btn-primary choice-press"
              data-title-start="resume"
              data-title-resume-pack={resume.pack}
            >
              {resume.label}
            </Link>
          ) : (
            <Link
              href="/play?content=funnel"
              className="btn-face btn-primary choice-press relative"
              data-title-start="funnel"
            >
              开始入学夜
              <span
                className="absolute right-3 rounded-full border border-white/20 bg-night/50 px-2 py-0.5 font-ui text-[11px] text-paper/80"
                data-title-badge=""
              >
                约 3 分钟
              </span>
            </Link>
          )}
          {resume && !funnelDone ? (
            <Link
              href="/play?content=funnel"
              className="btn-face btn-choice-ghost choice-press"
              data-title-start="funnel"
            >
              开始入学夜
            </Link>
          ) : null}
          {canNewRun ? (
            <button
              type="button"
              data-title-start="new-run"
              onClick={() => {
                clearRunProgress();
                window.location.assign("/");
              }}
              className="btn-face btn-choice-ghost choice-press"
            >
              新开一局
            </button>
          ) : null}
        </div>

        <p className="mt-6 font-ui text-[11px] leading-5 text-mute">
          content {content.contentVersion}
          <br />
          <Link href="/play?content=fourweek" className="text-gold/80 underline">
            DEV fourweek
          </Link>
          {" · "}
          <Link href="/play?content=ch02" className="text-gold/80 underline">
            DEV ch02 办公室
          </Link>
          {" · "}
          <Link href="/play?content=ch03" className="text-gold/80 underline">
            DEV ch03 闭馆夜
          </Link>
          {" · "}
          <Link href="/play?content=ch04" className="text-gold/80 underline">
            DEV ch04 名分
          </Link>
          <br />
          {/* TODO(slice-1): Auth / account entitlements */}
          {/* TODO(slice-1): Stripe Checkout for story_pass */}
          {/* TODO(slice-1): Railway production deploy */}
          Stripe / Auth / Railway 未接入 · 付费墙仅 DEV 假开通。
        </p>
      </div>
    </main>
  );
}
