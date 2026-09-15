import { Suspense } from "react";
import { PlayClient } from "@/app/play/play-client";
import { tryReadCh02Office, tryReadFourweekMini } from "@/lib/dev-packs.node";

export default function PlayPage() {
  const fourweek = tryReadFourweekMini();
  const ch02 = tryReadCh02Office();
  return (
    <Suspense fallback={<div className="min-h-dvh bg-void" />}>
      <PlayClient fourweek={fourweek} ch02={ch02} />
    </Suspense>
  );
}
