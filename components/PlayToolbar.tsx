"use client";

import Link from "next/link";

type PlayToolbarProps = {
  paused: boolean;
  autoAdvance: boolean;
  muted: boolean;
  uiHidden: boolean;
  canHide: boolean;
  historyOpen: boolean;
  passOn: boolean;
  routeTitle: string;
  onTitleHref: string;
  onTogglePause: () => void;
  onToggleAuto: () => void;
  onToggleHistory: () => void;
  onToggleHide: () => void;
  onToggleMute: () => void;
  onToggleDevPass: () => void;
};

export function PlayToolbar({
  paused,
  autoAdvance,
  muted,
  uiHidden,
  canHide,
  historyOpen,
  passOn,
  routeTitle,
  onTitleHref,
  onTogglePause,
  onToggleAuto,
  onToggleHistory,
  onToggleHide,
  onToggleMute,
  onToggleDevPass,
}: PlayToolbarProps) {
  if (uiHidden) return null;

  return (
    <header
      className="play-chrome absolute inset-x-0 top-0 z-[7] flex items-start justify-between gap-2 px-2 pt-2"
      data-play-toolbar=""
      data-route-title={routeTitle}
    >
      <nav className="play-chrome-row" aria-label="播放">
        <Link href={onTitleHref} className="btn-tool">
          标题
        </Link>
        <button
          type="button"
          onClick={onTogglePause}
          className="btn-tool"
          data-pause-toggle=""
        >
          {paused ? "继续" : "暂停"}
        </button>
        <button
          type="button"
          onClick={onToggleHistory}
          className="btn-tool"
          data-history-toggle=""
          aria-pressed={historyOpen}
        >
          历史
        </button>
        <button
          type="button"
          onClick={onToggleAuto}
          className="btn-tool"
          data-auto-toggle=""
          aria-pressed={autoAdvance}
        >
          {autoAdvance ? "自动开" : "自动"}
        </button>
        <button
          type="button"
          onClick={onToggleHide}
          className="btn-tool"
          data-hide-ui=""
          disabled={!canHide}
          title={
            canHide
              ? "隐藏对白和工具，不推进剧情"
              : "选择或购买确认时不能隐藏界面"
          }
        >
          看图
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          className="btn-tool"
          data-mute-toggle=""
          aria-pressed={muted}
        >
          静音
        </button>
      </nav>
      <button
        type="button"
        onClick={onToggleDevPass}
        className="btn-tool btn-tool-dev"
      >
        DEV {passOn ? "PASS ON" : "PASS OFF"}
      </button>
    </header>
  );
}
