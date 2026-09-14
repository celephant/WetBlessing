"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { VNPlayer } from "@/components/VNPlayer";

function PlayInner() {
  const params = useSearchParams();
  const resume = params.get("resume") === "1";
  const pack = params.get("content");
  if (pack === "fourweek") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-void px-6 text-center text-paper">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-mint">
          DEV
        </p>
        <p className="mt-3 max-w-md font-ui text-[17px] leading-7">
          fourweek 草稿未进默认编译。默认仍是 0.4.8-feel-hot。
        </p>
        <a href="/play" className="mt-6 font-ui text-sm text-gold underline">
          回到 Night Pass
        </a>
      </div>
    );
  }
  return <VNPlayer resume={resume} />;
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-void" />}>
      <PlayInner />
    </Suspense>
  );
}
