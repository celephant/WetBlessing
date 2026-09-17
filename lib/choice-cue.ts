import { splitChoiceFace } from "./choice-label";
import type { Choice, ContentNode } from "./types";

/** Click-promise on the right of a Choice chip. Not a hint, summary, or caption. */
export type CueMode = "voice" | "dissonance" | "sensory" | "bark";
export type IntensityStage = 1 | 2 | 3 | 4;

export type ChoiceCueFace = {
  choice: string;
  cue: string | null;
  /** Alias of `cue` so existing `hint` call sites can map without a schema rename. */
  hint: string | null;
};

export type CueIssue = {
  code:
    | "empty"
    | "newline"
    | "too-long"
    | "repeats-choice"
    | "narration"
    | "mixed-mode"
    | "stage"
    | "button-symbol"
    | "price"
    | "leak"
    | "banned";
  message: string;
};

export const CUE_TARGET_MIN = 3;
/** One spoken hook that still fits a single-line chip. */
export const CUE_SOFT_MAX = 18;
export const CHOICE_ACTION_SOFT_MAX = 10;

/** Hearts and waves never belong on Choice / Cue chips. */
export const BUTTON_FORBIDDEN = /[♥♡～〜]/;
const PRICE_ON_CHIP = /\$|通行证|月卡|¥|￥|\d+\.\d{2}/;
const STAGE_1_TOO_HOT = /哈啊|求你|不要停|弄坏|已经……不可以/;
const DISSONANCE_MARK = /却|明明|不让|没躲|还等|没拉|没换|口是/;
const BARK_MARK = /！|唔|哈啊|呀/;
const UI_CHIP = /下一页|^继续$|^继续。|点一块地|进最终拍|^靠近$/;
export const BANNED_CUE =
  /屏幕还热着|金属凉|池水凉|她还没准|在水里|池水/;
export const COUPLET_CUE = /[凉冷冰][、，].{0,10}却热|[热烫][、，].{0,10}却[凉冷]/;

export function countCueChars(text: string): number {
  return [...text.replace(/\s/g, "")].length;
}

/** Read Choice + Cue as one spoken line for 柯德平. */
export function spokenChipLine(choice: string, cue: string | null): string {
  const bark = choice.replace(/[。]$/, "");
  if (!cue) return bark;
  return `${bark}，${cue}`;
}

export function choiceCueFace(choice: Choice | string): ChoiceCueFace {
  const packed = typeof choice === "string" ? choice : choice.text;
  const split = splitChoiceFace(packed);
  const mapped =
    typeof choice === "object" && choice.hint && choice.hint.trim()
      ? choice.hint.trim()
      : split.hint;
  const cue = mapped || null;
  return { choice: split.bark, cue, hint: cue };
}

/**
 * Mechanical compressor used when a cue fails validation.
 * Does not invent story facts. Authors should still rewrite by hand
 * when the first clause is the wrong promise.
 */
export function rewriteCue(raw: string): string {
  let cue = raw.replace(/\r?\n/g, " ").replace(BUTTON_FORBIDDEN, "").replace(PRICE_ON_CHIP, "");
  cue = cue.replace(/\s+/g, "").trim();
  const sentence = cue.split(/(?<=[。！？])/)[0] ?? cue;
  cue = sentence.replace(/[。…]+$/g, "");
  if (countCueChars(cue) > CUE_SOFT_MAX && cue.includes("，")) {
    cue = (cue.split("，")[0] ?? cue).trim();
  }
  if (countCueChars(cue) > CUE_SOFT_MAX && cue.includes("、")) {
    cue = (cue.split("、")[0] ?? cue).trim();
  }
  return cue;
}

export function inferCueMode(cue: string): CueMode | "mixed" {
  const quoted = /「|」/.test(cue);
  const dissonance = DISSONANCE_MARK.test(cue);
  const bark = BARK_MARK.test(cue);
  const strong = [quoted, dissonance, bark].filter(Boolean).length;
  if (strong > 1) return "mixed";
  if (quoted) return "voice";
  if (dissonance) return "dissonance";
  if (bark) return "bark";
  return "sensory";
}

/**
 * Intensity comes from the next beat, then the current node.
 * Stage only changes language strength, never story facts.
 */
export function inferIntensityStage(
  node: ContentNode,
  choice: Choice,
  next?: ContentNode,
): IntensityStage {
  const ids = `${next?.nodeId ?? ""} ${node.nodeId} ${choice.next}`;
  if (
    /n_s22_|n_s20_|n_pay_02|n_pay_03_yes|n_pay_settle/.test(ids)
  ) {
    return 4;
  }
  if (
    /n_kiss_|n_s19_|n_pay_01|n_s14_kiss|n_s14_lock|n_dorm_steam/.test(ids)
  ) {
    return 3;
  }
  if (
    /n_with_|n_mia_edge|n_s18_|n_s14_ask|n_s14_silk|n_s14_office|n_funnel_08/.test(
      ids,
    )
  ) {
    return 2;
  }
  return 1;
}

function looksLikeNarration(cue: string): boolean {
  const stripped = cue.replace(/[。！？]$/, "");
  const stops = (stripped.match(/[。！？]/g) ?? []).length;
  if (stops >= 1) return true;
  if ((cue.match(/，/g) ?? []).length >= 2) return true;
  return false;
}

function repeatsChoice(choice: string, cue: string): boolean {
  const fold = (value: string) =>
    value.replace(/[「」。！？、…\s]/g, "").replace(/\.{2,}/g, "");
  const a = fold(choice);
  const b = fold(cue);
  if (!a || !b) return false;
  return a === b || b.startsWith(a) || a.startsWith(b);
}

export function validateChoiceCue(input: {
  choice: string;
  cue: string | null;
  stage: IntensityStage;
  nextText?: string;
}): CueIssue[] {
  const issues: CueIssue[] = [];
  const { choice, cue, stage, nextText } = input;
  if (!cue) {
    issues.push({ code: "empty", message: "Choice Cue is empty" });
    return issues;
  }
  if (/\r|\n/.test(cue)) {
    issues.push({ code: "newline", message: "Choice Cue must stay on one line" });
  }
  if (BUTTON_FORBIDDEN.test(choice) || BUTTON_FORBIDDEN.test(cue)) {
    issues.push({
      code: "button-symbol",
      message: "Choice / Cue chips cannot use ♥ ♡ ♥♥ ～ 〜",
    });
  }
  if (PRICE_ON_CHIP.test(choice) || PRICE_ON_CHIP.test(cue)) {
    issues.push({ code: "price", message: "Choice / Cue chips cannot show a price" });
  }
  if (BANNED_CUE.test(choice) || BANNED_CUE.test(cue) || COUPLET_CUE.test(cue) || UI_CHIP.test(cue)) {
    issues.push({
      code: "banned",
      message: "Choice / Cue uses a rejected fragment, couplet, or UI verb",
    });
  }
  if (countCueChars(cue) > CUE_SOFT_MAX) {
    issues.push({
      code: "too-long",
      message: `Cue is ${countCueChars(cue)} chars; rewrite to ≤${CUE_SOFT_MAX}`,
    });
  }
  if (repeatsChoice(choice, cue)) {
    issues.push({ code: "repeats-choice", message: "Cue repeats the Choice" });
  }
  if (looksLikeNarration(cue)) {
    issues.push({
      code: "narration",
      message: "Cue is a full caption, not one next-beat cut",
    });
  }
  if (inferCueMode(cue) === "mixed") {
    issues.push({
      code: "mixed-mode",
      message: "Cue mixes Voice / Dissonance / Bark; keep one job",
    });
  }
  if (stage <= 2 && STAGE_1_TOO_HOT.test(cue)) {
    issues.push({
      code: "stage",
      message: `Stage ${stage} Cue cannot use late-stage heat language`,
    });
  }
  if (nextText && /可回标题|一次性通行证|假开通/.test(cue)) {
    issues.push({ code: "leak", message: "Cue leaks chrome / paywall / title meta" });
  }
  return issues;
}

export function validateRouteChoiceCues(
  nodes: Iterable<ContentNode>,
): Array<CueIssue & { nodeId: string; choiceId: string }> {
  const byId = new Map<string, ContentNode>();
  for (const node of nodes) {
    byId.set(node.nodeId, node);
  }
  const out: Array<CueIssue & { nodeId: string; choiceId: string }> = [];
  for (const node of byId.values()) {
    for (const choice of node.choices ?? []) {
      const face = choiceCueFace(choice);
      const next = byId.get(choice.next);
      const nextText = [next?.text, ...(next?.lines?.map((line) => line.text) ?? [])]
        .filter(Boolean)
        .join("\n");
      const stage = inferIntensityStage(node, choice, next);
      for (const issue of validateChoiceCue({
        choice: face.choice,
        cue: face.cue,
        stage,
        nextText,
      })) {
        out.push({
          ...issue,
          nodeId: node.nodeId,
          choiceId: choice.choiceId,
          message: `${node.nodeId}/${choice.choiceId}: ${issue.message} (${face.choice} › ${face.cue ?? "∅"})`,
        });
      }
    }
  }
  return out;
}
