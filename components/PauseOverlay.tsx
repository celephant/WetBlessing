"use client";

import Link from "next/link";
import type { PlayPrefs, TextSpeed } from "@/lib/play-prefs";
import { TEXT_SPEEDS } from "@/lib/play-prefs";

const SPEED_LABEL: Record<TextSpeed, string> = {
  instant: "即显",
  fast: "快",
  normal: "中",
  slow: "慢",
};

export function PauseOverlay({
  onResume,
  prefs,
  onPrefs,
}: {
  onResume: () => void;
  prefs: PlayPrefs;
  onPrefs: (patch: Partial<PlayPrefs>) => void;
}) {
  return (
    <div
      className="pause-overlay absolute inset-0 z-[6]"
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
          className="pause-letterbox-top absolute inset-x-0 top-0 h-[11%]"
          data-pause-letterbox-bar="top"
        />
        <div
          className="pause-letterbox-bottom absolute inset-x-0 bottom-0 h-[22%]"
          data-pause-letterbox-bar="bottom"
        />
      </div>

      <div className="absolute inset-x-0 bottom-[7%] z-[1] flex justify-center px-4">
        <div
          className="pause-card w-full max-w-xs rounded-dialog border border-white/12 px-5 py-4 text-center"
          data-pause-card=""
        >
          <p className="font-display text-[11px] uppercase tracking-[0.28em] text-paper/50">
            Night Pass · 画面停住
          </p>
          <p className="mt-2 font-ui text-sm text-mute">静帧还在。进度还在。</p>

          <div className="mt-4 text-left" data-reading-prefs="">
            <p className="font-display text-[11px] uppercase tracking-[0.18em] text-paper/40">
              阅读
            </p>
            <div className="mt-2 flex gap-1">
              {TEXT_SPEEDS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  className={`btn-tool flex-1 ${
                    prefs.textSpeed === speed ? "is-active" : ""
                  }`}
                  data-text-speed={speed}
                  onClick={() => onPrefs({ textSpeed: speed })}
                >
                  {SPEED_LABEL[speed]}
                </button>
              ))}
            </div>
            <label className="mt-2 flex min-h-[44px] items-center justify-between font-ui text-[13px] text-paper/80">
              自动推进
              <input
                type="checkbox"
                checked={prefs.autoAdvance}
                onChange={(event) => onPrefs({ autoAdvance: event.target.checked })}
                data-pref-auto=""
              />
            </label>
            <label className="flex min-h-[44px] items-center justify-between font-ui text-[13px] text-paper/80">
              仅跳过已读
              <input
                type="checkbox"
                checked={prefs.skipReadOnly}
                onChange={(event) => onPrefs({ skipReadOnly: event.target.checked })}
                data-pref-skip-read=""
              />
            </label>
            <label className="flex min-h-[44px] items-center justify-between font-ui text-[13px] text-paper/80">
              减少动态效果
              <input
                type="checkbox"
                checked={prefs.reduceMotion}
                onChange={(event) => onPrefs({ reduceMotion: event.target.checked })}
                data-pref-reduce-motion=""
              />
            </label>
          </div>

          <button
            type="button"
            onClick={onResume}
            className="btn-face btn-primary mt-4 w-full"
            data-pause-resume=""
          >
            继续
          </button>
          <Link
            href="/"
            className="btn-face btn-choice mt-2 flex w-full items-center justify-center"
          >
            回到标题
          </Link>
        </div>
      </div>
    </div>
  );
}
