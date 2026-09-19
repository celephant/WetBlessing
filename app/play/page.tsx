import { Suspense } from "react";
import { PlayClient } from "@/app/play/play-client";

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-void" />}>
      <PlayClient />
    </Suspense>
  );
}
