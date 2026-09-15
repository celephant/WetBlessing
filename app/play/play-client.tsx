"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { VNPlayer } from "@/components/VNPlayer";
import { playPackId, resolvePlayRoute } from "@/lib/dev-packs";
import type { ContentFile } from "@/lib/types";

export function PlayClient({
  fourweek,
  ch02,
}: {
  fourweek: ContentFile | null;
  ch02: ContentFile | null;
}) {
  const params = useSearchParams();
  const resume = params.get("resume") === "1";
  const pack = params.get("content") ?? params.get("route");
  const resolved = useMemo(
    () => resolvePlayRoute(pack, fourweek, ch02),
    [pack, fourweek, ch02],
  );

  if (resolved === "missing-fourweek" || resolved === "missing-ch02") {
    const which = resolved === "missing-ch02" ? "ch02" : "fourweek";
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center bg-void px-6 text-center text-paper"
        data-play-pack={which}
        data-fourweek={which === "fourweek" ? "blocked" : undefined}
        data-ch02={which === "ch02" ? "blocked" : undefined}
      >
        <p className="font-display text-xs uppercase tracking-[0.3em] text-mint">
          DEV
        </p>
        <p className="mt-3 max-w-md font-ui text-[17px] leading-7">
          {which === "ch02"
            ? "Ch02 办公室夹具未进仓。默认仍是 0.4.8-feel-hot，不会改成办公室关。"
            : "fourweek 官方夹具未进仓（PART F bytes 校验失败 / 未安装）。默认仍是 0.4.8-feel-hot，不会改成 0.5.0。"}
        </p>
        <a href="/play" className="mt-6 font-ui text-sm text-gold underline">
          回到 Night Pass
        </a>
      </div>
    );
  }

  return (
    <VNPlayer resume={resume} compiled={resolved} packId={playPackId(pack)} />
  );
}
