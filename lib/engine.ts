import { countsTowardChoiceIndex } from "./choice-index";
import { getNode, route, type CompiledRoute } from "./content";
import { flagMatches, matchFlagExpr } from "./flag-expr";
import { isWallGate, isWallSku, SKU_CHAPTER_UNLOCK, SKU_EDGE_LOCK } from "./paywall-copy";
import { SKU_STORY_PASS_MONTH } from "./tokens";
import type {
  Beat,
  Choice,
  ContentNode,
  Delta,
  Entitlements,
  FlagValue,
  Flags,
  GameState,
  SelectChoiceResult,
  Stats,
  ViewModel,
} from "./types";

export { flagMatches, matchFlagExpr } from "./flag-expr";

const emptyStats = (): Stats => ({
  mia: { affection: 0, desire: 0 },
  jade: { affection: 0, desire: 0 },
  vanessa: { affection: 0, desire: 0 },
  tension: 0,
});

export function createInitialState(
  entitlements: Entitlements = { story_pass_month: false },
): GameState {
  return {
    nodeId: "",
    beatIndex: 0,
    choiceIndex: 0,
    flags: {},
    stats: emptyStats(),
    entitlements,
    pendingChoiceId: null,
  };
}

export function startGame(
  entitlements: Entitlements = { story_pass_month: false },
  compiled: CompiledRoute = route,
): GameState {
  return enterNode(createInitialState(entitlements), compiled.entryNodeId, compiled);
}

export function getBeats(node: ContentNode): Beat[] {
  const beats: Beat[] = [];
  if (node.text) {
    beats.push({ speaker: node.speaker ?? "narrator", text: node.text });
  }
  if (node.lines) {
    beats.push(...node.lines);
  }
  if (beats.length === 0) {
    beats.push({ speaker: "narrator", text: "" });
  }
  return beats;
}

export function resolveNext(node: ContentNode, flags: Flags): string | null {
  if (node.advanceByFlag) {
    for (const [expr, dest] of Object.entries(node.advanceByFlag)) {
      if (matchFlagExpr(flags, expr)) {
        return dest;
      }
    }
    throw new Error(
      `No advanceByFlag match on ${node.nodeId} (flags=${JSON.stringify(flags)})`,
    );
  }
  return node.advance ?? null;
}

export function applyDelta(stats: Stats, delta?: Delta): Stats {
  if (!delta) return stats;
  const next: Stats = {
    mia: { ...stats.mia },
    jade: { ...stats.jade },
    vanessa: { ...stats.vanessa },
    tension: stats.tension + (delta.tension ?? 0),
  };
  if (delta.stats) {
    for (const who of ["mia", "jade", "vanessa"] as const) {
      const block = delta.stats[who];
      if (!block) continue;
      next[who] = {
        affection: next[who].affection + (block.affection ?? 0),
        desire: next[who].desire + (block.desire ?? 0),
      };
    }
  }
  return next;
}

export function applyFlags(
  flags: Flags,
  patch?: Record<string, FlagValue>,
): Flags {
  if (!patch) return flags;
  return { ...flags, ...patch };
}

export function isChoiceVisible(choice: Choice, flags: Flags): boolean {
  const required = choice.requires?.flags;
  if (!required) return true;
  return Object.entries(required).every(([key, value]) =>
    flagMatches(flags, key, value),
  );
}

export function hasEntitlement(state: GameState, sku: string): boolean {
  const { story_pass_month, edge_lock, chapter_unlock } = state.entitlements;
  if (sku === SKU_STORY_PASS_MONTH) return Boolean(story_pass_month);
  if (sku === SKU_EDGE_LOCK) return Boolean(edge_lock || story_pass_month);
  if (sku === SKU_CHAPTER_UNLOCK) {
    return Boolean(chapter_unlock || story_pass_month || edge_lock);
  }
  return false;
}

function isHiddenNode(node: ContentNode): boolean {
  return node.playerVisible === false;
}

function assertFirstSubWall(
  node: ContentNode,
  choiceIndex: number,
  compiled: CompiledRoute,
): void {
  if (
    !isWallGate(node.gate) &&
    node.gate !== compiled.gateField &&
    node.nodeId !== compiled.firstSubNodeId
  ) {
    return;
  }
  if (choiceIndex > compiled.choiceIndexHardCap) {
    throw new Error(
      `first_sub wall exceeded: choiceIndex ${choiceIndex} > ${compiled.choiceIndexHardCap} at ${node.nodeId}`,
    );
  }
}

export function enterNode(
  state: GameState,
  nodeId: string,
  compiled: CompiledRoute = route,
): GameState {
  let currentId = nodeId;
  let flags = state.flags;
  let hops = 0;

  while (hops++ < 24) {
    const node = getNode(currentId, compiled);
    flags = applyFlags(flags, node.setFlags);
    assertFirstSubWall(node, state.choiceIndex, compiled);

    if (isHiddenNode(node)) {
      const nextId = resolveNext(node, flags);
      if (!nextId) {
        throw new Error(`Hidden node ${node.nodeId} has no next`);
      }
      currentId = nextId;
      continue;
    }

    return {
      ...state,
      nodeId: currentId,
      beatIndex: 0,
      flags,
    };
  }

  throw new Error(`Hidden-node skip overflow at ${nodeId}`);
}

export function view(
  state: GameState,
  compiled: CompiledRoute = route,
): ViewModel {
  const node = getNode(state.nodeId, compiled);
  const beats = getBeats(node);
  const clamped = Math.min(state.beatIndex, beats.length - 1);
  const isLastBeat = clamped >= beats.length - 1;
  const choices =
    isLastBeat && node.choices
      ? node.choices.filter((choice) => isChoiceVisible(choice, state.flags))
      : [];
  const hasLinearNext = Boolean(node.advance || node.advanceByFlag);
  const canClickAdvance =
    choices.length === 0 && (clamped < beats.length - 1 || hasLinearNext);

  return {
    node,
    beat: beats[clamped]!,
    beats,
    isLastBeat,
    choices,
    canClickAdvance,
    isSettle: node.type === "settle",
    isPaywall: isWallGate(node.gate) || node.gate === compiled.gateField,
  };
}

export function clickAdvance(
  state: GameState,
  compiled: CompiledRoute = route,
): GameState {
  const current = view(state, compiled);
  if (current.choices.length > 0 || current.isSettle) {
    return state;
  }
  if (!current.isLastBeat) {
    return { ...state, beatIndex: state.beatIndex + 1 };
  }
  const nextId = resolveNext(current.node, state.flags);
  if (!nextId) {
    return state;
  }
  return enterNode(state, nextId, compiled);
}

export function selectChoice(
  state: GameState,
  choiceId: string,
  compiled: CompiledRoute = route,
): SelectChoiceResult {
  const node = getNode(state.nodeId, compiled);
  const choice = (node.choices ?? []).find((item) => item.choiceId === choiceId);
  if (!choice || !isChoiceVisible(choice, state.flags)) {
    return { ok: false, reason: "invalid", message: `Choice not visible: ${choiceId}` };
  }

  if (choice.requiresEntitlement && !hasEntitlement(state, choice.requiresEntitlement)) {
    return {
      ok: false,
      reason: "locked",
      sku: choice.requiresEntitlement,
      choice,
      state: { ...state, pendingChoiceId: choice.choiceId },
    };
  }

  const nextState: GameState = {
    ...state,
    // ≥2-way branches and the first_sub wall count; continue / advance do not
    choiceIndex: countsTowardChoiceIndex(node, compiled)
      ? state.choiceIndex + 1
      : state.choiceIndex,
    flags: applyFlags(state.flags, choice.setFlags),
    stats: applyDelta(state.stats, choice.delta),
    pendingChoiceId: null,
  };

  return { ok: true, state: enterNode(nextState, choice.next, compiled) };
}

export function withEntitlement(
  state: GameState,
  sku: string,
  granted: boolean,
): GameState {
  if (sku === SKU_STORY_PASS_MONTH || sku === "full_entitle") {
    return {
      ...state,
      entitlements: {
        ...state.entitlements,
        story_pass_month: granted,
        edge_lock: granted,
        chapter_unlock: granted,
      },
    };
  }
  if (sku === SKU_EDGE_LOCK) {
    return {
      ...state,
      entitlements: { ...state.entitlements, edge_lock: granted },
    };
  }
  if (sku === SKU_CHAPTER_UNLOCK) {
    return {
      ...state,
      entitlements: { ...state.entitlements, chapter_unlock: granted },
    };
  }
  if (!isWallSku(sku)) return state;
  return state;
}

/**
 * DEV fake-unlock then continue the locked in-dialogue line in place.
 * 开通后这一句立刻接上，不跳走.
 */
export function unlockNext(
  state: GameState,
  choiceId?: string,
  compiled: CompiledRoute = route,
): SelectChoiceResult {
  const id = choiceId ?? state.pendingChoiceId;
  if (!id) {
    return {
      ok: false,
      reason: "invalid",
      message: "unlockNext: no pending story_pass_month choice",
    };
  }
  const unlocked: GameState = {
    ...withEntitlement(state, SKU_STORY_PASS_MONTH, true),
    pendingChoiceId: null,
  };
  return selectChoice(unlocked, id, compiled);
}

/** @deprecated use unlockNext */
export const unlockAndSelect = unlockNext;

export type PathStep = {
  nodeId: string;
  choiceId?: string;
  choiceIndex: number;
};

export type WalkOptions = {
  stopAtFirstSub?: boolean;
  assumeEntitled?: boolean;
};

/**
 * Exhaustive DFS of player-visible branches. Linear `advance` hops
 * do not increment choiceIndex. Hidden / advanceByFlag nodes are skipped
 * via enterNode.
 */
export function walkAllPaths(
  compiled: CompiledRoute = route,
  options: WalkOptions = {},
): PathStep[][] {
  const stopAtFirstSub = options.stopAtFirstSub ?? true;
  const assumeEntitled = options.assumeEntitled ?? true;
  const paths: PathStep[][] = [];

  const visit = (state: GameState, path: PathStep[]): void => {
    const node = getNode(state.nodeId, compiled);
    const here: PathStep = { nodeId: state.nodeId, choiceIndex: state.choiceIndex };

    if (
      stopAtFirstSub &&
      (isWallGate(node.gate) ||
        node.gate === compiled.gateField ||
        node.nodeId === compiled.firstSubNodeId)
    ) {
      paths.push([...path, here]);
      return;
    }

    if (node.type === "settle" || (!node.choices && !node.advance && !node.advanceByFlag)) {
      paths.push([...path, here]);
      return;
    }

    if (node.choices && node.choices.length > 0) {
      const visible = node.choices.filter((choice) => isChoiceVisible(choice, state.flags));
      for (const choice of visible) {
        if (
          choice.requiresEntitlement &&
          !assumeEntitled &&
          !hasEntitlement(state, choice.requiresEntitlement)
        ) {
          continue;
        }
        const entitled = choice.requiresEntitlement
          ? withEntitlement(state, choice.requiresEntitlement, true)
          : state;
        const result = selectChoice(entitled, choice.choiceId, compiled);
        if (!result.ok) continue;
        visit(result.state, [...path, { ...here, choiceId: choice.choiceId }]);
      }
      return;
    }

    const advanced = clickAdvanceToNextNode(state, compiled);
    visit(advanced, [...path, here]);
  };

  visit(startGame({ story_pass_month: assumeEntitled }, compiled), []);
  return paths;
}

function clickAdvanceToNextNode(
  state: GameState,
  compiled: CompiledRoute,
): GameState {
  let current = state;
  for (let i = 0; i < 32; i++) {
    const before = current;
    current = clickAdvance(current, compiled);
    if (current.nodeId !== before.nodeId) return current;
    if (current.beatIndex === before.beatIndex) return current;
  }
  return current;
}

export function pumpToPrompt(
  state: GameState,
  compiled: CompiledRoute = route,
): GameState {
  let current = state;
  for (let i = 0; i < 32; i++) {
    const snapshot = view(current, compiled);
    if (snapshot.choices.length > 0 || snapshot.isSettle || !snapshot.canClickAdvance) {
      return current;
    }
    const next = clickAdvance(current, compiled);
    if (next.nodeId === current.nodeId && next.beatIndex === current.beatIndex) {
      return current;
    }
    current = next;
  }
  return current;
}

export function pumpBeats(
  state: GameState,
  compiled: CompiledRoute = route,
): GameState {
  let current = state;
  for (let i = 0; i < 16; i++) {
    const snapshot = view(current, compiled);
    if (snapshot.isLastBeat) return current;
    const next = clickAdvance(current, compiled);
    if (next.nodeId === current.nodeId && next.beatIndex === current.beatIndex) {
      return current;
    }
    current = next;
  }
  return current;
}

export function playChoices(
  choiceIds: string[],
  entitlements: Entitlements = { story_pass_month: false },
  compiled: CompiledRoute = route,
  options: { pumpAfter?: boolean } = {},
): GameState {
  let state = pumpToPrompt(startGame(entitlements, compiled), compiled);
  for (const choiceId of choiceIds) {
    state = pumpToPrompt(state, compiled);
    const result = selectChoice(state, choiceId, compiled);
    if (!result.ok) {
      throw new Error(
        `playChoices failed at ${choiceId} on ${state.nodeId}: ${result.reason}`,
      );
    }
    state = result.state;
  }
  if (options.pumpAfter === false) {
    return pumpBeats(state, compiled);
  }
  return pumpToPrompt(state, compiled);
}
