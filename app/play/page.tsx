import { Suspense } from "react";
import { PlayClient } from "@/app/play/play-client";
import {
  tryReadCh02Office,
  tryReadCh03Night,
  tryReadCh04Endings,
  tryReadFourweekMini,
  tryReadLandingFunnel,
} from "@/lib/dev-packs.node";

export default function PlayPage() {
  const fourweek = tryReadFourweekMini();
  const ch02 = tryReadCh02Office();
  const ch03 = tryReadCh03Night();
  const ch04 = tryReadCh04Endings();
  const funnel = tryReadLandingFunnel();
  return (
    <Suspense fallback={<div className="min-h-dvh bg-void" />}>
      <PlayClient
        fourweek={fourweek}
        ch02={ch02}
        ch03={ch03}
        ch04={ch04}
        funnel={funnel}
      />
    </Suspense>
  );
}
