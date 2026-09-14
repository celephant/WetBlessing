export type FlagValue = boolean | string;

export type GateChoice = "free" | "subscribe" | "defer";

export interface StatDelta {
  affection?: number;
  desire?: number;
}

export interface ChoiceDelta {
  stats?: Record<string, StatDelta>;
  tension?: number;
}

export interface StoryLine {
  speaker: string;
  text: string;
}

export interface StoryChoice {
  choiceId: string;
  text: string;
  next: string;
  delta?: ChoiceDelta;
  setFlags?: Record<string, FlagValue>;
  cta?: string;
  gateChoice?: GateChoice;
  requiresEntitlement?: string;
  requires?: {
    flags?: Record<string, FlagValue>;
  };
  onLocked?: string;
}

export type AdvanceByFlag = Record<string, string>;

export interface StoryNode {
  nodeId: string;
  type: "dialogue" | "settle";
  speaker?: string;
  text?: string;
  assetId?: string;
  artStatus?: string;
  artCue?: unknown;
  characters?: string[];
  lines?: StoryLine[];
  choices?: StoryChoice[];
  advance?: string;
  advanceByFlag?: AdvanceByFlag;
  playerVisible?: boolean;
  gate?: string;
  setFlags?: Record<string, FlagValue>;
}

export interface Stage {
  stageId: string;
  stageTitle: string;
  order: number;
  entryNodeId: string;
  nodes: StoryNode[];
}

export interface ContentMeta {
  choiceIndexHardCap: number;
  firstSubNodeId: string;
  gateField: string;
  artReady?: string[];
  artPlaceholder?: string[];
}

export interface ContentFile {
  routeId: string;
  routeTitle: string;
  contentVersion: string;
  project: string;
  meta: ContentMeta;
  personas: Record<string, { name: string }>;
  stages: Stage[];
}

export interface PendingUnlock {
  choiceId: string;
  sku: string;
}

export interface EngineState {
  nodeId: string;
  lineIndex: number;
  choiceIndex: number;
  flags: Record<string, FlagValue>;
  stats: Record<string, { affection: number; desire: number }>;
  tension: number;
  entitlements: string[];
  pendingUnlock: PendingUnlock | null;
}

export interface PlayerView {
  node: StoryNode;
  line: StoryLine | null;
  lineIndex: number;
  lineCount: number;
  choiceIndex: number;
  showingChoices: boolean;
  choices: StoryChoice[];
  pendingUnlock: PendingUnlock | null;
  settle: boolean;
  gate: string | undefined;
}

export const STORY_PASS_MONTH = "story_pass_month";
export const FIRST_SUB_GATE = "first_sub";
