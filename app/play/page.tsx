import { Suspense } from "react";
import { PlayClient } from "@/app/play/play-client";
import { tryReadFourweekMini } from "@/lib/dev-packs.node";

export default function PlayPage() {
  const fourweek = tryReadFourweekMini();
  return (
    <Suspense fallback={<div className="min-h-dvh bg-void" />}>
      <PlayClient fourweek={fourweek} />
    </Suspense>
  );
}
