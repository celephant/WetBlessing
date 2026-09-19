import type { CompiledStory, ContentFile, CompiledRoute, StoryFile, StoryNode } from "./types";
import rawStory from "../content/story.json";

export const STORY_SOURCE_PATH = "content/story.json";
export const STORY_PUBLICATION_PATH = "public/assets/story.json";
export const STORY_VERSION = "tomorrow.1";

export const story = rawStory as unknown as StoryFile;

export function asContentNode(node: StoryNode) {
  return {
    ...node,
    nodeId: node.id,
    type: "dialogue" as const,
    assetId: node.assetKey,
    advance: node.next,
    choices: node.choices.map((choice) => ({
      ...choice,
      choiceId: choice.id,
      next: choice.target,
    })),
  };
}

export function compileStory(file: StoryFile = story): CompiledStory {
  if (file.storyVersion !== STORY_VERSION) {
    throw new Error(`Unsupported storyVersion ${file.storyVersion}`);
  }
  if (file.documentType !== "runtime-story") {
    throw new Error(`Unsupported documentType ${file.documentType}`);
  }
  if (file.commercial?.enabled) {
    throw new Error("Commercial fields must stay disabled");
  }
  const nodes = new Map<string, StoryNode>();
  for (const node of file.nodes) {
    if (nodes.has(node.id)) {
      throw new Error(`Duplicate node id: ${node.id}`);
    }
    nodes.set(node.id, node);
  }
  if (!nodes.has(file.entry)) {
    throw new Error(`Missing entry ${file.entry}`);
  }
  return {
    story: file,
    nodes,
    entryNodeId: file.entry,
    storyVersion: file.storyVersion,
    assetManifestVersion: file.assetManifestVersion,
  };
}

export const compiledStory = compileStory(story);

function contentFileFromStory(file: StoryFile): ContentFile {
  return {
    routeId: "route_tomorrow_1",
    routeTitle: file.title,
    contentVersion: file.storyVersion,
    project: "WetBlessing",
    meta: {
      choiceIndexHardCap: 99,
      firstSubNodeId: "",
      gateField: "",
    },
    personas: {},
    stages: [
      {
        stageId: "stage.tomorrow",
        stageTitle: file.title,
        order: 1,
        entryNodeId: file.entry,
        nodes: file.nodes.map(asContentNode),
      },
    ],
  };
}

export function compileRoute(file: StoryFile = story): CompiledRoute {
  const compiled = compileStory(file);
  return {
    ...compiled,
    content: contentFileFromStory(file),
    firstSubNodeId: "",
    choiceIndexHardCap: 99,
    gateField: "",
  };
}

export const route = compileRoute(story);
export const content = route.content;

export function getNode(nodeId: string, compiled: CompiledStory = compiledStory): StoryNode {
  const node = compiled.nodes.get(nodeId);
  if (!node) {
    throw new Error(`Unknown node: ${nodeId}`);
  }
  return node;
}

export function listNodes(compiled: CompiledStory = compiledStory): StoryNode[] {
  return [...compiled.nodes.values()];
}

export { compiledStory as compiled };
