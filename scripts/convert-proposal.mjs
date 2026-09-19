#!/usr/bin/env node
/**
 * Dedicated tomorrow.1 converter.
 * Reads 交付资料/design/proposal.json and writes the runtime source
 * content/story.json. Not authoring.mjs. Does not patch design files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proposalPath = path.join(root, "交付资料/design/proposal.json");
const manuscriptPath = path.join(root, "交付资料/design/MANUSCRIPT.md");
const outPath = path.join(root, "content/story.json");

const REVIEW_SPEAKER = /（拟定）|（延续身份待核）|（身份待核）/g;

function playerSpeaker(raw) {
  return String(raw ?? "").replace(REVIEW_SPEAKER, "").replace(/（[^）]*待核[^）]*）/g, "");
}

function convertBeat(beat) {
  const authored = beat.speaker;
  const speaker = playerSpeaker(authored);
  if (!speaker) {
    throw new Error(`Empty player-facing speaker from ${authored}`);
  }
  if (/拟定|待核/.test(speaker)) {
    throw new Error(`Review marker leaked into player speaker: ${speaker}`);
  }
  return {
    id: beat.id ?? null,
    speaker,
    speakerAuthored: authored,
    text: beat.text,
    thought: beat.thought ?? null,
  };
}

function convertCondition(when) {
  return { state: when.state, equals: when.equals };
}

function assertManuscriptParity(proposal) {
  const ms = fs.readFileSync(manuscriptPath, "utf8");
  const byOrder = new Map(proposal.nodes.map((n) => [n.authoringOrder, n]));
  const nodes = Object.fromEntries(proposal.nodes.map((n) => [n.id, n]));
  const conflicts = [];
  const sec3 = ms.slice(ms.indexOf("## 3."), ms.indexOf("## 4."));
  const rows = [...sec3.matchAll(/^\| (S\d+) \| (\d+) \| (asset\.image\.\d+) \| .+ \| (.+) → (.+) \|$/gm)];
  if (rows.length !== 83) {
    throw new Error(`Manuscript table rows ${rows.length}, expected 83`);
  }
  const sceneLabel = (order) => `S${String(order).padStart(2, "0")}`;
  for (const [, code, , asset, titlePart, targets] of rows) {
    const order = Number(code.slice(1));
    const node = byOrder.get(order);
    if (!node) {
      conflicts.push({ id: code, reason: "manuscript table node missing in proposal" });
      continue;
    }
    if (node.assetKey !== asset) {
      conflicts.push({ id: node.id, reason: `asset ${node.assetKey} vs manuscript ${asset}` });
    }
    if (!titlePart.includes(node.title) && !node.title.includes(titlePart)) {
      conflicts.push({ id: node.id, reason: `title '${node.title}' vs '${titlePart}'` });
    }
    if (node.choices?.length) {
      const expected = node.choices
        .map((c) => sceneLabel(nodes[c.target].authoringOrder))
        .join("／");
      if (!targets.includes(expected) && !expected.includes(targets)) {
        conflicts.push({ id: node.id, reason: `choice targets ${expected} vs ${targets}` });
      }
    } else if (node.endingResolver) {
      if (!targets.includes("结局")) {
        conflicts.push({ id: node.id, reason: `ending targets vs ${targets}` });
      }
    } else if (node.next) {
      const dest = sceneLabel(nodes[node.next].authoringOrder);
      if (!targets.includes(dest)) {
        conflicts.push({ id: node.id, reason: `next ${dest} vs ${targets}` });
      }
    }
  }
  const sec6 = ms.slice(ms.indexOf("## 6."), ms.indexOf("## 7."));
  const heads = [...sec6.matchAll(/^### (S\d+)\s+(.+)$/gm)];
  const blocks = sec6.split(/^### S\d+ /m).slice(1);
  if (heads.length !== 83 || blocks.length !== 83) {
    throw new Error(`Manuscript section 6 scenes ${heads.length}/${blocks.length}`);
  }
  heads.forEach(([ , code, title], index) => {
    const order = Number(code.slice(1));
    const node = byOrder.get(order);
    const block = blocks[index];
    if (!node) {
      conflicts.push({ id: code, reason: "proposal missing for manuscript scene" });
      return;
    }
    if (node.title !== title.trim()) {
      conflicts.push({ id: node.id, reason: `sec6 title ${title} vs ${node.title}` });
    }
    const idMatch = block.match(/节点：`([^`]+)`/);
    if (idMatch && idMatch[1] !== node.id) {
      conflicts.push({ id: node.id, reason: `sec6 id ${idMatch[1]}` });
    }
    const beatHeads = [...block.matchAll(/\*\*第 (\d+) 拍 · (.+?)\*\*\n\n(.+?)(?:\n\n|$)/gs)];
    if (beatHeads.length !== node.beats.length) {
      conflicts.push({
        id: node.id,
        reason: `beat count manuscript ${beatHeads.length} vs ${node.beats.length}`,
      });
    }
    beatHeads.forEach(([, , speaker, rawText], beatIndex) => {
      if (beatIndex >= node.beats.length) return;
      const beat = node.beats[beatIndex];
      let text = rawText.trim();
      if (text.includes("同拍独白")) text = text.split("同拍独白")[0].trim();
      if (speaker !== beat.speaker) {
        conflicts.push({
          id: node.id,
          reason: `beat${beatIndex + 1} speaker manuscript ${speaker} vs ${beat.speaker}`,
        });
      }
      if (text !== beat.text) {
        conflicts.push({ id: node.id, reason: `beat${beatIndex + 1} text mismatch` });
      }
    });
    const choicesMs = [...block.matchAll(/【(.+?)】→/g)].map((m) => m[1]);
    const choicesPj = node.choices.map((c) => c.text);
    if (JSON.stringify(choicesMs) !== JSON.stringify(choicesPj) && (choicesMs.length || choicesPj.length)) {
      conflicts.push({ id: node.id, reason: "choice text mismatch" });
    }
  });
  if (conflicts.length) {
    const ids = [...new Set(conflicts.map((c) => c.id))];
    const detail = conflicts
      .slice(0, 40)
      .map((c) => `- ${c.id}: ${c.reason}`)
      .join("\n");
    throw new Error(
      `MANUSCRIPT and proposal.json conflict. Stopped without filling from old plot.\nNode ids: ${ids.join(", ")}\n${detail}`,
    );
  }
}

const proposal = JSON.parse(fs.readFileSync(proposalPath, "utf8"));
if (proposal.storyDesignVersion !== "tomorrow.1") {
  throw new Error(`Unexpected storyDesignVersion ${proposal.storyDesignVersion}`);
}
assertManuscriptParity(proposal);

const ACTION_MISMATCH = new Set(["asset.image.064", "asset.image.100"]);
const EXTRA_ARM_NODES = ["scene.jade.stair.kiss", "scene.jade.stair.stay"];

function deferConsentClearForVariations(nodes) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const node of nodes) {
    const effects = { ...node.onCompleteEffects };
    let moved = false;
    for (const [key, value] of Object.entries(effects)) {
      if (!key.startsWith("consent.") || value !== false || !node.next) continue;
      const next = byId.get(node.next);
      const needsFlag = next?.beatVariations.some((variation) => variation.when.state === key);
      if (!needsFlag) continue;
      next.onCompleteEffects = { ...next.onCompleteEffects, [key]: false };
      delete effects[key];
      moved = true;
    }
    if (moved) node.onCompleteEffects = effects;
  }
}

const nodes = proposal.nodes.map((node) => {
  const assessment = node.presentation?.portraitAssessment;
  const mismatch =
    ACTION_MISMATCH.has(node.assetKey) ||
    ACTION_MISMATCH.has(node.presentation?.portraitCandidateAssetKey) ||
    assessment === "action-mismatch";
  return {
    id: node.id,
    authoringOrder: node.authoringOrder,
    sourceSceneId: node.sourceSceneId,
    sourceSceneNumber: node.sourceSceneNumber,
    title: node.title,
    storyTime: node.storyTime,
    route: node.route,
    assetKey: node.assetKey,
    assetPath: node.assetPath,
    assetSha256: node.assetSha256,
    visibleObservation: node.visibleObservation,
    identityReviewStatus: node.identityReviewStatus,
    visualReleaseStatus: node.visualReleaseStatus,
    specialReviewNote: node.specialReviewNote,
    heatInventoryTag: node.heatInventoryTag,
    extraArmPending: EXTRA_ARM_NODES.includes(node.id),
    presentation: {
      ...node.presentation,
      automaticPortraitSwapEnabled: false,
      desktopMode: "fullLandscapeContain",
      mobileModeBeforeApproval: "fullLandscapeContain",
      afterApproval: mismatch ? "retainFullLandscapeContain" : node.presentation.afterApproval,
    },
    requirements: node.requirements ?? [],
    beats: node.beats.map(convertBeat),
    beatVariations: (node.beatVariations ?? []).map((variation) => ({
      when: convertCondition(variation.when),
      beatIndex: variation.beatIndex,
      beat: convertBeat(variation.beat),
    })),
    onCompleteEffects: node.onCompleteEffects ?? {},
    choices: (node.choices ?? []).map((choice) => ({
      id: choice.id,
      text: choice.text,
      target: choice.target,
      effects: choice.effects ?? {},
    })),
    next: node.next,
    endingResolver: node.endingResolver
      ? {
          variants: node.endingResolver.variants.map((variant) => ({
            id: variant.id,
            title: variant.title,
            when: convertCondition(variant.when),
            beats: variant.beats.map(convertBeat),
          })),
          default: node.endingResolver.default,
        }
      : null,
  };
});
deferConsentClearForVariations(nodes);

const story = {
  schemaVersion: 1,
  documentType: "runtime-story",
  storyVersion: "tomorrow.1",
  assetManifestVersion: 1,
  visualReviewVersion: proposal.generatedFrom?.visualReviewVersion ?? "visual.1",
  convertedFrom: {
    documentType: proposal.documentType,
    proposalSchemaVersion: proposal.proposalSchemaVersion,
    storyDesignVersion: proposal.storyDesignVersion,
  },
  title: proposal.title,
  language: proposal.language,
  premise: proposal.premise,
  maturity: proposal.maturity,
  casting: {
    ...proposal.casting,
    identityApproval: "pending",
  },
  entry: proposal.entry,
  stateDeclarations: proposal.stateDeclarations,
  interactionContract: {
    ...proposal.interactionContract,
    commercialUiEnabled: false,
    automaticPortraitSwapEnabled: false,
  },
  commercial: {
    ...proposal.commercial,
    enabled: false,
    points: { ...proposal.commercial.points, enabled: false },
    subscription: { ...proposal.commercial.subscription, enabled: false },
    buyout: { ...proposal.commercial.buyout, enabled: false },
    login: { ...proposal.commercial.login, enabled: false },
    purchase: { ...proposal.commercial.purchase, enabled: false },
  },
  portraitPolicy: {
    automaticSwapEnabled: false,
    actionMismatchNeverSwap: [
      { landscapeId: "asset.image.064", portraitId: "asset.image.100" },
    ],
    extraArmPendingNodes: EXTRA_ARM_NODES,
    compositionChangeRetainLandscape: ["asset.image.050", "asset.image.051"],
  },
  nodes,
  portraitPairs: proposal.portraitPairs.map((pair) => ({
    ...pair,
    enabled: false,
    reviewStatus: "pending",
    ...(pair.assessment === "action-mismatch"
      ? { proposedAfterApproval: "retain-landscape", neverSwap: true }
      : {}),
  })),
  endings: proposal.endings,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(story, null, 2)}\n`);
process.stdout.write(`Wrote ${path.relative(root, outPath)} (${story.nodes.length} nodes, storyVersion=${story.storyVersion})\n`);
