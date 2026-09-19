export type FlagValue = boolean | string | number;
export type Flags = Record<string, FlagValue>;

export type SpeakerId = string;

export type StateDeclaration = {
  type: "boolean" | "enum";
  values?: string[];
  initial: FlagValue;
};

export type StateCondition = {
  state: string;
  equals: FlagValue;
};

export type StoryBeat = {
  id?: string | null;
  speaker: SpeakerId;
  speakerAuthored?: string;
  text: string;
  thought: string | null;
};

export type BeatVariation = {
  when: StateCondition;
  beatIndex: number;
  beat: StoryBeat;
};

export type StoryChoice = {
  id: string;
  text: string;
  target: string;
  effects: Record<string, FlagValue>;
};

export type EndingVariant = {
  id: string;
  title: string;
  when: StateCondition;
  beats: StoryBeat[];
};

export type EndingResolver = {
  variants: EndingVariant[];
  default: { kind: string; message: string };
};

export type NodePresentation = {
  desktopMode: string;
  mobileModeBeforeApproval: string;
  portraitCandidateAssetKey: string | null;
  portraitAssessment: string;
  automaticPortraitSwapEnabled: boolean;
  afterApproval: string;
  animation: string;
  voiceOrSoundAsset: string | null;
};

export type StoryNode = {
  id: string;
  authoringOrder: number;
  sourceSceneId: string;
  sourceSceneNumber: number;
  title: string;
  storyTime: string;
  route: string | null;
  assetKey: string;
  assetPath: string;
  assetSha256: string;
  visibleObservation: string;
  identityReviewStatus: string;
  visualReleaseStatus: string;
  specialReviewNote: string | null;
  heatInventoryTag: boolean;
  extraArmPending?: boolean;
  presentation: NodePresentation;
  requirements: StateCondition[];
  beats: StoryBeat[];
  beatVariations: BeatVariation[];
  onCompleteEffects: Record<string, FlagValue>;
  choices: StoryChoice[];
  next: string | null;
  endingResolver: EndingResolver | null;
};

export type StoryEnding = {
  id: string;
  title: string;
  when: StateCondition;
  terminalNode: string;
};

export type PortraitPair = {
  landscapeId: string;
  portraitId: string;
  reviewStatus: string;
  assessment: string;
  notes: string;
  nodeId: string;
  sourceSceneNumber: number;
  portraitPath: string;
  portraitSha256: string;
  enabled: boolean;
  proposedAfterApproval: string;
  neverSwap?: boolean;
};

export type StoryFile = {
  schemaVersion: number;
  documentType: string;
  storyVersion: string;
  assetManifestVersion: number;
  visualReviewVersion?: string;
  title: string;
  language: string;
  premise: string;
  maturity: Record<string, unknown>;
  casting: Record<string, unknown>;
  entry: string;
  stateDeclarations: Record<string, StateDeclaration>;
  interactionContract: Record<string, unknown>;
  commercial: {
    enabled: boolean;
    points: { enabled: boolean };
    subscription: { enabled: boolean };
    buyout: { enabled: boolean };
    login: { enabled: boolean };
    purchase: { enabled: boolean };
    [key: string]: unknown;
  };
  portraitPolicy: {
    automaticSwapEnabled: boolean;
    actionMismatchNeverSwap: Array<{ landscapeId: string; portraitId: string }>;
    extraArmPendingNodes: string[];
    compositionChangeRetainLandscape: string[];
  };
  nodes: StoryNode[];
  portraitPairs: PortraitPair[];
  endings: StoryEnding[];
};

export type CompiledStory = {
  story: StoryFile;
  nodes: Map<string, StoryNode>;
  entryNodeId: string;
  storyVersion: string;
  assetManifestVersion: number;
};

export type GameState = {
  schemaVersion: number;
  storyVersion: string;
  assetManifestVersion: number;
  nodeId: string;
  beatIndex: number;
  flags: Flags;
};

export type Beat = StoryBeat;

export type ViewModel = {
  node: StoryNode;
  beat: StoryBeat;
  beats: StoryBeat[];
  isLastBeat: boolean;
  choices: StoryChoice[];
  canClickAdvance: boolean;
  isEnding: boolean;
};

export type SelectChoiceOk = {
  ok: true;
  state: GameState;
};

export type SelectChoiceInvalid = {
  ok: false;
  reason: "invalid";
  message: string;
};

export type SelectChoiceResult = SelectChoiceOk | SelectChoiceInvalid;

export type AssetRecord = {
  id: string;
  path: string;
  sha256: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait";
  kind: string;
  duplicateGroup: string | null;
  portraitPair: string | null;
  visualTags: { status: string; values: unknown[] };
  reviewStatus: string;
};

export type AssetManifest = {
  schemaVersion: number;
  images: AssetRecord[];
  pairCandidates?: unknown[];
  supportFiles: Array<{ path: string; sha256: string; bytes: number; mimeType: string }>;
};

/** Leftover SKU flags. Commercial UI is off; kept so archived adapters still typecheck. */
export type Entitlements = {
  story_pass?: boolean;
  story_pass_month?: boolean;
  edge_lock?: boolean;
  chapter_unlock?: boolean;
  w1_continue?: boolean;
  w2_office?: boolean;
  w3_edge_night?: boolean;
};

export type ChapterScope = "w1_continue" | "w2_office" | "w3_edge_night";
export type CastStatKey = "mia" | "jade" | "vanessa" | "rae" | "lina" | "reina";
export const CAST_STAT_KEYS: CastStatKey[] = [
  "mia",
  "jade",
  "vanessa",
  "rae",
  "lina",
  "reina",
];
export type CharacterStats = { affection: number; desire: number };
export type Stats = Record<CastStatKey, CharacterStats> & { tension: number };
export type Delta = { stats?: Partial<Record<CastStatKey, { affection?: number; desire?: number }>>; tension?: number };
export type ArtCue = string | { summary?: string; scene?: string; shot?: string; note?: string };
export type SceneTransitionName = "fade" | "soft-zoom" | "dip-to-black";
export type SceneCameraName = "hold";
export type SceneFxName = "none" | "vignette" | "warm-tint" | "soft-light";
export type ScenePresentationHooks = {
  transition?: SceneTransitionName | string;
  camera?: SceneCameraName | string;
  fx?: SceneFxName | string;
};
export type NodeType = "dialogue" | "settle";
export type ChoiceRequires = { flags?: Record<string, FlagValue> };
export type Line = ScenePresentationHooks & {
  speaker: SpeakerId;
  text: string;
  thought?: string | null;
};
export type Choice = StoryChoice & {
  choiceId: string;
  next: string;
  hint?: string;
  delta?: Delta;
  setFlags?: Record<string, FlagValue>;
  cta?: string;
  gateChoice?: "free" | "subscribe" | "defer";
  requiresEntitlement?: string;
  requires?: ChoiceRequires;
  onLocked?: string;
};
export type ContentNode = StoryNode & {
  nodeId: string;
  type: NodeType;
  speaker?: SpeakerId;
  text?: string;
  assetId?: string;
  artCue?: ArtCue;
  lines?: Line[];
  advance?: string | null;
  advanceByFlag?: Record<string, string>;
  setFlags?: Record<string, FlagValue>;
  gate?: string;
  playerVisible?: boolean;
  nextStageId?: string;
  transition?: SceneTransitionName | string;
  camera?: SceneCameraName | string;
  fx?: SceneFxName | string;
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
  meta: Record<string, unknown> & {
    choiceIndexHardCap: number;
    firstSubNodeId: string;
    gateField: string;
  };
  personas: Record<string, { name: string }>;
  stages: Stage[];
};
export type CompiledRoute = CompiledStory & {
  content: ContentFile;
  firstSubNodeId: string;
  choiceIndexHardCap: number;
  gateField: string;
};
