"use client";

import { speakerLabel } from "@/lib/tokens";
import type { Beat } from "@/lib/types";

export function HistoryDrawer({
  open,
  lines,
  onClose,
}: {
  open: boolean;
  lines: Beat[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-[8] flex items-end justify-center bg-void/40 p-4"
      data-history-drawer=""
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="关闭历史"
        onClick={onClose}
      />
      <div className="relative mb-[30%] max-h-[46%] w-full max-w-dialog overflow-y-auto rounded-dialog border border-white/10 bg-stage/95 p-4">
        <p className="font-display text-[11px] uppercase tracking-[0.22em] text-paper/50">
          刚才说过的
        </p>
        <ol className="mt-3 flex flex-col gap-2">
          {lines.length === 0 ? (
            <li className="font-ui text-sm text-mute">还没有对白。</li>
          ) : (
            lines.map((line, index) => {
              const name = speakerLabel(line.speaker) || "旁白";
              return (
                <li
                  key={`${index}:${line.speaker}:${line.text.slice(0, 24)}`}
                  className="font-ui text-[15px] leading-6 text-paper/90"
                >
                  <span className="text-paper/45">{name} · </span>
                  {line.text}
                </li>
              );
            })
          )}
        </ol>
      </div>
    </div>
  );
}
