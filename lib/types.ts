export type SpeakerId = "narrator" | "kai" | "mia" | "jade" | "vanessa" | string;

export type StatBlock = {
  affection?: number;
  desire?: number;
};

export const CAST_STAT_KEYS = [
  "mia",
  "jade",
  "vanessa",
  "rae",
  "lina",
  "reina",
] as const;
export type CastStatKey = (typeof CAST_STAT_KEYS)[number];

export type Delta = {
  stats?: Partial<Record<CastStatKey, StatBlock>>;
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

/**
 * Optional player-presentation hooks (0.4.7-feel may set fx/camera).
 * See docs/scene-presentation.md.
 *
 * transition — when the resolved scene URL / assetId changes:
 *   "fade" | "soft-zoom" | "dip-to-black"
 * camera — same-asset multi-line motion:
 *   "hold" | "kenburns" | "breathe" | "kenburns-right" | "kenburns-left" | "kenburns-up"
 * fx — overlay on the base image:
 *   "none" | "vignette" | "warm-tint" | "soft-light"
 */
export type SceneTransitionName = "fade" | "soft-zoom" | "dip-to-black";
export type SceneCameraName =
  | "hold"
  | "kenburns"
  | "breathe"
  | "kenburns-right"
  | "kenburns-left"
  | "kenburns-up";
export type SceneFxName = "none" | "vignette" | "warm-tint" | "soft-light";

export type ScenePresentationHooks = {
  transition?: SceneTransitionName | string;
  camera?: SceneCameraName | string;
  fx?: SceneFxName | string;
};

export type Line = ScenePresentationHooks & {
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

export type ContentNode = ScenePresentationHooks & {
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
  /** DEV fourweek stitch: settle hops to another stage's entry. */
  nextStageId?: string;
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

export type CompiledRoute = {
  content: ContentFile;
  nodes: Map<string, ContentNode>;
  entryNodeId: string;
  firstSubNodeId: string;
  choiceIndexHardCap: number;
  gateField: string;
};

export type CharacterStats = {
  affection: number;
  desire: number;
};

export type Stats = {
  mia: CharacterStats;
  jade: CharacterStats;
  vanessa: CharacterStats;
  rae: CharacterStats;
  lina: CharacterStats;
  reina: CharacterStats;
  tension: number;
};

export type Flags = Record<string, FlagValue>;

export type ChapterScope = "w1_continue" | "w2_office" | "w3_edge_night";

export type Entitlements = {
  story_pass_month: boolean;
  /** Sibling of first_sub. Local /play full-entitle grants both walls. */
  edge_lock?: boolean;
  /** Unscoped leftover. Not a season pass. Do not treat as all walls. */
  chapter_unlock?: boolean;
  w1_continue?: boolean;
  w2_office?: boolean;
  w3_edge_night?: boolean;
};

export type GameState = {
  nodeId: string;
  beatIndex: number;
  choiceIndex: number;
  flags: Flags;
  stats: Stats;
  entitlements: Entitlements;
  pendingChoiceId: string | null;
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
  state: GameState;
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
