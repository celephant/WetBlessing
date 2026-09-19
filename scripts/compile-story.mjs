#!/usr/bin/env node
/**
 * Validate content/story.json, verify original SHA-256, write public/assets/story.json.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storyPath = path.join(root, "content/story.json");
const manifestPath = path.join(root, "content/assets.manifest.json");
const publicStoryPath = path.join(root, "public/assets/story.json");

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

export function validateStory(story, manifest, options = {}) {
  const { checkFiles = true } = options;
  assert(story.storyVersion === "tomorrow.1", `storyVersion must be tomorrow.1, got ${story.storyVersion}`);
  assert(story.documentType === "runtime-story", "documentType must be runtime-story");
  assert(story.schemaVersion === 1, "schemaVersion must be 1");
  assert(!story.commercial?.enabled, "commercial.enabled must stay false");
  assert(!story.commercial?.points?.enabled, "points must stay off");
  assert(!story.commercial?.subscription?.enabled, "subscription must stay off");
  assert(!story.commercial?.buyout?.enabled, "buyout must stay off");
  assert(!story.commercial?.login?.enabled, "login must stay off");
  assert(!story.commercial?.purchase?.enabled, "purchase must stay off");
  assert(!story.portraitPolicy?.automaticSwapEnabled, "portrait auto-swap must stay off");
  assert(!story.interactionContract?.commercialUiEnabled, "commercial UI must stay off");
  assert(!story.interactionContract?.automaticPortraitSwapEnabled, "interaction auto-swap must stay off");

  const nodes = story.nodes;
  assert(nodes.length === 83, `expected 83 nodes, got ${nodes.length}`);
  assert(new Set(nodes.map((n) => n.id)).size === 83, "duplicate node ids");
  assert(new Set(nodes.map((n) => n.assetKey)).size === 83, "duplicate landscape keys");
  assert(story.entry === "scene.invitation", `entry must be scene.invitation, got ${story.entry}`);

  const byId = new Map(nodes.map((n) => [n.id, n]));
  assert(byId.has(story.entry), "missing entry node");

  const declarations = story.stateDeclarations;
  const landscapes = manifest.images.filter((a) => a.kind === "scene" && a.orientation === "landscape");
  assert(landscapes.length === 83, `manifest landscapes ${landscapes.length}`);
  for (const asset of landscapes) {
    assert(
      nodes.some((n) => n.assetKey === asset.id),
      `landscape ${asset.id} has no authored node`,
    );
  }

  const heat = nodes.filter((n) => n.heatInventoryTag);
  assert(heat.length === 22, `heat nodes ${heat.length}`);

  const pairs = story.portraitPairs;
  assert(pairs.length === 64, `portrait pairs ${pairs.length}`);
  assert(new Set(pairs.map((p) => p.portraitId)).size === 63, "unique portraits");
  assert(pairs.every((p) => p.enabled === false), "all portrait pairs must stay disabled");
  const mismatch = pairs.filter((p) => p.assessment === "action-mismatch");
  assert(mismatch.length === 1, "exactly one action-mismatch pair");
  assert(mismatch[0].landscapeId === "asset.image.064", "mismatch landscape");
  assert(mismatch[0].portraitId === "asset.image.100", "mismatch portrait");
  assert(mismatch[0].neverSwap === true, "action-mismatch must never swap");

  const extraArm = story.portraitPolicy.extraArmPendingNodes;
  assert(extraArm.includes("scene.jade.stair.kiss") && extraArm.includes("scene.jade.stair.stay"), "extra-arm pending");
  for (const id of extraArm) {
    assert(byId.get(id)?.extraArmPending === true, `${id} extra-arm must stay pending`);
    assert(byId.get(id)?.identityReviewStatus === "pending", `${id} identity pending`);
  }

  const longTexts = new Set();
  const marker = /拟定|待核/;
  for (const node of nodes) {
    assert(node.beats.length >= 2 && node.beats.length <= 3, `${node.id}: beats 2-3`);
    const exits = [Boolean(node.next), Boolean(node.choices.length), Boolean(node.endingResolver)].filter(Boolean);
    assert(exits.length === 1, `${node.id}: exactly one exit mode`);
    assert(!node.presentation.automaticPortraitSwapEnabled, `${node.id}: auto-swap off`);
    assert(node.presentation.desktopMode === "fullLandscapeContain", `${node.id}: desktop contain`);
    assert(node.presentation.mobileModeBeforeApproval === "fullLandscapeContain", `${node.id}: mobile contain`);
    if (node.presentation.portraitAssessment === "action-mismatch") {
      assert(node.presentation.afterApproval === "retainFullLandscapeContain", `${node.id}: mismatch never swap`);
    }
    const asset = manifest.images.find((a) => a.id === node.assetKey);
    assert(asset, `${node.id}: missing asset ${node.assetKey}`);
    assert(asset.path === node.assetPath, `${node.id}: path drift`);
    assert(asset.sha256 === node.assetSha256, `${node.id}: sha drift`);
    for (const target of [node.next, ...node.choices.map((c) => c.target)].filter(Boolean)) {
      assert(byId.has(target), `${node.id}: unknown target ${target}`);
    }
    for (const choice of node.choices) {
      assert(!marker.test(choice.text), `${choice.id}: player-facing 拟定/待核`);
      checkEffects(choice.effects, declarations, choice.id);
    }
    checkEffects(node.onCompleteEffects, declarations, node.id);
    for (const item of [...node.beats, ...node.beatVariations.map((v) => v.beat)]) {
      assert(!marker.test(item.speaker), `${node.id}: player speaker marker ${item.speaker}`);
      if (item.thought) {
        assert(item.thought.startsWith("（") && item.thought.endsWith("）"), `${node.id}: thought parens`);
      }
      const text = `${item.text}${item.thought ?? ""}`;
      const withoutOnomatopoeia = text.replace(/[（(][^）)]*[）)]/gu, "");
      assert(!/\.{3,}/u.test(text), `${node.id}: ascii ellipsis`);
      assert(!/(?<!…)…(?!…)|…{3,}/u.test(withoutOnomatopoeia), `${node.id}: ellipsis`);
      if (item.text.length >= 18) {
        assert(!longTexts.has(item.text), `${node.id}: duplicate long dialogue`);
        longTexts.add(item.text);
      }
    }
    const variationIndexes = node.beatVariations.map((v) => v.beatIndex);
    for (const variation of node.beatVariations) {
      assert(variation.beatIndex < node.beats.length, `${node.id}: variation index`);
    }
    assert(
      new Set(variationIndexes).size === variationIndexes.length ||
        node.beatVariations.every((v, i, all) =>
          all.filter((other) => other.beatIndex === v.beatIndex).every((other, _, group) => {
            const keys = group.map((g) => `${g.when.state}=${JSON.stringify(g.when.equals)}`);
            return new Set(keys).size === keys.length;
          }),
        ),
      `${node.id}: overlapping variations`,
    );
  }

  for (const ending of story.endings) {
    assert(ending.terminalNode === "scene.sunset.ending", `${ending.id} terminal`);
    assert(byId.has(ending.terminalNode), `${ending.id} missing terminal`);
  }
  assert(story.endings.length === 4, "four endings");

  const sunset = byId.get("scene.sunset.ending");
  assert(sunset?.endingResolver?.variants.length === 4, "sunset variants");
  for (const variant of sunset.endingResolver.variants) {
    assert(variant.beats.length === sunset.beats.length, `${variant.id}: replace same beat count`);
    for (const beat of variant.beats) {
      assert(!marker.test(beat.speaker), `${variant.id}: speaker marker`);
    }
  }

  const choose = byId.get("scene.choose.relationship");
  assert(choose, "missing relationship choice");
  const routes = choose.choices.map((c) => c.effects["relationship.route"]);
  assert(JSON.stringify(routes) === JSON.stringify(["jade", "mia", "vanessa", "self"]), "route options");
  const opening = byId.get("scene.opening.choice");
  for (const choice of opening.choices) {
    assert(!("relationship.route" in (choice.effects ?? {})), "first visit must not lock route");
    assert("choice.firstVisit" in choice.effects, "first visit writes choice.firstVisit");
  }

  const initial = Object.fromEntries(
    Object.entries(declarations).map(([key, decl]) => [key, decl.initial]),
  );
  const pathResults = [];
  const visited = new Set();

  function checkEffects(effects, decls, label) {
    for (const [key, value] of Object.entries(effects ?? {})) {
      const declaration = decls[key];
      assert(declaration, `${label}: undeclared state ${key}`);
      if (declaration.type === "boolean") {
        assert(typeof value === "boolean", `${label}: ${key} boolean`);
      } else {
        assert(declaration.values.includes(value), `${label}: invalid ${key}=${value}`);
      }
    }
  }

  function walk(nodeId, state, seen, beatsRead) {
    const node = byId.get(nodeId);
    assert(node, `unknown jump ${nodeId}`);
    assert(!seen.includes(nodeId), `loop ${nodeId}`);
    for (const condition of node.requirements) {
      assert(
        state[condition.state] === condition.equals,
        `unmet ${nodeId}: ${condition.state}`,
      );
    }
    const enabled = node.beatVariations.filter(
      (variation) => state[variation.when.state] === variation.when.equals,
    );
    assert(
      new Set(enabled.map((v) => v.beatIndex)).size === enabled.length,
      `ambiguous replacement ${nodeId}`,
    );
    visited.add(nodeId);
    const nextState = { ...state, ...node.onCompleteEffects };
    const nextSeen = [...seen, nodeId];
    const nextBeats = beatsRead + node.beats.length;
    if (node.endingResolver) {
      const matches = node.endingResolver.variants.filter(
        (ending) => nextState[ending.when.state] === ending.when.equals,
      );
      assert(matches.length === 1, `ending match ${matches.length}`);
      assert(matches[0].beats.length === node.beats.length, "ending must replace, not append");
      const romantic = ["jade", "mia", "vanessa"].filter(
        (character) => nextState[`relationship.${character}`] === "dating",
      );
      assert(
        romantic.length === (nextState["relationship.route"] === "self" ? 0 : 1),
        "exclusive romance vs companion",
      );
      const consents = Object.entries(nextState).filter(([key]) => key.startsWith("consent."));
      assert(consents.every(([, value]) => value === false), "consent must expire before ending");
      pathResults.push({
        ending: matches[0].id,
        route: nextState["relationship.route"],
        nodes: nextSeen.length,
        beats: nextBeats,
      });
    } else if (node.next) {
      walk(node.next, nextState, nextSeen, nextBeats);
    } else {
      for (const option of node.choices) {
        walk(option.target, { ...nextState, ...option.effects }, nextSeen, nextBeats);
      }
    }
  }

  walk(story.entry, initial, [], 0);
  assert(visited.size === 83, `reachable ${visited.size}/83`);
  assert(new Set(pathResults.map((p) => p.ending)).size === 4, "all endings reachable");
  assert(pathResults.length === 192, `paths ${pathResults.length}`);

  const integrity = [];
  if (checkFiles) {
    for (const asset of [...manifest.images, ...manifest.supportFiles]) {
      const full = path.join(root, "public", asset.path);
      assert(fs.existsSync(full), `missing original ${asset.path}`);
      const digest = createHash("sha256").update(fs.readFileSync(full)).digest("hex");
      if (digest !== asset.sha256) integrity.push(asset.path);
    }
    assert(!integrity.length, `SHA-256 mismatch: ${integrity.join(", ")}`);
  }

  return {
    status: "passed",
    storyVersion: story.storyVersion,
    nodes: nodes.length,
    beats: nodes.reduce((n, node) => n + node.beats.length, 0),
    thoughts: nodes.flatMap((n) => n.beats).filter((b) => b.thought).length,
    choicePoints: nodes.filter((n) => n.choices.length).length,
    choiceOptions: nodes.flatMap((n) => n.choices).length,
    variations: nodes.flatMap((n) => n.beatVariations).length,
    heat: heat.length,
    paths: pathResults.length,
    endings: 4,
    originals: {
      images: manifest.images.length,
      fonts: manifest.supportFiles.length,
      result: "sha256-match",
    },
  };
}

function main() {
  const story = JSON.parse(fs.readFileSync(storyPath, "utf8"));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const report = validateStory(story, manifest, { checkFiles: true });
  fs.mkdirSync(path.dirname(publicStoryPath), { recursive: true });
  const published = `${JSON.stringify(story)}\n`;
  fs.writeFileSync(publicStoryPath, published);
  const source = `${JSON.stringify(JSON.parse(fs.readFileSync(storyPath, "utf8")))}\n`;
  assert(source === published, "source/publication parity failed");
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
