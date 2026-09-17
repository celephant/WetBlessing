import { describe, expect, it } from "vitest";
import { choiceCueFace, inferCueMode, rewriteCue, validateChoiceCue, validateRouteChoiceCues } from "../lib/choice-cue";
import { compileRoute, route } from "../lib/content";
import {
  tryReadCh02Office,
  tryReadCh03Night,
  tryReadCh04Endings,
  tryReadLandingFunnel,
} from "../lib/dev-packs.node";

describe("ChoiceCue mapping and rewrite", () => {
  it("maps existing hint onto cue without renaming story JSON", () => {
    expect(choiceCueFace("进去。屏幕还热着")).toEqual({
      choice: "进去。",
      cue: "屏幕还热着",
      hint: "屏幕还热着",
    });
    expect(
      choiceCueFace({
        choiceId: "c",
        text: "抓住。",
        next: "n",
        hint: "她没躲",
      }),
    ).toEqual({ choice: "抓住。", cue: "她没躲", hint: "她没躲" });
  });

  it("rewrites a long caption into one cut instead of CSS-truncating it", () => {
    expect(rewriteCue("屏幕还热着贴在她身上，她站在那里没有动……")).toBe(
      "屏幕还热着贴在她身上",
    );
    expect(rewriteCue("她被突然抓住以后并没有马上躲开……")).toBe(
      "她被突然抓住以后并没有马上躲开",
    );
    expect(validateChoiceCue({
      choice: "进去。",
      cue: "屏幕还热着贴在她身上，她站在那里没有动……",
      stage: 1,
    }).map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["too-long", "narration"]),
    );
    expect(
      validateChoiceCue({
        choice: "进去。",
        cue: rewriteCue("屏幕还热着贴在她身上，她站在那里没有动"),
        stage: 1,
      }).some((issue) => issue.code === "too-long"),
    ).toBe(false);
    expect(
      validateChoiceCue({
        choice: "抓住。",
        cue: "♥她没躲～",
        stage: 4,
      }).map((issue) => issue.code),
    ).toContain("button-symbol");
    expect(
      validateChoiceCue({
        choice: "进去。",
        cue: "通行证 $8.99",
        stage: 1,
      }).map((issue) => issue.code),
    ).toContain("price");
    expect(inferCueMode("砖凉、小臂却热")).toBe("dissonance");
    expect(inferCueMode("屏幕还热着")).toBe("sensory");
    expect(inferCueMode("「……我上来了」")).toBe("voice");
    expect(inferCueMode("「手拿开」邻桌却听得见")).toBe("mixed");
  });
});

describe("live story packs: ChoiceCue validation", () => {
  it("accepts compressed cues on Ch01–Ch04 and the funnel", () => {
    const packs = [
      route,
      compileRoute(tryReadCh02Office()!),
      compileRoute(tryReadCh03Night()!),
      compileRoute(tryReadCh04Endings()!),
      compileRoute(tryReadLandingFunnel()!),
    ];
    const issues = packs.flatMap((pack) => validateRouteChoiceCues(pack.nodes.values()));
    expect(issues, issues.map((issue) => issue.message).join("\n")).toEqual([]);
  });
});
