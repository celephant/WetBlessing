"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { VNPlayer } from "@/components/VNPlayer";
import { playPackId, resolvePlayRoute, type MissingPlayPack } from "@/lib/dev-packs";
import type { ContentFile } from "@/lib/types";

const MISSING_COPY: Record<MissingPlayPack, { pack: string; body: string }> = {
  "missing-fourweek": {
    pack: "fourweek",
    body: "fourweek 官方夹具未进仓（PART F bytes 校验失败 / 未安装）。默认仍是 0.4.8-feel-hot，不会改成 0.5.0。",
  },
  "missing-ch02": {
    pack: "ch02",
    body: "Ch02 办公室夹具未进仓。默认仍是 0.4.8-feel-hot，不会改成办公室关。",
  },
  "missing-ch03": {
    pack: "ch03",
    body: "Ch03 闭馆夜夹具未进仓。默认仍是 0.4.8-feel-hot，不会改成闭馆夜。",
  },
  "missing-ch04": {
    pack: "ch04",
    body: "Ch04 名分夹具未进仓。默认仍是 0.4.8-feel-hot，不会改成结局关。",
  },
  "missing-funnel": {
    pack: "funnel",
    body: "入学夜漏斗夹具未进仓。默认仍是 0.4.8-feel-hot，不会改成登录前钩子。",
  },
};

export function PlayClient({
  fourweek,
  ch02,
  ch03 = null,
  ch04 = null,
  funnel = null,
}: {
  fourweek: ContentFile | null;
  ch02: ContentFile | null;
  ch03?: ContentFile | null;
  ch04?: ContentFile | null;
  funnel?: ContentFile | null;
}) {
  const params = useSearchParams();
  const resume = params.get("resume") === "1";
  const pack = params.get("content") ?? params.get("route");
  const resolved = useMemo(
    () => resolvePlayRoute(pack, fourweek, ch02, ch03, ch04, funnel),
    [pack, fourweek, ch02, ch03, ch04, funnel],
  );

  if (typeof resolved === "string") {
    const copy = MISSING_COPY[resolved];
    const which = copy.pack;
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center bg-void px-6 text-center text-paper"
        data-play-pack={which}
        data-fourweek={which === "fourweek" ? "blocked" : undefined}
        data-ch02={which === "ch02" ? "blocked" : undefined}
        data-ch03={which === "ch03" ? "blocked" : undefined}
        data-ch04={which === "ch04" ? "blocked" : undefined}
        data-funnel={which === "funnel" ? "blocked" : undefined}
      >
        <p className="font-display text-xs uppercase tracking-[0.3em] text-mint">
          DEV
        </p>
        <p className="mt-3 max-w-md font-ui text-[17px] leading-7">{copy.body}</p>
        <a href="/play" className="mt-6 font-ui text-sm text-gold underline">
          回到 Night Pass
        </a>
      </div>
    );
  }

  return (
    <VNPlayer
      key={`${playPackId(pack)}:${resume ? "r" : "n"}:${params.get("continue") === "1" ? "c" : "s"}`}
      resume={resume}
      compiled={resolved}
      packId={playPackId(pack)}
      seasonContinue={params.get("continue") === "1"}
    />
  );
}
