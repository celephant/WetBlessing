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
import { pumpToPrompt, selectChoice, startGame } from "../lib/engine";
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
    ).toBe("6d6c22c5698b611e4eb0156be41c446724e273e95c7d869b9a51b0350883ce18");
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
    expect(opened.flags.ch3_bind).toBeUndefined();
    expect(opened.flags.edge_sleepover_mia).not.toBe(true);
    expect(compiled.nodes.get("n_ch04_open")?.setFlags).toEqual({ ch04_day: true });

    const empty = playFrom(compiled, {}, ["c_s23_ok"]);
    expect(empty.flags.ending).toBe("end_crash");

    const fold = playFrom(compiled, {}, ["c_s23_dodge"]);
    expect(fold.flags.ending).toBe("end_crash");
    expect(fold.flags.w4_stand).toBe("fold");
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
    expect(emptyCrash.flags.ending).toBe("end_crash");

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
    expect(spoken).toMatch(/半边名分|笨蛋/);
    expect(spoken).toMatch(/这下他们看清楚了/);
    expect(spoken).toMatch(/我没倒向你。——还没/);
    expect(spoken).toMatch(/这一轮 Troy 赢了/);
    expect(spoken).toMatch(/雨巷那晚。Vanessa。我看见你了/);
    expect(spoken).toMatch(/那天夜里。池面一条灯/);
    expect(spoken).toMatch(/几天后，她又把你叫回教員室/);
    expect(spoken).not.toMatch(/这一轮他赢/);
    expect(spoken).not.toMatch(/群里那张门缝，和办公室那张，他都看见了/);
    expect(spoken).toMatch(/隔墙听不见了/);
    expect(spoken).toMatch(/楼是锁的/);
    expect(spoken).toMatch(/我还是你的讲师/);
    expect(spoken).toMatch(/第一部完/);
    expect(spoken).toMatch(/没有下学期/);
    expect(spoken).not.toMatch(BANNED);
    expect(spoken).not.toMatch(FORBIDDEN);
    expect(spoken).not.toMatch(/ぬぷ|ぎち|ずぶ/);
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
