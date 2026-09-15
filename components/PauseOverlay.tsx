"use client";

import Link from "next/link";

export function PauseOverlay({ onResume }: { onResume: () => void }) {
  return (
    <div
      className="absolute inset-0 z-[6]"
      data-pause-overlay=""
      role="dialog"
      aria-modal="true"
      aria-label="暂停"
    >
      <div
        className="pointer-events-none absolute inset-0 pause-freeze-frame"
        data-pause-letterbox=""
      >
        <div
          className="absolute inset-x-0 top-0 h-[11%] border-b border-gold/35 bg-gradient-to-b from-void via-void/92 to-transparent"
          data-pause-letterbox-bar="top"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[22%] border-t border-gold/25 bg-gradient-to-t from-void via-void/94 to-transparent"
          data-pause-letterbox-bar="bottom"
        />
      </div>

      <div className="absolute inset-x-0 bottom-[7%] z-[1] flex justify-center px-4">
        <div
          className="w-full max-w-xs rounded-dialog border border-gold/35 bg-night/90 px-5 py-4 text-center shadow-[0_0_40px_rgba(232,197,106,0.14)]"
          data-pause-card=""
        >
          <p className="font-display text-[11px] uppercase tracking-[0.28em] text-gold">
            Night Pass · 停住
          </p>
          <p className="mt-2 font-display text-2xl text-paper">画面停住</p>
          <p className="mt-2 font-ui text-sm text-mute">静帧还在。周一还在。</p>
          <button
            type="button"
            onClick={onResume}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-chip bg-mint font-ui text-[15px] font-medium text-ink"
            data-pause-resume=""
          >
            继续
          </button>
          <Link
            href="/"
            className="mt-2 flex min-h-[52px] w-full items-center justify-center rounded-chip border border-white/15 font-ui text-[15px] text-paper/80"
          >
            回到标题
          </Link>
        </div>
      </div>
    </div>
  );
}
