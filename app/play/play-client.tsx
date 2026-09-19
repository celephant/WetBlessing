"use client";

import { useSearchParams } from "next/navigation";
import { VNPlayer } from "@/components/VNPlayer";

export function PlayClient() {
  const params = useSearchParams();
  const resume = params.get("resume") === "1";
  return <VNPlayer key={resume ? "resume" : "new"} resume={resume} />;
}
