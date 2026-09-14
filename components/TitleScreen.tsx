"use client";

import { content } from "@/engine/content";

export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex h-dvh w-full flex-col justify-end overflow-hidden bg-[var(--wb-void)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_#3a2040_0%,_transparent_45%),radial-gradient(ellipse_at_90%_10%,_#1b2a44_0%,_#07080c_55%)]" />
      <div className="relative z-10 px-6 pb-16 sm:px-10">
        <p className="text-[12px] uppercase tracking-[0.28em] text-[var(--wb-gold)]">Night Pass</p>
        <h1 className="font-display mt-2 text-5xl font-extrabold tracking-tight sm:text-6xl">WetBlessing</h1>
        <p className="mt-3 max-w-md text-[15px] leading-6 text-[var(--wb-paper)]/80">
          {content.routeTitle}
        </p>
        <p className="mt-2 text-[12px] text-[var(--wb-mute)]">
          擦边校园恋爱 · 非成人向 · 角色 18+ · {content.contentVersion}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStart}
            className="min-h-12 rounded-full bg-[var(--wb-paper)] px-6 text-[15px] font-medium text-[var(--wb-ink)]"
          >
            开始入学周
          </button>
        </div>
        <p className="mt-6 text-[11px] text-[var(--wb-mute)]">
          Kai · Mia · Jade · Vanessa · 点句推进 · 首订墙内置
        </p>
      </div>
    </div>
  );
}
