import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { chapterAssetAliases } from "../lib/assets";
import { compileRoute, content, DEFAULT_CH01_PATH, DEFAULT_CH01_VERSION, getNode } from "../lib/content";
import { selectChoice, startGame } from "../lib/engine";
import { showsPassChip } from "../lib/choice-variant";
import type { ContentFile, ContentNode } from "../lib/types";

describe("P-D1 engine surface", () => {
  it("defaults Ch01 to 0.4.8-feel-hot at the canonical path", () => {
    expect(DEFAULT_CH01_PATH).toBe("content/CONTENT-ch01-free-to-firstsub.json");
    expect(DEFAULT_CH01_VERSION).toBe("0.4.8-feel-hot");
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    const linked = JSON.parse(
      readFileSync(path.resolve(__dirname, "../src/content/chapters/ch01.json"), "utf8"),
    ) as ContentFile;
    expect(linked.contentVersion).toBe("0.4.8-feel-hot");
    expect(linked.routeId).toBe(content.routeId);
  });

  it("wires advance, advanceByFlag, first_sub-on-dialogue, settle, entitlement, chip, cta", () => {
    expect(getNode("n_open").advance).toBe("n_see_both");
    expect(getNode("n_pay_02_router").advanceByFlag).toMatchObject({
      "went_with==mia": "n_pay_02_ot_mia",
      "went_with==lina": "n_pay_02_ot_lina",
      "went_with==rae": "n_pay_02_ot_rae",
    });
    const wall = getNode("n_ch01_first_sub");
    expect(wall.type).toBe("dialogue");
    expect(wall.gate).toBe("first_sub");
    expect(getNode("n_pay_settle").type).toBe("settle");
    const locked = wall.choices?.find((c) => c.choiceId === "c_sub_round_mia");
    expect(locked?.requiresEntitlement).toBe("story_pass_month");
    expect(locked?.onLocked).toBe("show_pass_chip");
    expect(locked?.cta).toBe("story_pass_month");
    expect(showsPassChip(locked!)).toBe(true);
  });

  it("does not increment choiceIndex on a 1-way continue", () => {
    const nodes: ContentNode[] = [
      {
        nodeId: "n_start",
        type: "dialogue",
        text: "go",
        choices: [{ choiceId: "c_cont", text: "continue", next: "n_wall" }],
      },
      {
        nodeId: "n_wall",
        type: "dialogue",
        text: "wall",
        gate: "first_sub",
        choices: [
          { choiceId: "w_a", text: "a", next: "n_end" },
          { choiceId: "w_b", text: "b", next: "n_end" },
        ],
      },
      { nodeId: "n_end", type: "settle", text: "end" },
    ];
    const compiled = compileRoute({
      routeId: "cont",
      routeTitle: "cont",
      contentVersion: "fixture",
      project: "WetBlessing",
      meta: {
        choiceIndexHardCap: 10,
        firstSubNodeId: "n_wall",
        gateField: "first_sub",
      },
      personas: {},
      stages: [
        {
          stageId: "s",
          stageTitle: "s",
          order: 1,
          entryNodeId: "n_start",
          nodes,
        },
      ],
    });
    const start = startGame({ story_pass_month: false }, compiled);
    const result = selectChoice(start, "c_cont", compiled);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.choiceIndex).toBe(0);
    expect(result.state.nodeId).toBe("n_wall");
  });
});

describe("P-D5 asset aliases", () => {
  it("maps paid catch/ot nodes off their nodeIds", () => {
    const aliases = chapterAssetAliases();
    expect(aliases.n_pay_01_catch_mia).toBe(
      "assets/scenes/heat/n_heat_sleep_legs.webp",
    );
    expect(aliases.n_pay_01_catch_jade).toBe(
      "assets/scenes/heat/n_heat_jade_cling.webp",
    );
    expect(aliases.n_pay_02_ot_mia).toBe("assets/scenes/heat/n_heat_pin_mia.webp");
    expect(aliases.n_pay_02_ot_jade).toBe(
      "assets/scenes/heat/n_heat_straddle_jade.webp",
    );
    expect(aliases.n_with_mia).toBe("assets/scenes/heat/S06a.webp");
    expect(aliases.n_reina_monday).toBeUndefined();
    expect(aliases.n_pay_02_ot_rae).toBe("assets/scenes/heat/n_heat_ot_rae.webp");
    expect(aliases.n_pay_03_vanessa).toBe("assets/scenes/heat/S11.webp");
    expect(aliases.n_pay_02_double_empty).toBe("assets/scenes/ch01/n_pay_02_ot_a.webp");
    expect(aliases.n_pay_02_router).toBe("assets/scenes/ch01/n_pay_02_ot_a.webp");
    const doc = readFileSync(
      path.resolve(__dirname, "../docs/ART-assetId-aliases.md"),
      "utf8",
    );
    expect(doc).toContain("n_pay_01_catch_mia");
    expect(doc).toContain("n_pay_01_catch_b.webp");
    expect(doc).toContain("n_pay_02_ot_a.webp");
  });
});
