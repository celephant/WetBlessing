import { describe, expect, it } from "vitest";
import { compiledStory, story } from "../lib/content";
import {
  clickAdvance,
  playChoices,
  pumpToPrompt,
  resolveBeats,
  selectChoice,
  startGame,
  view,
} from "../lib/engine";

describe("tomorrow.1 engine", () => {
  it("starts at the invitation and does not lock a route on first visit", () => {
    const started = startGame();
    expect(started.nodeId).toBe("scene.invitation");
    expect(started.storyVersion).toBe("tomorrow.1");
    expect(started.flags["relationship.route"]).toBe("none");
    expect(started.flags["choice.firstVisit"]).toBe("none");

    const atPrompt = playChoices(["scene.opening.choice.choice.1"]);
    expect(atPrompt.flags["choice.firstVisit"]).toBe("jade");
    expect(atPrompt.flags["relationship.route"]).toBe("none");
  });

  it("replaces conditional beats instead of appending them", () => {
    let state = pumpToPrompt(startGame());
    const picked = selectChoice(state, "scene.opening.choice.choice.1");
    if (!picked.ok) throw new Error(picked.message);
    state = picked.state;
    for (let i = 0; i < 40; i++) {
      if (state.nodeId === "scene.screening.merge") break;
      state = clickAdvance(state);
    }
    expect(state.nodeId).toBe("scene.screening.merge");
    const base = compiledStory.nodes.get("scene.screening.merge")!;
    const resolved = resolveBeats(base, state.flags);
    expect(resolved).toHaveLength(base.beats.length);
    expect(resolved[1]?.text).toContain("单独约你");
  });

  it("locks exclusive romance only at the later relationship choice", () => {
    const jade = playChoices([
      "scene.opening.choice.choice.1",
      "scene.own.words.choice.1",
      "scene.caption.choice.choice.1",
      "scene.choose.relationship.choice.1",
    ]);
    expect(jade.flags["relationship.route"]).toBe("jade");
    expect(jade.nodeId).toBe("scene.jade.date");

    const mia = playChoices([
      "scene.opening.choice.choice.2",
      "scene.own.words.choice.2",
      "scene.caption.choice.choice.2",
      "scene.choose.relationship.choice.2",
    ]);
    expect(mia.flags["relationship.route"]).toBe("mia");
    expect(mia.flags["relationship.jade"]).toBe("acquaintance");
  });

  it("requires consent plus dating/couple for kiss images and clears it after the encounter", () => {
    const atDate = playChoices([
      "scene.opening.choice.choice.1",
      "scene.own.words.choice.1",
      "scene.caption.choice.choice.1",
      "scene.choose.relationship.choice.1",
    ]);
    expect(atDate.nodeId).toBe("scene.jade.date");
    const picked = selectChoice(atDate, "scene.jade.date.choice.1");
    expect(picked.ok).toBe(true);
    if (!picked.ok) return;
    expect(picked.state.nodeId).toBe("scene.jade.pool.kiss");
    expect(picked.state.flags["consent.jadeKiss"]).toBe(true);
    expect(picked.state.flags["relationship.jade"]).toBe("dating");

    let state = picked.state;
    while (state.nodeId === "scene.jade.pool.kiss" || state.nodeId === "scene.jade.pool.stay") {
      state = clickAdvance(state);
    }
    expect(state.flags["consent.jadeKiss"]).toBe(false);
  });

  it("shows thoughts with the owning beat, not as a fourth click", () => {
    const state = startGame();
    const snapshot = view(state);
    expect(snapshot.beats).toHaveLength(2);
    expect(snapshot.beat.thought).toBeNull();
    const second = view(clickAdvance(state));
    expect(second.beat.thought?.startsWith("（")).toBe(true);
    expect(second.beats).toHaveLength(2);
  });

  it("replaces sunset beats with the matching ending", () => {
    let current = playChoices([
      "scene.opening.choice.choice.4",
      "scene.own.words.choice.1",
      "scene.caption.choice.choice.1",
      "scene.choose.relationship.choice.4",
    ]);
    for (let i = 0; i < 80; i++) {
      if (current.nodeId === "scene.sunset.ending") break;
      const snapshot = view(current);
      if (snapshot.choices.length > 0) break;
      current = clickAdvance(current);
    }
    const ending = view(current);
    expect(current.nodeId).toBe("scene.sunset.ending");
    expect(ending.isEnding).toBe(true);
    expect(ending.beats).toHaveLength(2);
    expect(ending.beats.some((beat) => beat.text.includes("自己的作品"))).toBe(true);
  });

  it("does not increment extra beats when a variation matches", () => {
    for (const node of story.nodes) {
      const flags = {
        ...startGame().flags,
        ...(node.route ? { "relationship.route": node.route } : {}),
        ...(node.endingResolver ? { "relationship.route": "self" } : {}),
      };
      const resolved = resolveBeats(node, flags);
      expect(resolved.length).toBe(node.beats.length);
    }
  });

  it("rejects a choice that is not on the current node", () => {
    const state = startGame();
    const result = selectChoice(state, "scene.opening.choice.choice.1");
    expect(result.ok).toBe(false);
  });
});
