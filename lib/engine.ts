import { compiledStory, getNode } from "./content";
import type {
  CompiledStory,
  FlagValue,
  Flags,
  GameState,
  SelectChoiceResult,
  StateCondition,
  StoryBeat,
  StoryNode,
  ViewModel,
} from "./types";

export { STORY_VERSION } from "./content";

function conditionHolds(flags: Flags, condition: StateCondition): boolean {
  return flags[condition.state] === condition.equals;
}

export function initialFlags(compiled: CompiledStory = compiledStory): Flags {
  const flags: Flags = {};
  for (const [key, declaration] of Object.entries(compiled.story.stateDeclarations)) {
    flags[key] = declaration.initial;
  }
  return flags;
}

export function createInitialState(compiled: CompiledStory = compiledStory): GameState {
  return {
    schemaVersion: compiled.story.schemaVersion,
    storyVersion: compiled.storyVersion,
    assetManifestVersion: compiled.assetManifestVersion,
    nodeId: "",
    beatIndex: 0,
    flags: initialFlags(compiled),
  };
}

export function applyEffects(
  flags: Flags,
  patch?: Record<string, FlagValue> | null,
): Flags {
  if (!patch || Object.keys(patch).length === 0) return flags;
  return { ...flags, ...patch };
}

export function assertRequirements(node: StoryNode, flags: Flags): void {
  for (const condition of node.requirements) {
    if (!conditionHolds(flags, condition)) {
      throw new Error(
        `Unmet requirement ${node.id}: ${condition.state}=${JSON.stringify(condition.equals)}`,
      );
    }
  }
}

export function resolveBeats(node: StoryNode, flags: Flags): StoryBeat[] {
  const beats = node.beats.map((beat) => ({ ...beat }));
  const enabled = node.beatVariations.filter((variation) =>
    conditionHolds(flags, variation.when),
  );
  const used = new Set<number>();
  for (const variation of enabled) {
    if (used.has(variation.beatIndex)) {
      throw new Error(`Ambiguous beat replacement ${node.id} @ ${variation.beatIndex}`);
    }
    if (variation.beatIndex < 0 || variation.beatIndex >= beats.length) {
      throw new Error(`Variation index ${node.id} @ ${variation.beatIndex}`);
    }
    used.add(variation.beatIndex);
    beats[variation.beatIndex] = { ...variation.beat };
  }
  if (node.endingResolver) {
    const matches = node.endingResolver.variants.filter((variant) =>
      conditionHolds(flags, variant.when),
    );
    if (matches.length !== 1) {
      throw new Error(node.endingResolver.default.message);
    }
    const variant = matches[0]!;
    if (variant.beats.length !== beats.length) {
      throw new Error(`Ending ${variant.id} must replace ${beats.length} beats`);
    }
    return variant.beats.map((beat) => ({ ...beat }));
  }
  return beats;
}

export function enterNode(
  state: GameState,
  nodeId: string,
  compiled: CompiledStory = compiledStory,
): GameState {
  const node = getNode(nodeId, compiled);
  assertRequirements(node, state.flags);
  return {
    ...state,
    nodeId,
    beatIndex: 0,
  };
}

export function startGame(compiled: CompiledStory = compiledStory): GameState {
  return enterNode(createInitialState(compiled), compiled.entryNodeId, compiled);
}

export function view(
  state: GameState,
  compiled: CompiledStory = compiledStory,
): ViewModel {
  const node = getNode(state.nodeId, compiled);
  const beats = resolveBeats(node, state.flags);
  const clamped = Math.min(state.beatIndex, beats.length - 1);
  const isLastBeat = clamped >= beats.length - 1;
  const choices = isLastBeat ? node.choices : [];
  const canClickAdvance =
    choices.length === 0 &&
    (clamped < beats.length - 1 || Boolean(node.next) || Boolean(node.endingResolver));
  return {
    node,
    beat: beats[clamped]!,
    beats,
    isLastBeat,
    choices,
    canClickAdvance: Boolean(node.endingResolver) && isLastBeat ? false : canClickAdvance,
    isEnding: Boolean(node.endingResolver),
  };
}

function leaveNode(state: GameState, compiled: CompiledStory): GameState {
  const node = getNode(state.nodeId, compiled);
  return {
    ...state,
    flags: applyEffects(state.flags, node.onCompleteEffects),
  };
}

export function clickAdvance(
  state: GameState,
  compiled: CompiledStory = compiledStory,
): GameState {
  const current = view(state, compiled);
  if (current.choices.length > 0) return state;
  if (!current.isLastBeat) {
    return { ...state, beatIndex: state.beatIndex + 1 };
  }
  if (current.isEnding || !current.node.next) return state;
  const after = leaveNode(state, compiled);
  return enterNode(after, current.node.next, compiled);
}

export function selectChoice(
  state: GameState,
  choiceId: string,
  compiled: CompiledStory = compiledStory,
): SelectChoiceResult {
  const current = view(state, compiled);
  const choice = current.choices.find((item) => item.id === choiceId);
  if (!choice) {
    return { ok: false, reason: "invalid", message: `Choice not visible: ${choiceId}` };
  }
  const afterComplete = leaveNode(state, compiled);
  const afterChoice: GameState = {
    ...afterComplete,
    flags: applyEffects(afterComplete.flags, choice.effects),
  };
  return { ok: true, state: enterNode(afterChoice, choice.target, compiled) };
}

export function pumpBeats(
  state: GameState,
  compiled: CompiledStory = compiledStory,
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

export function pumpToPrompt(
  state: GameState,
  compiled: CompiledStory = compiledStory,
): GameState {
  let current = state;
  for (let i = 0; i < 128; i++) {
    const snapshot = view(current, compiled);
    if (snapshot.choices.length > 0 || snapshot.isEnding || !snapshot.canClickAdvance) {
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

export function playChoices(
  choiceIds: string[],
  compiled: CompiledStory = compiledStory,
): GameState {
  let state = pumpToPrompt(startGame(compiled), compiled);
  for (const choiceId of choiceIds) {
    state = pumpToPrompt(state, compiled);
    const result = selectChoice(state, choiceId, compiled);
    if (!result.ok) {
      throw new Error(`playChoices failed at ${choiceId} on ${state.nodeId}: ${result.message}`);
    }
    state = result.state;
  }
  return pumpToPrompt(state, compiled);
}

export type PathResult = {
  ending: string;
  route: FlagValue;
  nodeIds: string[];
  beats: number;
};

export function walkAllPaths(compiled: CompiledStory = compiledStory): PathResult[] {
  const results: PathResult[] = [];

  const visit = (state: GameState, nodeIds: string[], beats: number): void => {
    const node = getNode(state.nodeId, compiled);
    const resolved = resolveBeats(node, state.flags);
    const here = [...nodeIds, node.id];
    const beatCount = beats + resolved.length;
    const after = {
      ...state,
      flags: applyEffects(state.flags, node.onCompleteEffects),
    };
    if (node.endingResolver) {
      const matches = node.endingResolver.variants.filter(
        (variant) => after.flags[variant.when.state] === variant.when.equals,
      );
      if (matches.length !== 1) {
        throw new Error(node.endingResolver.default.message);
      }
      results.push({
        ending: matches[0]!.id,
        route: after.flags["relationship.route"],
        nodeIds: here,
        beats: beatCount,
      });
      return;
    }
    if (node.choices.length > 0) {
      for (const choice of node.choices) {
        const nextFlags = applyEffects(after.flags, choice.effects);
        visit(enterNode({ ...after, flags: nextFlags }, choice.target, compiled), here, beatCount);
      }
      return;
    }
    if (!node.next) {
      throw new Error(`Node ${node.id} has no exit`);
    }
    visit(enterNode(after, node.next, compiled), here, beatCount);
  };

  visit(startGame(compiled), [], 0);
  return results;
}
