import type { StoryNode } from "@/engine/types";

export function cgSrc(node: StoryNode): string | null {
  if (!node.assetId) return null;
  const path = node.assetId.startsWith("/") ? node.assetId : `/${node.assetId}`;
  return path;
}

export function artCueSummary(node: StoryNode): string {
  const cue = node.artCue;
  if (!cue) return node.nodeId;
  if (typeof cue === "string") return cue;
  if (typeof cue === "object" && cue && "summary" in cue) {
    const summary = (cue as { summary?: unknown }).summary;
    if (typeof summary === "string") return summary;
  }
  return node.nodeId;
}

export function speakerLabel(speaker: string | undefined): string {
  if (!speaker || speaker === "narrator") return "";
  const names: Record<string, string> = {
    kai: "Kai",
    mia: "Mia",
    jade: "Jade",
    vanessa: "Vanessa",
  };
  return names[speaker] ?? speaker;
}

export function speakerTone(speaker: string | undefined): string {
  switch (speaker) {
    case "mia":
      return "var(--wb-mia)";
    case "jade":
      return "var(--wb-jade)";
    case "vanessa":
      return "var(--wb-vanessa)";
    case "kai":
      return "var(--wb-mint)";
    default:
      return "var(--wb-mute)";
  }
}
