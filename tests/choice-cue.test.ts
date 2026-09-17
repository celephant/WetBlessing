import { describe, expect, it } from "vitest";
import {
  choiceCueFace,
  inferCueMode,
  rewriteCue,
  spokenChipLine,
  validateChoiceCue,
  validateRouteChoiceCues,
} from "../lib/choice-cue";
import { compileRoute, route } from "../lib/content";
import {
  tryReadCh02Office,
  tryReadCh03Night,
  tryReadCh04Endings,
  tryReadLandingFunnel,
} from "../lib/dev-packs.node";

describe("ChoiceCue mapping and rewrite", () => {
  it("maps existing hint onto cue without renaming story JSON", () => {
    expect(choiceCueFace("进去。她没叫你，按住她腰")).toEqual({
      choice: "进去。",
      cue: "她没叫你，按住她腰",
      hint: "她没叫你，按住她腰",
    });
    expect(
      choiceCueFace({
        choiceId: "c",
        text: "抓住。",
        next: "n",
        hint: "把她的手拉上来",
      }),
    ).toEqual({ choice: "抓住。", cue: "把她的手拉上来", hint: "把她的手拉上来" });
    expect(spokenChipLine("进去。", "她没叫你，按住她腰")).toBe(
      "进去，她没叫你，按住她腰",
    );
  });

  it("rewrites a long caption into one cut instead of CSS-truncating it", () => {
    expect(rewriteCue("屏幕还热着贴在她身上，她站在那里没有动……")).toBe(
      "屏幕还热着贴在她身上",
    );
    expect(rewriteCue("她被突然抓住以后并没有马上躲开……")).toBe(
      "她被突然抓住以后并没有马上躲开",
    );
    expect(
      validateChoiceCue({
        choice: "进去。",
        cue: "屏幕还热着贴在她身上，她站在那里没有动，灯还亮着",
        stage: 1,
      }).map((issue) => issue.code),
    ).toEqual(expect.arrayContaining(["too-long", "narration", "banned"]));
    expect(
      validateChoiceCue({
        choice: "进去。",
        cue: rewriteCue("按住她腰把门带上，她还没抬头看你"),
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
    expect(
      validateChoiceCue({
        choice: "从里面关。",
        cue: "金属凉、后颈却热",
        stage: 1,
      }).map((issue) => issue.code),
    ).toContain("banned");
    expect(inferCueMode("砖凉、小臂却热")).toBe("dissonance");
    expect(inferCueMode("按住她腰")).toBe("sensory");
    expect(inferCueMode("「……我上来了」")).toBe("voice");
    expect(inferCueMode("「手拿开」邻桌却听得见")).toBe("mixed");
  });
});

describe("live story packs: ChoiceCue validation", () => {
  it("accepts spoken Choice+Cue hooks on Ch01–Ch04 and the funnel", () => {
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

  it("keeps live Choice/Cue copy grammatical and next-beat-true", () => {
    const broken =
      /屏幕还热着|金属凉|池水凉|她还没准|砖还凉|她却热|锁骨还湿|点一块地|进最终拍|下一页|她不会装死|她说停了就去翻|拼贴不是夜里|不容抽|不容你退|她不会当众追|灯那条|闪光那条|水边那条|对门那条|锁骨还记着湿|黑丝那层热|裙边掀着一截|唇近了、她还没倒/;
    const packs = [
      route,
      compileRoute(tryReadCh02Office()!),
      compileRoute(tryReadCh03Night()!),
      compileRoute(tryReadCh04Endings()!),
      compileRoute(tryReadLandingFunnel()!),
    ];
    const hay = packs
      .flatMap((pack) => [...pack.nodes.values()])
      .flatMap((node) => (node.choices ?? []).map((choice) => choice.text))
      .join("\n");
    expect(hay).not.toMatch(broken);
    expect(hay).not.toMatch(/在水里|池水/);
    expect(hay).not.toMatch(/凉[、，].{0,10}却热/);
  });
});
