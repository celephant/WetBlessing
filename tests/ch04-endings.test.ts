import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { matchesDenyGlob } from "../lib/allowlist";
import { resolveAssetUrl } from "../lib/assets";
import { compileRoute, content, DEFAULT_CH01_VERSION } from "../lib/content";
import { walkChoiceIndexPaths } from "../lib/choice-index";
import {
  CH04_ENDINGS_PATH,
  CH04_ENDINGS_ROUTE_ID,
  CH04_ENDINGS_VERSION,
  isCh03Pack,
  isCh04Pack,
  resolvePlayRoute,
} from "../lib/dev-packs";
import { tryReadCh04Endings } from "../lib/dev-packs.node";
import { pumpToPrompt, resolveNext, selectChoice, startGame } from "../lib/engine";
import { applySeasonCarry } from "../lib/season-continue";
import type { CompiledRoute, Flags } from "../lib/types";

const root = path.resolve(__dirname, "..");

const BANNED =
  /认领|两条认领|不是雨|没有蒸汽|衣服都是干的|氯，不是雨|账单会来|两张嘴|身体却先认你|选的人不会被扔/;
const FORBIDDEN = /阴茎|阴道|阴蒂|性交|插入|口交|生殖器|高中生|未成年|幼/;

const CH04_WEBPS = [
  "assets/scenes/ch04/S22-mia.webp",
  "assets/scenes/ch04/S22-jade.webp",
  "assets/scenes/ch04/S22-lina.webp",
  "assets/scenes/ch04/S22-rae.webp",
  "assets/scenes/ch04/S23.webp",
  "assets/scenes/ch04/S23-vanessa.webp",
  "assets/scenes/ch04/S23-empty.webp",
  "assets/scenes/ch04/S24-mia.webp",
  "assets/scenes/ch04/S24-jade.webp",
  "assets/scenes/ch04/S24-vanessa.webp",
  "assets/scenes/ch04/S24-crash.webp",
  "assets/scenes/ch04/S24-rae.webp",
  "assets/scenes/ch04/S24-lina.webp",
  "assets/scenes/ch04/S24-reina.webp",
  "assets/scenes/ch04/S24-tail.webp",
] as const;

function spokenHay(file = tryReadCh04Endings(root)!): string {
  return file.stages[0]!.nodes
    .flatMap((node) => [
      node.text ?? "",
      ...(node.lines?.map((line) => line.text) ?? []),
      ...(node.choices?.map((choice) => choice.text) ?? []),
    ])
    .join("\n");
}

/** Real continue: startGame applies the chapter-open node, then the save wins. */
function playFrom(
  compiled: CompiledRoute,
  flags: Flags,
  choiceIds: string[],
  entitlements = { story_pass_month: true, edge_lock: true },
) {
  const visited: string[] = [];
  let state = startGame(entitlements, compiled);
  state = applySeasonCarry(state, { flags, stats: state.stats });
  visited.push(state.nodeId);
  state = pumpToPrompt(state, compiled);
  if (visited.at(-1) !== state.nodeId) visited.push(state.nodeId);
  for (const choiceId of choiceIds) {
    const result = selectChoice(state, choiceId, compiled);
    if (!result.ok) {
      throw new Error(
        `playFrom failed at ${choiceId} on ${state.nodeId}: ${result.reason}`,
      );
    }
    state = result.state;
    if (visited.at(-1) !== state.nodeId) visited.push(state.nodeId);
    state = pumpToPrompt(state, compiled);
    if (visited.at(-1) !== state.nodeId) visited.push(state.nodeId);
  }
  return Object.assign(state, { visited });
}

describe("Ch04 名分 (DEV, not default)", () => {
  it("does not replace default Ch01 bytes", () => {
    expect(DEFAULT_CH01_VERSION).toBe("0.4.8-feel-hot");
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(
      createHash("sha256")
        .update(readFileSync(path.join(root, "content/CONTENT-ch01-free-to-firstsub.json")))
        .digest("hex"),
    ).toBe("3a8d3d7dba49974eb5cacf28ab700c960335066d2384ec7336a6f7ffbf134783");
  });

  it("loads only via /play?content=ch04 and is denied as default", () => {
    const file = tryReadCh04Endings(root);
    expect(file).not.toBeNull();
    expect(file?.contentVersion).toBe(CH04_ENDINGS_VERSION);
    expect(file?.routeId).toBe(CH04_ENDINGS_ROUTE_ID);
    expect(matchesDenyGlob(CH04_ENDINGS_PATH)).toBe(true);
    expect(isCh04Pack("ch04")).toBe(true);
    expect(isCh04Pack("ch04-endings")).toBe(true);
    expect(isCh03Pack("ch04")).toBe(false);
    expect(() =>
      compileRoute(file!, { asDefault: true, sourcePath: CH04_ENDINGS_PATH }),
    ).toThrow(/P-D2 deny/);
    expect(resolvePlayRoute("ch04", null, null, null, null)).toBe("missing-ch04");
    const play = resolvePlayRoute("ch04", null, null, null, file);
    expect(play).not.toBe("missing-ch04");
    if (typeof play === "string") return;
    expect(play.content.contentVersion).toBe(CH04_ENDINGS_VERSION);
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
  });

  it("does not force a Mia sleepover on DEV open without a save", () => {
    const compiled = compileRoute(tryReadCh04Endings(root)!);
    const opened = startGame({ story_pass_month: true, edge_lock: true }, compiled);
    expect(opened.flags.ch04_day).toBe(true);
    expect(opened.flags.ch3_bind).toBe("none");
    expect(opened.flags.edge_sleepover_mia).not.toBe(true);
    expect(compiled.nodes.get("n_ch04_open")?.setFlags).toEqual({
      ch04_day: true,
      ch3_bind: "none",
    });
    const openHay = [
      compiled.nodes.get("n_ch04_open")?.text ?? "",
      ...(compiled.nodes.get("n_ch04_open")?.lines?.map((line) => line.text) ?? []),
    ].join("\n");
    expect(openHay).toMatch(/早晨/);
    expect(openHay).toMatch(/群还没冷/);
    expect(openHay).not.toMatch(/衣服还皱着|肩窝|称呼想好|皱衣/);

    const empty = playFrom(compiled, {}, ["c_s23_ok"]);
    expect(empty.visited).toContain("n_s23_empty");
    expect(empty.visited).not.toContain("n_s22_mia");
    expect(empty.visited).not.toContain("n_s23_mia");
    expect(empty.flags.ending).toBe("end_solo");
    expect(empty.flags.ch3_bind).toBe("none");

    const fold = playFrom(compiled, {}, ["c_s23_dodge"]);
    expect(fold.visited).toContain("n_s23_empty");
    expect(fold.visited).not.toContain("n_s23_mia");
    expect(fold.flags.ending).toBe("end_solo");
    expect(fold.flags.w4_stand).toBe("fold");
  });

  it("routes S22 / S23 / S24 off sleepover, bind none, and Vanessa — never default Mia hallway", () => {
    const compiled = compileRoute(tryReadCh04Endings(root)!);
    const s22 = compiled.nodes.get("n_s22_router")!;
    const s23 = compiled.nodes.get("n_s23_router")!;
    const s24 = compiled.nodes.get("n_s24_router")!;

    expect(s22.advanceByFlag).toMatchObject({
      "edge_sleepover_rae==true": "n_s22_rae",
      "edge_sleepover_lina==true": "n_s22_lina",
      "edge_sleepover_jade==true": "n_s22_jade",
      "edge_sleepover_mia==true": "n_s22_mia",
      "w4_sms_first==vanessa": "n_s23_router",
      default: "n_s23_router",
    });
    expect(s23.advanceByFlag?.default).toBe("n_s23_empty");
    expect(s23.advanceByFlag?.default).not.toBe("n_s23_mia");
    expect(s23.advanceByFlag?.["ch3_bind==none"]).toBe("n_s23_empty");
    expect(s23.assetId).toBe("assets/scenes/ch04/S23-empty.webp");
    expect(s24.advanceByFlag).toMatchObject({
      "w4_stand==fold && edge_sleepover_mia==true": "n_s24_crash",
      "edge_sleepover_mia==true": "n_s24_mia",
      "edge_sleepover_jade==true": "n_s24_jade",
      "edge_sleepover_lina==true": "n_s24_lina",
      "edge_sleepover_rae==true": "n_s24_rae",
      "vanessa_crack==true": "n_s24_vanessa",
      "reina_office_kiss==true": "n_s24_reina",
      default: "n_s24_solo",
    });
    expect(JSON.stringify(s24.advanceByFlag)).not.toMatch(/s22_meet==ok/);
    expect(JSON.stringify(s24.advanceByFlag)).not.toMatch(/w4_sms_first!=vanessa/);

    expect(resolveNext(s22, {})).toBe("n_s23_router");
    expect(resolveNext(s22, { edge_sleepover_mia: true })).toBe("n_s22_mia");
    expect(resolveNext(s22, { edge_sleepover_mia: true, w4_sms_first: "vanessa" })).toBe(
      "n_s22_mia",
    );
    expect(resolveNext(s23, {})).toBe("n_s23_empty");
    expect(resolveNext(s23, { ch3_bind: "none" })).toBe("n_s23_empty");
    expect(resolveNext(s23, { ch3_bind: "mia" })).toBe("n_s23_empty");
    expect(resolveNext(s23, { edge_sleepover_mia: true })).toBe("n_s23_mia");
    expect(resolveNext(s23, { edge_sleepover_mia: true, w4_sms_first: "vanessa" })).toBe(
      "n_s23_mia",
    );
    expect(resolveNext(s23, { ch3_bind: "none", vanessa_crack: true })).toBe("n_s23_vanessa");
    expect(resolveNext(s23, { ch3_bind: "mia", vanessa_crack: true })).toBe("n_s23_vanessa");

    for (const who of ["jade", "lina", "rae"] as const) {
      expect(compiled.nodes.get(`n_s23_${who}`)?.assetId).toBe(
        "assets/scenes/ch04/S23-empty.webp",
      );
      expect(compiled.nodes.get(`n_s22_${who}`)?.assetId).toBe(
        `assets/scenes/ch04/S22-${who}.webp`,
      );
    }
    expect(compiled.nodes.get("n_s23_mia")?.assetId).toBe("assets/scenes/ch04/S23.webp");
    expect(compiled.nodes.get("n_s22_mia")?.assetId).toBe("assets/scenes/ch04/S22-mia.webp");
    expect(compiled.nodes.get("n_s23_empty")?.text).toMatch(/旁边没有她/);

    const skipBed = playFrom(compiled, { ch3_bind: "mia" }, ["c_s23_ok"]);
    expect(skipBed.visited).not.toContain("n_s22_mia");
    expect(skipBed.visited).not.toContain("n_s23_mia");
    expect(skipBed.visited).toContain("n_s23_empty");
    expect(skipBed.flags.ending).toBe("end_solo");

    const vanessaAfterBed = playFrom(
      compiled,
      {
        ch3_bind: "mia",
        edge_sleepover_mia: true,
        vanessa_crack: true,
        w4_sms_first: "vanessa",
      },
      ["c_s22_ok", "c_s23_ok"],
    );
    expect(vanessaAfterBed.visited).toContain("n_s22_mia");
    expect(vanessaAfterBed.visited).toContain("n_s23_mia");
    expect(vanessaAfterBed.visited).not.toContain("n_s23_vanessa");
    expect(vanessaAfterBed.flags.ending).toBe("end_mia");

    const foldAfterBed = playFrom(
      compiled,
      {
        ch3_bind: "mia",
        edge_sleepover_mia: true,
      },
      ["c_s22_ok", "c_s23_dodge"],
    );
    expect(foldAfterBed.visited).toContain("n_s22_mia");
    expect(foldAfterBed.flags.ending).toBe("end_crash");
  });

  it("real continue keeps a Rae sleepover through morning, Troy, and the ending", () => {
    const compiled = compileRoute(tryReadCh04Endings(root)!);
    const rae = playFrom(
      compiled,
      {
        went_with: "rae",
        catch_target: "rae",
        ch3_bind: "rae",
        edge_sleepover_rae: true,
      },
      ["c_s22_ok", "c_s23_ok"],
    );
    expect(rae.visited).toEqual(
      expect.arrayContaining(["n_s22_rae", "n_s23_rae", "n_s24_rae"]),
    );
    expect(rae.nodeId).toBe("n_s24_tail");
    expect(rae.flags.ending).toBe("end_rae");
    expect(rae.flags.ch3_bind).toBe("rae");
    expect(rae.flags.edge_sleepover_mia).not.toBe(true);
  });

  it("must-ship Jade / Vanessa-crack / crash, plus Rae / Lina / Reina when flagged", () => {
    const compiled = compileRoute(tryReadCh04Endings(root)!);

    const jade = playFrom(
      compiled,
      {
        ch3_bind: "jade",
        edge_sleepover_jade: true,
      },
      ["c_s22_ok", "c_s23_ok"],
    );
    expect(jade.visited).toEqual(
      expect.arrayContaining(["n_s22_jade", "n_s23_jade", "n_s24_jade"]),
    );
    expect(jade.nodeId).toBe("n_s24_tail");
    expect(jade.flags.ending).toBe("end_jade");

    const vanessa = playFrom(
      compiled,
      {
        ch3_bind: "none",
        vanessa_crack: true,
        w4_sms_first: "vanessa",
      },
      ["c_s23_ok"],
    );
    expect(vanessa.flags.ending).toBe("end_vanessa");
    expect(vanessa.nodeId).toBe("n_s24_tail");

    const emptyCrash = playFrom(
      compiled,
      {
        ch3_bind: "none",
      },
      ["c_s23_ok"],
    );
    expect(emptyCrash.flags.ending).toBe("end_solo");

    const rae = playFrom(
      compiled,
      {
        ch3_bind: "rae",
        edge_sleepover_rae: true,
      },
      ["c_s22_ok", "c_s23_ok"],
    );
    expect(rae.flags.ending).toBe("end_rae");

    const lina = playFrom(
      compiled,
      {
        ch3_bind: "lina",
        edge_sleepover_lina: true,
      },
      ["c_s22_ok", "c_s23_ok"],
    );
    expect(lina.flags.ending).toBe("end_lina");

    const reina = playFrom(
      compiled,
      {
        ch3_bind: "none",
        reina_office_kiss: true,
      },
      ["c_s23_ok"],
    );
    expect(reina.flags.ending).toBe("end_reina");
  });

  it("speaks ending cards without banned slogans or a Season 2 hook", () => {
    const spoken = spokenHay();
    expect(spoken).toMatch(/笨蛋/);
    expect(spoken).toMatch(/这下他们看清楚了/);
    expect(spoken).toMatch(/我没倒向你。——还没/);
    expect(spoken).toMatch(/他没有答应谁/);
    expect(spoken).toMatch(/该兑现的没有兑现/);
    expect(spoken).not.toMatch(/这一轮 Troy 赢了/);
    expect(spoken).toMatch(/雨巷那晚。Vanessa。我看见你了/);
    expect(spoken).toMatch(/那天夜里。池面一条灯/);
    expect(spoken).toMatch(/几天后，她又把你叫回教員室/);
    expect(spoken).not.toMatch(/这一轮他赢/);
    expect(spoken).not.toMatch(/群里那张门缝，和办公室那张，他都看见了/);
    expect(spoken).toMatch(/隔墙听不见了/);
    expect(spoken).toMatch(/楼是锁的/);
    expect(spoken).toMatch(/我还是你的讲师/);
    expect(spoken).toMatch(/第一部完/);
    expect(spoken).toMatch(/旁边没有她/);
    expect(spoken).toMatch(/别替我答/);
    expect(spoken).toMatch(/这儿没有闪光/);
    expect(spoken).toMatch(/♡|♥/);
    expect(spoken).toMatch(/……/);
    expect(spoken).toMatch(/～/);
    expect(spoken).not.toMatch(/名分还没人给|半边名分/);
    expect(spoken).not.toMatch(/皱衣/);
    expect(spoken).not.toMatch(/这帧/);
    expect(spoken).not.toMatch(/没有下学期/);
    expect(spoken).not.toMatch(/证翻白|证在钩上|证还朝里|那张证/);
    expect(spoken).not.toMatch(/稍后再说/);
    expect(spoken).not.toMatch(BANNED);
    expect(spoken).not.toMatch(FORBIDDEN);
    expect(spoken).not.toMatch(/ぬぷ|ぎち|ずぶ/);

    const file = tryReadCh04Endings(root)!;
    const byId = new Map(file.stages[0]!.nodes.map((node) => [node.nodeId, node]));
    const nodeHay = (id: string) => {
      const node = byId.get(id);
      return [node?.text ?? "", ...(node?.lines?.map((line) => line.text) ?? [])].join("\n");
    };
    const stage1 = [
      "n_ch04_open",
      "n_s23_mia",
      "n_s23_jade",
      "n_s23_lina",
      "n_s23_rae",
      "n_s23_vanessa",
      "n_s23_empty",
      "n_s24_mia",
      "n_s24_jade",
      "n_s24_crash",
      "n_s24_solo",
      "n_s24_tail",
    ];
    for (const id of stage1) {
      expect(nodeHay(id), id).not.toMatch(/♥|♡|～/);
      expect(nodeHay(id), id).not.toMatch(/唔……|哈啊/);
    }
    const stage2 = ["n_s24_vanessa", "n_s24_reina"];
    for (const id of stage2) {
      expect(nodeHay(id), id).toMatch(/……|、/);
      expect(nodeHay(id), id).not.toMatch(/♥|♡|～/);
    }
    expect(nodeHay("n_s24_vanessa")).toMatch(/哈啊|等、/);
    const heat = [
      "n_s22_mia",
      "n_s22_jade",
      "n_s22_lina",
      "n_s22_rae",
      "n_s24_lina",
      "n_s24_rae",
    ];
    for (const id of heat) {
      expect(nodeHay(id), id).toMatch(/唔|哈啊/);
      expect(nodeHay(id), id).toMatch(/……/);
      expect(nodeHay(id), id).toMatch(/♥|♡|～/);
      expect(nodeHay(id), id).toMatch(/热|凉|湿|烫|呼吸|水声|腰|膝|脚|领|床单|快门/);
    }
    expect(nodeHay("n_s22_mia")).toMatch(/不要停|承认你留下来了/);
    expect(spoken).not.toMatch(/魔物|触手|败犬|肮脏的魔物/);
    expect(nodeHay("n_s22_jade") + nodeHay("n_s22_lina") + nodeHay("n_s22_rae")).not.toMatch(
      /是……是你|现在是谁在要你/,
    );
    const buttons = file.stages[0]!.nodes.flatMap((node) =>
      (node.choices ?? []).map((choice) => choice.text),
    ).join("\n");
    expect(buttons).not.toMatch(/♥|♡|～/);
  });

  it("stays under the choiceIndex cap and ships ch04 plates off the Ch01 remap", () => {
    const compiled = compileRoute(tryReadCh04Endings(root)!);
    const paths = walkChoiceIndexPaths(compiled);
    expect(Math.max(...paths.map((p) => p.choiceIndex))).toBeLessThanOrEqual(10);

    for (const rel of CH04_WEBPS) {
      expect(existsSync(path.join(root, "public", rel)), rel).toBe(true);
      expect(resolveAssetUrl(rel)).toBe(`/${rel}`);
    }
    for (const node of compiled.nodes.values()) {
      if (!node.assetId) continue;
      if (node.nodeId === "n_ch04_open" || node.nodeId === "n_s22_router") {
        expect(node.assetId).toBe("assets/scenes/ch03/S21.webp");
        expect(existsSync(path.join(root, "public", node.assetId))).toBe(true);
        continue;
      }
      expect(node.assetId).toMatch(/^assets\/scenes\/ch04\//);
      const url = resolveAssetUrl(node.assetId);
      expect(url.startsWith("/assets/scenes/ch04/")).toBe(true);
      expect(existsSync(path.join(root, "public", url.slice(1))), `${node.nodeId} ${url}`).toBe(
        true,
      );
    }
  });
});
