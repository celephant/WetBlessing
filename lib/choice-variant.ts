import type { Choice } from "./types";

export type ChoiceVariant = "jie" | "yuan" | "duo" | "pass" | "ghost" | "plain";

export function choiceVariant(choice: Choice): ChoiceVariant {
  if (choice.gateChoice === "subscribe" || choice.cta === "story_pass_month") {
    return "pass";
  }
  if (choice.gateChoice === "defer") return "ghost";
  const text = choice.text;
  if (text.includes("接招") || text.startsWith("赴 ")) return "jie";
  if (text.includes("圆场")) return "yuan";
  if (
    text.includes("躲开") ||
    text.includes("离开") ||
    text.includes("已读") ||
    text.includes("「忙。」")
  ) {
    return "duo";
  }
  return "plain";
}

export function variantBarClass(variant: ChoiceVariant): string {
  switch (variant) {
    case "jie":
      return "bg-hot";
    case "yuan":
    case "pass":
      return "bg-gold";
    default:
      return "bg-transparent";
  }
}
