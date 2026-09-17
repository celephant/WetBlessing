import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { matchesDenyGlob } from "../lib/allowlist";
import { resolveAssetUrl } from "../lib/assets";
import { compileRoute, content, DEFAULT_CH01_VERSION } from "../lib/content";
import { walkChoiceIndexPaths } from "../lib/choice-index";
import {
  CH03_NIGHT_PATH,
  CH03_NIGHT_ROUTE_ID,
  CH03_NIGHT_VERSION,
  isCh02Pack,
  isCh03Pack,
  isFourweekPack,
  resolvePlayRoute,
} from "../lib/dev-packs";
import { tryReadCh03Night } from "../lib/dev-packs.node";
import {
  playChoices,
  pumpToPrompt,
  resolveNext,
  selectChoice,
  startGame,
  view,
} from "../lib/engine";
import { PAYWALL_EDGE_LOCK, offersEdgeNightSku } from "../lib/paywall-copy";
import { canPlayCh04, seasonContinueTarget, applySeasonCarry } from "../lib/season-continue";
import type { CompiledRoute, Flags } from "../lib/types";

const root = path.resolve(__dirname, "..");

const BANNED =
  /认领|两条认领|不是雨|没有蒸汽|衣服都是干的|氯，不是雨|账单会来|两张嘴|身体却先认你|选的人不会被扔|湿T还贴着/;
const FORBIDDEN = /阴茎|阴道|阴蒂|性交|插入|口交|生殖器|高中生|未成年|幼/;

const CH03_WEBPS = [
  "assets/scenes/ch03/S18.webp",
  "assets/scenes/ch03/S18-jade.webp",
  "assets/scenes/ch03/S18L.webp",
  "assets/scenes/ch03/S18R.webp",
  "assets/scenes/ch03/S18-empty.webp",
  "assets/scenes/ch03/S19.webp",
  "assets/scenes/ch03/S19-jade.webp",
  "assets/scenes/ch03/S19L.webp",
  "assets/scenes/ch03/S19R.webp",
  "assets/scenes/ch03/S20-mia.webp",
  "assets/scenes/ch03/S20-jade.webp",
  "assets/scenes/ch03/S20-lina.webp",
  "assets/scenes/ch03/S20-rae.webp",
  "assets/scenes/ch03/S21.webp",
] as const;

function spokenHay(file = tryReadCh03Night(root)!): string {
  return file.stages[0]!.nodes
    .flatMap((node) => [
      node.text ?? "",
      ...(node.lines?.map((line) => line.text) ?? []),
      ...(node.choices?.map((choice) => choice.text) ?? []),
    ])
    .join("\n");
}

function playFrom(
  compiled: CompiledRoute,
  flags: Flags,
  choiceIds: string[],
  entitlements = { story_pass_month: true, edge_lock: true },
) {
  let state = startGame(entitlements, compiled);
  state = applySeasonCarry(state, { flags, stats: state.stats });
  state = pumpToPrompt(state, compiled);
  for (const choiceId of choiceIds) {
    state = pumpToPrompt(state, compiled);
    const result = selectChoice(state, choiceId, compiled);
    if (!result.ok) {
      throw new Error(
        `playFrom failed at ${choiceId} on ${state.nodeId}: ${result.reason}`,
      );
    }
    state = result.state;
  }
  return pumpToPrompt(state, compiled);
}

describe("Ch03 闭馆夜 (DEV, not default)", () => {
  it("does not replace default Ch01 bytes or Ch02 office pack", () => {
    expect(DEFAULT_CH01_VERSION).toBe("0.4.8-feel-hot");
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(
      createHash("sha256")
        .update(readFileSync(path.join(root, "content/CONTENT-ch01-free-to-firstsub.json")))
        .digest("hex"),
    ).toBe("059d040ed75bee34468332378ef256140e55160c865ecbd9e1a1d2498d19e63a");
    expect(existsSync(path.join(root, "content/CONTENT-ch02-office.json"))).toBe(true);
  });

  it("loads only via /play?content=ch03 and is denied as default", () => {
    const file = tryReadCh03Night(root);
    expect(file).not.toBeNull();
    expect(file?.contentVersion).toBe(CH03_NIGHT_VERSION);
    expect(file?.routeId).toBe(CH03_NIGHT_ROUTE_ID);
    expect(matchesDenyGlob(CH03_NIGHT_PATH)).toBe(true);
    expect(isCh03Pack("ch03")).toBe(true);
    expect(isCh03Pack("ch03-night")).toBe(true);
    expect(isCh03Pack("ch02")).toBe(false);
    expect(isCh02Pack("ch03")).toBe(false);
    expect(isFourweekPack("ch03")).toBe(false);
    expect(() =>
      compileRoute(file!, { asDefault: true, sourcePath: CH03_NIGHT_PATH }),
    ).toThrow(/P-D2 deny/);
    expect(resolvePlayRoute("ch03", null, null, null)).toBe("missing-ch03");
    const play = resolvePlayRoute("ch03", null, null, file);
    expect(play).not.toBe("missing-ch03");
    if (typeof play === "string") return;
    expect(play.content.contentVersion).toBe(CH03_NIGHT_VERSION);
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
  });

  it("rewrites the door wall off the wet-T pack", () => {
    expect(PAYWALL_EDGE_LOCK["zh-CN"].title).toMatch(/缝里是她/);
    expect(PAYWALL_EDGE_LOCK["zh-CN"].body).toMatch(/门把|锁还横着|里面/);
    expect(PAYWALL_EDGE_LOCK["zh-CN"].primaryOwned).toBe("推门进去");
    expect(JSON.stringify(PAYWALL_EDGE_LOCK)).not.toMatch(/湿T|不是上床|明天群会响|稍后再说/);
  });

  it("DEV default with no save is the empty library, not Mia", () => {
    const compiled = compileRoute(tryReadCh03Night(root)!);
    expect(compiled.entryNodeId).toBe("n_ch03_open");
    expect(compiled.firstSubNodeId).toBe("n_s19_mia");
    expect(compiled.nodes.get("n_s19_mia")?.gate).toBe("edge_lock");
    expect(compiled.nodes.get("n_s19_jade")?.gate).toBe("edge_lock");
    expect(compiled.nodes.get("n_s19_lina")?.gate).toBe("edge_lock");
    expect(compiled.nodes.get("n_s19_rae")?.gate).toBe("edge_lock");

    const started = pumpToPrompt(startGame({ story_pass_month: false }, compiled), compiled);
    expect(resolveNext(compiled.nodes.get("n_s18_router")!, {})).toBe("n_s18_empty");
    expect(started.nodeId).toBe("n_s21_vanessa");
    expect(started.flags.ch3_bind).toBe("none");
  });

  it("prefers catch_target over went_with for the closed-library invite", () => {
    const compiled = compileRoute(tryReadCh03Night(root)!);
    expect(
      playFrom(compiled, { went_with: "mia", catch_target: "rae" }, []).nodeId,
    ).toBe("n_s18_rae");
    expect(playFrom(compiled, { catch_target: "mia" }, []).nodeId).toBe("n_s18_mia");
    expect(playFrom(compiled, { went_with: "jade" }, []).nodeId).toBe("n_s18_jade");
  });

  it("Mia catch continues to a playable edge_lock door", () => {
    const compiled = compileRoute(tryReadCh03Night(root)!);
    const locked = playFrom(
      compiled,
      { catch_target: "mia" },
      ["c_s18_ok"],
      { story_pass_month: false },
    );
    expect(locked.nodeId).toBe("n_s19_mia");
    expect(view(locked, compiled).isPaywall).toBe(true);
    const blocked = selectChoice(locked, "c_push", compiled);
    expect(blocked.ok).toBe(false);

    const paid = playFrom(
      compiled,
      { catch_target: "mia" },
      ["c_s18_ok", "c_push", "c_s20_ok", "c_s21_v_ok", "c_sms_bind_mia"],
    );
    expect(paid.nodeId).toBe("n_ch03_settle");
    expect(paid.flags.edge_sleepover_mia).toBe(true);
    expect(paid.flags.vanessa_crack).toBe(true);
    expect(paid.flags.w4_sms_first).toBe("bind");
    expect(paid.flags.ch3_rumor_office).toBe(true);
  });

  it("binds Jade / Rae / Lina per flags and skips the door when bind is none", () => {
    const compiled = compileRoute(tryReadCh03Night(root)!);

    expect(playFrom(compiled, { ch3_bind: "jade" }, []).nodeId).toBe("n_s18_jade");
    expect(playFrom(compiled, { went_with: "rae" }, []).nodeId).toBe("n_s18_rae");
    expect(playFrom(compiled, { ch3_bind: "lina" }, ["c_s18_ok"]).nodeId).toBe("n_s19_lina");

    const none = playFrom(compiled, { ch3_bind: "none" }, []);
    expect(none.nodeId).toBe("n_s21_vanessa");
    expect(none.flags.ch3_bind).toBe("none");
    expect(offersEdgeNightSku(none.flags)).toBe(false);
    expect(compiled.nodes.get("n_s18_empty")?.gate).not.toBe("edge_lock");
    expect(
      compiled.nodes.get("n_s18_empty")?.choices?.some((c) => c.requiresEntitlement),
    ).toBeFalsy();
    for (const node of compiled.nodes.values()) {
      if (none.nodeId === node.nodeId) {
        expect(node.gate).not.toBe("edge_lock");
      }
    }

    const officeOnly = playFrom(
      compiled,
      { catch_target: "mia" },
      ["c_s18_ok"],
      { story_pass_month: false, w2_office: true },
    );
    expect(officeOnly.nodeId).toBe("n_s19_mia");
    expect(selectChoice(officeOnly, "c_push", compiled).ok).toBe(false);

    const jadeNight = playFrom(
      compiled,
      { ch3_bind: "jade" },
      ["c_s18_ok", "c_push", "c_s20_ok", "c_s21_v_ok", "c_sms_sting"],
    );
    expect(jadeNight.flags.edge_sleepover_jade).toBe(true);
    expect(jadeNight.flags.w4_sms_first).toBe("sting");
    expect(jadeNight.nodeId).toBe("n_ch03_settle");
  });

  it("lets a w2-only player who leaves the door reach rumor morning and Ch04", () => {
    const compiled = compileRoute(tryReadCh03Night(root)!);
    const left = playFrom(
      compiled,
      { catch_target: "mia" },
      ["c_s18_ok", "c_leave", "c_s21_v_dodge", "c_sms_sting"],
      { story_pass_month: false, w2_office: true },
    );
    expect(left.nodeId).toBe("n_ch03_settle");
    expect(left.flags.ch3_entered).toBe(false);
    expect(canPlayCh04(left.entitlements, left.flags)).toBe(true);
    expect(seasonContinueTarget("ch03", "n_ch03_settle", left.entitlements, left.flags)?.pack).toBe(
      "ch04",
    );

    const lockedPush = playFrom(
      compiled,
      { catch_target: "mia" },
      ["c_s18_ok"],
      { story_pass_month: false, w2_office: true },
    );
    expect(selectChoice(lockedPush, "c_push", compiled).ok).toBe(false);
    expect(canPlayCh04({ w2_office: true }, { ch3_bind: "mia", ch3_entered: true })).toBe(
      false,
    );
  });

  it("splits rumor morning by whether they entered, and does not let Rae sting herself", () => {
    const compiled = compileRoute(tryReadCh03Night(root)!);
    const rumor = compiled.nodes.get("n_s21_rumor")!;
    expect(rumor.playerVisible).toBe(false);
    expect(resolveNext(rumor, { ch3_entered: true })).toBe("n_s21_rumor_door");
    expect(resolveNext(rumor, { ch3_entered: false })).toBe("n_s21_rumor_skip");
    expect(compiled.nodes.get("n_s21_rumor_skip")?.text).not.toMatch(/门缝/);
    expect(compiled.nodes.get("n_s21_rumor_door")?.text).toMatch(/门缝/);
    expect(compiled.nodes.has("n_s21_sting_rae")).toBe(false);

    const sting = compiled.nodes.get("n_s21_sting_router")!;
    expect(resolveNext(sting, { edge_sleepover_rae: true, stood_up_mia: true })).toBe(
      "n_s21_sting_rae_mia",
    );
    expect(resolveNext(sting, { edge_sleepover_rae: true })).toBe("n_s21_sting_rae_jade");

    const raeMia = playFrom(
      compiled,
      { ch3_bind: "rae", stood_up_mia: true },
      ["c_s18_ok", "c_push", "c_s20_ok"],
    );
    expect(raeMia.flags.ch3_sting).toBe("mia");
    expect(raeMia.flags.ch3_entered).toBe(true);

    const raeJade = playFrom(compiled, { ch3_bind: "rae" }, ["c_s18_ok", "c_push", "c_s20_ok"]);
    expect(raeJade.flags.ch3_sting).toBe("jade");

    const left = playFrom(
      compiled,
      { catch_target: "mia" },
      ["c_s18_ok", "c_leave"],
      { story_pass_month: false, w2_office: true },
    );
    expect(left.flags.ch3_entered).toBe(false);
    expect(left.nodeId).toBe("n_s21_vanessa");
  });

  it("hides 先回 Vanessa unless they heard her on rumor morning", () => {
    const compiled = compileRoute(tryReadCh03Night(root)!);
    const dodged = playFrom(
      compiled,
      { catch_target: "mia" },
      ["c_s18_ok", "c_leave", "c_s21_v_dodge"],
      { story_pass_month: false, w2_office: true },
    );
    expect(dodged.nodeId).toBe("n_s21_threads");
    expect(dodged.flags.vanessa_crack).not.toBe(true);
    expect(view(dodged, compiled).choices.map((c) => c.choiceId)).not.toContain("c_sms_vanessa");

    const heard = playFrom(
      compiled,
      { catch_target: "mia" },
      ["c_s18_ok", "c_leave", "c_s21_v_ok"],
      { story_pass_month: false, w2_office: true },
    );
    expect(heard.flags.vanessa_crack).toBe(true);
    expect(view(heard, compiled).choices.map((c) => c.choiceId)).toContain("c_sms_vanessa");
  });

  it("speaks fluent Chinese without banned slogans, steam-door clones, or Reina sleepover", () => {
    const spoken = spokenHay();
    expect(spoken).not.toMatch(/只是坐/);
    expect(spoken).toMatch(/她没松手/);
    expect(spoken).toMatch(/门缝/);
    expect(spoken).toMatch(/从里面关/);
    expect(spoken).toMatch(/锁该落下/);
    expect(spoken).toMatch(/谁进去了/);
    expect(spoken).toMatch(/我没倒向你|别把我当奖品/);
    expect(spoken).not.toMatch(BANNED);
    expect(spoken).not.toMatch(FORBIDDEN);
    expect(spoken).not.toMatch(/ぬぷ|ぎち|ずぶ/);
    expect(spoken).not.toMatch(/Reina.*(留宿|过夜)|过夜.*Reina/);
    expect(spoken).not.toMatch(/湿T/);
    const file = tryReadCh03Night(root)!;
    const sleepoverKeys = file.stages[0]!.nodes.flatMap((node) =>
      Object.keys(node.setFlags ?? {}).concat(
        ...(node.choices ?? []).map((choice) => Object.keys(choice.setFlags ?? {})),
      ),
    );
    expect(sleepoverKeys.some((key) => key.startsWith("edge_sleepover_reina"))).toBe(
      false,
    );
  });

  it("stays under the choiceIndex cap and ships ch03 plates off the Ch01 remap", () => {
    const compiled = compileRoute(tryReadCh03Night(root)!);
    const paths = walkChoiceIndexPaths(compiled);
    expect(Math.max(...paths.map((p) => p.choiceIndex))).toBeLessThanOrEqual(10);

    for (const rel of CH03_WEBPS) {
      expect(existsSync(path.join(root, "public", rel)), rel).toBe(true);
      expect(resolveAssetUrl(rel)).toBe(`/${rel}`);
    }
    for (const node of compiled.nodes.values()) {
      if (!node.assetId) continue;
      expect(node.assetId).toMatch(/^assets\/scenes\/ch03\//);
      const url = resolveAssetUrl(node.assetId);
      expect(url.startsWith("/assets/scenes/ch03/")).toBe(true);
      expect(existsSync(path.join(root, "public", url.slice(1))), `${node.nodeId} ${url}`).toBe(
        true,
      );
    }
  });
});
