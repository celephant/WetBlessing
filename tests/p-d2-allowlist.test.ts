import { describe, expect, it } from "vitest";
import {
  assertDefaultLoad,
  compileAllowlist,
  matchesDenyGlob,
} from "../lib/allowlist";
import {
  compileRoute,
  content,
  DEFAULT_CH01_PATH,
  DEFAULT_CH01_ROUTE_ID,
  DEFAULT_CH01_VERSION,
} from "../lib/content";
import type { ContentFile } from "../lib/types";

const stub: ContentFile = {
  routeId: "route_kai_ch01",
  routeTitle: "t",
  contentVersion: "0.4.6-midboard",
  project: "WetBlessing",
  meta: {
    choiceIndexHardCap: 10,
    firstSubNodeId: "n_wall",
    gateField: "first_sub",
  },
  personas: { persona_kai_v1: { name: "Kai" } },
  stages: [
    {
      stageId: "stage_ch01_free_to_sub",
      stageTitle: "t",
      order: 1,
      entryNodeId: "n_wall",
      nodes: [
        {
          nodeId: "n_wall",
          type: "dialogue",
          text: "wall",
          gate: "first_sub",
          choices: [
            { choiceId: "a", text: "a", next: "n_end" },
            { choiceId: "b", text: "b", next: "n_end" },
          ],
        },
        { nodeId: "n_end", type: "settle", text: "end" },
      ],
    },
  ],
};

describe("P-D2 compile allowlist", () => {
  it("defaults only 0.4.6-midboard route_kai_ch01", () => {
    expect(compileAllowlist.patch).toBe("P-D2");
    expect(compileAllowlist.defaultAllow).toEqual([
      {
        path: DEFAULT_CH01_PATH,
        contentVersion: DEFAULT_CH01_VERSION,
        routeId: DEFAULT_CH01_ROUTE_ID,
      },
    ]);
    expect(content.contentVersion).toBe("0.4.6-midboard");
    expect(content.routeId).toBe("route_kai_ch01");
    expect(() => assertDefaultLoad(content, DEFAULT_CH01_PATH)).not.toThrow();
  });

  it("denies frozen 黎 / route_li / stage_0 / persona_li globs", () => {
    expect(matchesDenyGlob("content/CONTENT-route_li_foo.json")).toBe(true);
    expect(matchesDenyGlob("CONTENT-stage_0-intro.json")).toBe(true);
    expect(matchesDenyGlob("persona_li_v1")).toBe(true);
    expect(matchesDenyGlob("CONTENT-黎旧包.json")).toBe(true);
    expect(matchesDenyGlob("CONTENT-ch01-free-to-firstsub.json")).toBe(false);
  });

  it("refuses default load of denied route/stage/persona", () => {
    expect(() =>
      assertDefaultLoad(
        { ...stub, routeId: "route_li_old" },
        DEFAULT_CH01_PATH,
      ),
    ).toThrow(/P-D2 deny/);
    expect(() =>
      assertDefaultLoad(
        {
          ...stub,
          stages: [{ ...stub.stages[0]!, stageId: "stage_0_boot" }],
        },
        DEFAULT_CH01_PATH,
      ),
    ).toThrow(/P-D2 deny/);
    expect(() =>
      assertDefaultLoad(
        { ...stub, personas: { persona_li_v1: { name: "x" } } },
        DEFAULT_CH01_PATH,
      ),
    ).toThrow(/P-D2 deny/);
    expect(() =>
      compileRoute({ ...stub, contentVersion: "0.1.0-li" }, { asDefault: true }),
    ).toThrow(/P-D2 deny/);
  });

  it("still compiles non-default test fixtures", () => {
    expect(() => compileRoute({ ...stub, contentVersion: "fixture" })).not.toThrow();
  });
});
