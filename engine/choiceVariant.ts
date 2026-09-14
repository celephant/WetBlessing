import tokens from "@/content/UI-tokens.json";
import type { StoryChoice } from "./types";

export type ChoiceVariant = "jie" | "yuan" | "duo" | "plain";

export function choiceVariant(choice: StoryChoice): ChoiceVariant {
  const text = choice.text;
  if (text.includes("接招") || text.startsWith("赴 ")) return "jie";
  if (
    choice.gateChoice === "subscribe" ||
    choice.cta === "story_pass_month" ||
    text.includes("圆场")
  ) {
    return "yuan";
  }
  if (text.includes("躲开") || text.startsWith("躲开")) return "duo";
  return "plain";
}

export function choiceBarColor(variant: ChoiceVariant): string | null {
  const key = tokens.choiceVariants[variant as "jie" | "yuan" | "duo"]?.bar;
  if (!key) return null;
  if (key === "hot") return tokens.colors.hot;
  if (key === "gold") return tokens.colors.gold;
  return null;
}
