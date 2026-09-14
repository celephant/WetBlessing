import { describe, expect, it } from "vitest";
import { choiceVariant } from "./choiceVariant";
import type { StoryChoice } from "./types";

const choice = (partial: Partial<StoryChoice> & Pick<StoryChoice, "choiceId" | "text" | "next">): StoryChoice =>
  partial;

describe("choiceVariant", () => {
  it("maps 接招 / 圆场 / 躲开 and subscribe CTAs", () => {
    expect(choiceVariant(choice({ choiceId: "a", text: "接招：箱子给我。", next: "x" }))).toBe("jie");
    expect(choiceVariant(choice({ choiceId: "b", text: "圆场：……好。", next: "x" }))).toBe("yuan");
    expect(choiceVariant(choice({ choiceId: "c", text: "躲开：先刷卡进门。", next: "x" }))).toBe("duo");
    expect(
      choiceVariant(
        choice({
          choiceId: "d",
          text: "「刚才不是故意晾你。现在——就我们。」",
          next: "x",
          cta: "story_pass_month",
          gateChoice: "subscribe",
        }),
      ),
    ).toBe("yuan");
  });
});
