export type SpeakerId = "narrator" | "kai" | "mia" | "jade" | "vanessa" | string;

export type StatBlock = {
  affection?: number;
  desire?: number;
};

export type Delta = {
  stats?: {
    mia?: StatBlock;
    jade?: StatBlock;
    vanessa?: StatBlock;
  };
  tension?: number;
};

export type FlagValue = boolean | string | number;

export type ChoiceRequires = {
  flags?: Record<string, FlagValue>;
};

export type Choice = {
  choiceId: string;
  text: string;
  next: string;
  delta?: Delta;
  setFlags?: Record<string, FlagValue>;
  cta?: string;
  gateChoice?: "free" | "subscribe" | "defer";
  requiresEntitlement?: string;
  requires?: ChoiceRequires;
  onLocked?: string;
};

export type Line = {
  speaker: SpeakerId;
  text: string;
};

export type ArtCue =
  | string
  | {
      summary?: string;
      scene?: string;
      shot?: string;
      note?: string;
      characters?: Array<{ id: string; expr?: string; slot?: string }>;
    };

export type NodeType = "dialogue" | "settle";

export type ContentNode = {
  nodeId: string;
  type: NodeType;
  speaker?: SpeakerId;
  text?: string;
  assetId?: string;
  artCue?: ArtCue;
  artStatus?: string;
  characters?: string[];
  lines?: Line[];
  choices?: Choice[];
  advance?: string;
  advanceByFlag?: Record<string, string>;
  setFlags?: Record<string, FlagValue>;
  gate?: string;
  playerVisible?: boolean;
};

export type Stage = {
  stageId: string;
  stageTitle: string;
  order: number;
  entryNodeId: string;
  nodes: ContentNode[];
};

export type ContentFile = {
  routeId: string;
  routeTitle: string;
  contentVersion: string;
  project: string;
  meta: {
    choiceIndexHardCap: number;
    firstSubNodeId: string;
    gateField: string;
    artReady?: string[];
    artPlaceholder?: string[];
    changelog?: string;
    [key: string]: unknown;
  };
  personas: Record<string, { name: string }>;
  stages: Stage[];
};

export type CharacterStats = {
  affection: number;
  desire: number;
};

export type Stats = {
  mia: CharacterStats;
  jade: CharacterStats;
  vanessa: CharacterStats;
  tension: number;
};

export type Flags = Record<string, FlagValue>;

export type Entitlements = {
  story_pass_month: boolean;
};

export type GameState = {
  nodeId: string;
  beatIndex: number;
  choiceIndex: number;
  flags: Flags;
  stats: Stats;
  entitlements: Entitlements;
};

export type Beat = {
  speaker: SpeakerId;
  text: string;
};

export type ViewModel = {
  node: ContentNode;
  beat: Beat;
  beats: Beat[];
  isLastBeat: boolean;
  choices: Choice[];
  canClickAdvance: boolean;
  isSettle: boolean;
  isPaywall: boolean;
};

export type SelectChoiceOk = {
  ok: true;
  state: GameState;
};

export type SelectChoiceLocked = {
  ok: false;
  reason: "locked";
  sku: string;
  choice: Choice;
};

export type SelectChoiceInvalid = {
  ok: false;
  reason: "invalid";
  message: string;
};

export type SelectChoiceResult =
  | SelectChoiceOk
  | SelectChoiceLocked
  | SelectChoiceInvalid;
