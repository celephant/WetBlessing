"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { VNPlayer } from "@/components/VNPlayer";

function PlayInner() {
  const params = useSearchParams();
  const resume = params.get("resume") === "1";
  return <VNPlayer resume={resume} />;
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-void" />}>
      <PlayInner />
    </Suspense>
  );
}
