import { entryNodeId, getNode } from "./content";
import type {
  AdvanceByFlag,
  ContentFile,
  EngineState,
  FlagValue,
  PlayerView,
  StoryChoice,
  StoryLine,
  StoryNode,
} from "./types";
import { STORY_PASS_MONTH } from "./types";

export function createInitialState(source: ContentFile): EngineState {
  return {
    nodeId: entryNodeId(source),
    lineIndex: 0,
    choiceIndex: 0,
    flags: {},
    stats: {},
    tension: 0,
    entitlements: [],
    pendingUnlock: null,
  };
}

export function utterances(node: StoryNode): StoryLine[] {
  const lines: StoryLine[] = [];
  if (node.text) {
    lines.push({
      speaker: node.speaker ?? "narrator",
      text: node.text,
    });
  }
  if (node.lines) {
    lines.push(...node.lines);
  }
  return lines;
}

export function flagsMatch(
  flags: Record<string, FlagValue>,
  required?: Record<string, FlagValue>,
): boolean {
  if (!required) return true;
  return Object.entries(required).every(([key, value]) => flags[key] === value);
}

export function visibleChoices(state: EngineState, node: StoryNode): StoryChoice[] {
  return (node.choices ?? []).filter((choice) =>
    flagsMatch(state.flags, choice.requires?.flags),
  );
}

export function isBranchingNode(state: EngineState, node: StoryNode): boolean {
  return visibleChoices(state, node).length >= 2;
}

export function shouldAutoSkip(node: StoryNode): boolean {
  return node.playerVisible === false;
}

export function resolveAdvanceByFlag(
  flags: Record<string, FlagValue>,
  table: AdvanceByFlag,
): string {
  for (const [expr, next] of Object.entries(table)) {
    const sep = expr.indexOf("==");
    if (sep === -1) {
      throw new Error(`invalid advanceByFlag expression: ${expr}`);
    }
    const key = expr.slice(0, sep).trim();
    const value = expr.slice(sep + 2).trim();
    if (String(flags[key] ?? "") === value) {
      return next;
    }
  }
  throw new Error(`advanceByFlag miss for flags ${JSON.stringify(flags)}`);
}

export function resolveAdvance(state: EngineState, node: StoryNode): string | null {
  if (node.advanceByFlag) {
    return resolveAdvanceByFlag(state.flags, node.advanceByFlag);
  }
  return node.advance ?? null;
}

function applyFlags(
  state: EngineState,
  patch?: Record<string, FlagValue>,
): EngineState {
  if (!patch) return state;
  return { ...state, flags: { ...state.flags, ...patch } };
}

function applyDelta(state: EngineState, choice: StoryChoice): EngineState {
  const delta = choice.delta;
  if (!delta) return state;
  const stats = { ...state.stats };
  if (delta.stats) {
    for (const [who, change] of Object.entries(delta.stats)) {
      const prev = stats[who] ?? { affection: 0, desire: 0 };
      stats[who] = {
        affection: prev.affection + (change.affection ?? 0),
        desire: prev.desire + (change.desire ?? 0),
      };
    }
  }
  return {
    ...state,
    stats,
    tension: state.tension + (delta.tension ?? 0),
  };
}

function enterNode(
  state: EngineState,
  source: ContentFile,
  nodeId: string,
): EngineState {
  let next = applyFlags(
    {
      ...state,
      nodeId,
      lineIndex: 0,
      pendingUnlock: null,
    },
    getNode(source, nodeId).setFlags,
  );

  let guard = 0;
  while (shouldAutoSkip(getNode(source, next.nodeId))) {
    guard += 1;
    if (guard > 16) {
      throw new Error("advanceByFlag loop");
    }
    const hidden = getNode(source, next.nodeId);
    const dest = resolveAdvance(next, hidden);
    if (!dest) break;
    next = applyFlags(
      { ...next, nodeId: dest, lineIndex: 0 },
      getNode(source, dest).setFlags,
    );
  }

  return next;
}

/** Click the current sentence: next line, or follow `advance` / `advanceByFlag`. */
export function advance(state: EngineState, source: ContentFile): EngineState {
  if (state.pendingUnlock) return state;

  const node = getNode(source, state.nodeId);
  if (node.type === "settle") return state;

  const lines = utterances(node);
  if (state.lineIndex < Math.max(lines.length - 1, 0)) {
    return { ...state, lineIndex: state.lineIndex + 1 };
  }

  if (visibleChoices(state, node).length > 0) {
    return state;
  }

  const dest = resolveAdvance(state, node);
  if (!dest) return state;
  return enterNode(state, source, dest);
}

export function takeChoice(
  state: EngineState,
  source: ContentFile,
  choice: StoryChoice,
): EngineState {
  const node = getNode(source, state.nodeId);
  const bump = isBranchingNode(state, node) ? 1 : 0;
  const afterPick = applyDelta(
    applyFlags(
      {
        ...state,
        choiceIndex: state.choiceIndex + bump,
        pendingUnlock: null,
      },
      choice.setFlags,
    ),
    choice,
  );
  return enterNode(afterPick, source, choice.next);
}

export function selectChoice(
  state: EngineState,
  source: ContentFile,
  choiceId: string,
): EngineState {
  const node = getNode(source, state.nodeId);
  const choice = visibleChoices(state, node).find((item) => item.choiceId === choiceId);
  if (!choice) {
    throw new Error(`unknown or hidden choice: ${choiceId}`);
  }

  if (
    choice.requiresEntitlement &&
    !state.entitlements.includes(choice.requiresEntitlement)
  ) {
    return {
      ...state,
      pendingUnlock: {
        choiceId: choice.choiceId,
        sku: choice.cta ?? choice.requiresEntitlement,
      },
    };
  }

  return takeChoice(state, source, choice);
}

/** Grant the SKU (DEV fake unlock) and immediately follow the locked choice. */
export function unlockNext(
  state: EngineState,
  source: ContentFile,
  sku = STORY_PASS_MONTH,
): EngineState {
  const entitlements = state.entitlements.includes(sku)
    ? state.entitlements
    : [...state.entitlements, sku];
  const unlocked: EngineState = { ...state, entitlements };

  if (!state.pendingUnlock) {
    return unlocked;
  }

  const node = getNode(source, unlocked.nodeId);
  const choice = visibleChoices(unlocked, node).find(
    (item) => item.choiceId === state.pendingUnlock?.choiceId,
  );
  if (!choice) {
    return { ...unlocked, pendingUnlock: null };
  }
  return takeChoice(unlocked, source, choice);
}

export function getView(state: EngineState, source: ContentFile): PlayerView {
  const node = getNode(source, state.nodeId);
  const lines = utterances(node);
  const line = lines[Math.min(state.lineIndex, Math.max(lines.length - 1, 0))] ?? null;
  const choices = visibleChoices(state, node);
  const onLastLine = lines.length === 0 || state.lineIndex >= lines.length - 1;

  return {
    node,
    line,
    lineIndex: state.lineIndex,
    lineCount: lines.length,
    choiceIndex: state.choiceIndex,
    showingChoices: node.type !== "settle" && onLastLine && choices.length > 0,
    choices,
    pendingUnlock: state.pendingUnlock,
    settle: node.type === "settle",
    gate: node.gate,
  };
}

export function canClickAdvance(state: EngineState, source: ContentFile): boolean {
  if (state.pendingUnlock) return false;
  const view = getView(state, source);
  if (view.settle) return false;
  if (view.showingChoices) {
    return view.lineIndex < view.lineCount - 1;
  }
  return true;
}
