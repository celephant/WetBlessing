import { describe, expect, it } from "vitest";
import { compileRoute, content, route } from "../lib/content";
import { walkChoiceIndexPaths } from "../lib/choice-index";
import type { ContentFile, ContentNode } from "../lib/types";

describe("all-path choiceIndex script", () => {
  it("walks every free path to first_sub with wall counted and ≤ 10", () => {
    const paths = walkChoiceIndexPaths(route);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(path.nodes.at(-1)).toBe("n_ch01_first_sub");
      expect(path.sawGate).toBe(true);
      expect(path.choiceIndex).toBeGreaterThan(0);
      expect(path.choiceIndex).toBeLessThanOrEqual(10);
    }
    expect(Math.max(...paths.map((path) => path.choiceIndex))).toBe(6);
  });

  it("compiles default 0.4.8-feel-hot Ch01", () => {
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(() => compileRoute(content)).not.toThrow();
  });
});

function branchNode(
  id: string,
  next: string,
  extras: Partial<ContentNode> = {},
): ContentNode {
  return {
    nodeId: id,
    type: "dialogue",
    text: id,
    choices: [
      { choiceId: `${id}_a`, text: "a", next },
      { choiceId: `${id}_b`, text: "b", next },
    ],
    ...extras,
  };
}

function fixture(nodes: ContentNode[], entry = "n_0"): ContentFile {
  return {
    routeId: "fixture",
    routeTitle: "fixture",
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
        entryNodeId: entry,
        nodes,
      },
    ],
  };
}

describe("choiceIndex compile fail", () => {
  it("fails compile when >10 counted nodes have no gate", () => {
    const nodes: ContentNode[] = [];
    for (let i = 0; i < 11; i++) {
      nodes.push(branchNode(`n_${i}`, i === 10 ? "n_end" : `n_${i + 1}`));
    }
    nodes.push({ nodeId: "n_end", type: "settle", text: "end" });
    expect(() => compileRoute(fixture(nodes))).toThrow(/compile fail/);
  });

  it("fails compile when the wall itself sits past 10", () => {
    const nodes: ContentNode[] = [];
    for (let i = 0; i < 10; i++) {
      nodes.push(branchNode(`n_${i}`, i === 9 ? "n_wall" : `n_${i + 1}`));
    }
    nodes.push(branchNode("n_wall", "n_end", { gate: "first_sub" }));
    nodes.push({ nodeId: "n_end", type: "settle", text: "end" });
    expect(() => compileRoute(fixture(nodes))).toThrow(/compile fail/);
  });

  it("allows a 10-count path that lands on the wall", () => {
    const nodes: ContentNode[] = [];
    for (let i = 0; i < 9; i++) {
      nodes.push(branchNode(`n_${i}`, i === 8 ? "n_wall" : `n_${i + 1}`));
    }
    nodes.push({
      nodeId: "n_wall",
      type: "dialogue",
      text: "wall",
      gate: "first_sub",
      choices: [
        { choiceId: "w_a", text: "a", next: "n_end" },
        { choiceId: "w_b", text: "b", next: "n_end" },
      ],
    });
    nodes.push({ nodeId: "n_end", type: "settle", text: "end" });
    const compiled = compileRoute(fixture(nodes));
    expect(walkChoiceIndexPaths(compiled).every((path) => path.choiceIndex === 10)).toBe(
      true,
    );
  });
});
