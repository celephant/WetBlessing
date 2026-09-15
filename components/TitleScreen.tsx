"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { content } from "@/lib/content";
import { SAVE_STORAGE_KEY } from "@/lib/entitlement";

export function TitleScreen() {
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setHasSave(Boolean(localStorage.getItem(SAVE_STORAGE_KEY)));
  }, []);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-void text-paper">
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/scenes/ch01/n_conflict.webp"
          alt="WetBlessing chapter 1"
          className="h-full w-full object-cover object-top opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-black/30" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-dialog flex-col justify-end px-6 pb-12 pt-16">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-mint">
          Night Pass · Slice 0
        </p>
        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight text-paper">
          WetBlessing
        </h1>
        <p className="mt-3 font-ui text-base text-paper/80">
          校园恋爱视觉小说 · {content.routeTitle}
        </p>
        <p className="mt-2 font-ui text-sm text-mute">
          擦边非成人 · 大学角色 18+ · Kai / Mia / Jade / Rae / Lina / Vanessa
        </p>

        <div className="mt-8 flex flex-col gap-2">
          <Link
            href="/play"
            className="flex min-h-[52px] items-center justify-center rounded-chip bg-hot font-ui text-[15px] font-medium text-paper"
          >
            开始入学周
          </Link>
          {hasSave ? (
            <Link
              href="/play?resume=1"
              className="flex min-h-[52px] items-center justify-center rounded-chip border border-white/15 bg-white/10 font-ui text-[15px] text-paper"
            >
              继续
            </Link>
          ) : null}
        </div>

        <p className="mt-6 font-ui text-[11px] leading-5 text-mute">
          content {content.contentVersion}
          <br />
          <Link href="/play?content=fourweek" className="text-gold/80 underline">
            DEV fourweek
          </Link>
          <br />
          {/* TODO(slice-1): Auth / account entitlements */}
          {/* TODO(slice-1): Stripe Checkout for story_pass_month */}
          {/* TODO(slice-1): Railway production deploy */}
          Stripe / Auth / Railway 未接入 · 付费墙仅 DEV 假开通。
        </p>
      </div>
    </main>
  );
}
