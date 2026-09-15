"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { VNPlayer } from "@/components/VNPlayer";
import { isFourweekPack, resolvePlayRoute } from "@/lib/dev-packs";
import type { ContentFile } from "@/lib/types";

export function PlayClient({ fourweek }: { fourweek: ContentFile | null }) {
  const params = useSearchParams();
  const resume = params.get("resume") === "1";
  const pack = params.get("content") ?? params.get("route");
  const resolved = useMemo(
    () => resolvePlayRoute(pack, fourweek),
    [pack, fourweek],
  );

  if (resolved === "missing-fourweek") {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center bg-void px-6 text-center text-paper"
        data-play-pack="fourweek"
        data-fourweek="blocked"
      >
        <p className="font-display text-xs uppercase tracking-[0.3em] text-mint">
          DEV
        </p>
        <p className="mt-3 max-w-md font-ui text-[17px] leading-7">
          fourweek 官方夹具未进仓（PART F bytes 校验失败 / 未安装）。默认仍是
          0.4.8-feel-hot，不会改成 0.5.0。
        </p>
        <a href="/play" className="mt-6 font-ui text-sm text-gold underline">
          回到 Night Pass
        </a>
      </div>
    );
  }

  return (
    <VNPlayer
      resume={resume}
      compiled={resolved}
      packId={isFourweekPack(pack) ? "fourweek" : "default"}
    />
  );
}
