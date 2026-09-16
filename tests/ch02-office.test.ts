import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { matchesDenyGlob } from "../lib/allowlist";
import { resolveAssetUrl } from "../lib/assets";
import { compileRoute, content, DEFAULT_CH01_VERSION } from "../lib/content";
import {
  CH02_OFFICE_PATH,
  CH02_OFFICE_ROUTE_ID,
  CH02_OFFICE_VERSION,
  isCh02Pack,
  isFourweekPack,
  resolvePlayRoute,
} from "../lib/dev-packs";
import { tryReadCh02Office } from "../lib/dev-packs.node";
import { playChoices, pumpToPrompt, selectChoice, startGame, view } from "../lib/engine";
import { walkChoiceIndexPaths } from "../lib/choice-index";

const root = path.resolve(__dirname, "..");

const BANNED =
  /认领|两条认领|不是雨|没有蒸汽|衣服都是干的|氯，不是雨|账单会来|两张嘴|身体却先认你|选的人不会被扔/;
const FORBIDDEN = /阴茎|阴道|阴蒂|性交|插入|口交|生殖器|高中生|未成年|幼/;

const CH02_WEBPS = [
  "assets/scenes/ch02/S13.webp",
  "assets/scenes/ch02/S14.webp",
  "assets/scenes/ch02/S14-lock.webp",
  "assets/scenes/ch02/S14-abort.webp",
  "assets/scenes/ch02/S14-kiss.webp",
] as const;

function spokenHay(file = tryReadCh02Office(root)!): string {
  return file.stages[0]!.nodes
    .flatMap((node) => [
      node.text ?? "",
      ...(node.lines?.map((line) => line.text) ?? []),
      ...(node.choices?.map((choice) => choice.text) ?? []),
    ])
    .join("\n");
}

describe("Ch02 cafeteria + Reina office (DEV, not default)", () => {
  it("does not replace default Ch01 bytes or version", () => {
    expect(DEFAULT_CH01_VERSION).toBe("0.4.8-feel-hot");
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(content.routeId).toBe("route_kai_ch01");
    expect(
      createHash("sha256")
        .update(readFileSync(path.join(root, "content/CONTENT-ch01-free-to-firstsub.json")))
        .digest("hex"),
    ).toBe("59c9740e462c8e40bd71a03b89d8e0cbf26a4dc2e3b892dc9a8b5eeccb8a219b");
  });

  it("loads only via /play?content=ch02 and is denied as default", () => {
    const file = tryReadCh02Office(root);
    expect(file).not.toBeNull();
    expect(file?.contentVersion).toBe(CH02_OFFICE_VERSION);
    expect(file?.routeId).toBe(CH02_OFFICE_ROUTE_ID);
    expect(matchesDenyGlob(CH02_OFFICE_PATH)).toBe(true);
    expect(isCh02Pack("ch02")).toBe(true);
    expect(isCh02Pack("ch02-office")).toBe(true);
    expect(isCh02Pack(null)).toBe(false);
    expect(isFourweekPack("ch02")).toBe(false);
    expect(() =>
      compileRoute(file!, { asDefault: true, sourcePath: CH02_OFFICE_PATH }),
    ).toThrow(/P-D2 deny/);
    expect(resolvePlayRoute(null, null, file)).toBeDefined();
    expect(resolvePlayRoute("ch02", null, null)).toBe("missing-ch02");
    const play = resolvePlayRoute("ch02", null, file);
    expect(play).not.toBe("missing-ch02");
    if (typeof play === "string") return;
    expect(play.content.contentVersion).toBe(CH02_OFFICE_VERSION);
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
  });

  it("plays S13 public shame then S14 office with 29 / stockings / lock", () => {
    const file = tryReadCh02Office(root)!;
    const compiled = compileRoute(file);
    expect(compiled.entryNodeId).toBe("n_ch02_wall");
    expect(compiled.firstSubNodeId).toBe("n_ch02_wall");
    expect(compiled.nodes.get("n_ch02_wall")?.gate).toBe("chapter_start");
    expect(compiled.nodes.get("n_s14_wall")?.gate).toBeUndefined();

    const spoken = spokenHay(file);
    expect(spoken).toMatch(/办公时间。带学生证。周一见/);
    expect(spoken).toMatch(/你鸽了我，Kai/);
    expect(spoken).toMatch(/二十九/);
    expect(spoken).toMatch(/黑丝/);
    expect(spoken).toMatch(/锁/);
    expect(spoken).toMatch(/我还是你的讲师/);
    expect(spoken).toMatch(/嘴对上/);
    expect(spoken).not.toMatch(BANNED);
    expect(spoken).not.toMatch(FORBIDDEN);
    expect(spoken).not.toMatch(/ぬぷ|ぎち|ずぶ/);

    const started = startGame({ story_pass_month: false }, compiled);
    expect(started.stats.reina.affection).toBe(0);
    expect(started.nodeId).toBe("n_ch02_wall");
    expect(view(started, compiled).isPaywall).toBe(true);
    expect(selectChoice(started, "c_ch02_enter", compiled).ok).toBe(false);

    const free = playChoices(
      ["c_ch02_enter", "c_s13_ok", "c_s14_free"],
      { story_pass_month: false, w2_office: true },
      compiled,
    );
    expect(free.nodeId).toBe("n_ch02_settle");
    expect(free.flags.cafe_creditor).toBe("mia");
    expect(free.flags.office_locked).toBe(true);
    expect(free.stats.mia.affection).toBeGreaterThan(0);

    const paid = playChoices(
      ["c_ch02_enter", "c_s13_ok", "c_s14_kiss"],
      { story_pass_month: false, w2_office: true },
      compiled,
    );
    expect(paid.nodeId).toBe("n_ch02_settle");
    expect(paid.flags.reina_office_kiss).toBe(true);
    expect(paid.stats.reina.desire).toBeGreaterThan(0);
    expect(paid.stats.reina.affection).toBeGreaterThan(0);

    const inside = playChoices(
      ["c_ch02_enter", "c_s13_ok"],
      { story_pass_month: false, w2_office: true },
      compiled,
      {
      pumpAfter: true,
    });
    expect(inside.nodeId).toBe("n_s14_wall");
    const kissView = view(inside, compiled);
    expect(kissView.choices.map((choice) => choice.choiceId)).toEqual([
      "c_s14_free",
      "c_s14_kiss",
    ]);
    expect(
      kissView.node.choices?.find((c) => c.choiceId === "c_s14_kiss")?.requiresEntitlement,
    ).toBeUndefined();
    expect(selectChoice(inside, "c_s14_kiss", compiled).ok).toBe(true);
  });

  it("routes cafeteria by Ch01 stand-up flags and stays under the choiceIndex cap", () => {
    const compiled = compileRoute(tryReadCh02Office(root)!);
    expect(compiled.nodes.get("n_s13_router")?.playerVisible).toBe(false);
    expect(compiled.nodes.get("n_s13_router")?.advanceByFlag?.["default"]).toBe(
      "n_s13_mia",
    );

    const mia = playChoices(
      ["c_ch02_enter"],
      { story_pass_month: false, w2_office: true },
      compiled,
    );
    expect(mia.nodeId).toBe("n_s13_mia");

    let jade = startGame({ story_pass_month: false, w2_office: true }, compiled);
    jade = {
      ...jade,
      flags: { ...jade.flags, stood_up_jade: true },
    };
    const jadeEntered = selectChoice(pumpToPrompt(jade, compiled), "c_ch02_enter", compiled);
    expect(jadeEntered.ok).toBe(true);
    if (!jadeEntered.ok) return;
    expect(pumpToPrompt(jadeEntered.state, compiled).nodeId).toBe("n_s13_jade");

    let both = startGame({ story_pass_month: false, w2_office: true }, compiled);
    both = {
      ...both,
      flags: { ...both.flags, stood_up_mia: true, stood_up_jade: true },
    };
    const bothEntered = selectChoice(pumpToPrompt(both, compiled), "c_ch02_enter", compiled);
    expect(bothEntered.ok).toBe(true);
    if (!bothEntered.ok) return;
    expect(pumpToPrompt(bothEntered.state, compiled).nodeId).toBe("n_s13_both");

    const paths = walkChoiceIndexPaths(compiled);
    expect(Math.max(...paths.map((p) => p.choiceIndex))).toBeLessThanOrEqual(10);
  });

  it("ships ch02 plates and does not remap them onto Ch01", () => {
    for (const rel of CH02_WEBPS) {
      expect(existsSync(path.join(root, "public", rel)), rel).toBe(true);
      expect(resolveAssetUrl(rel)).toBe(`/${rel}`);
    }
    const compiled = compileRoute(tryReadCh02Office(root)!);
    for (const node of compiled.nodes.values()) {
      if (!node.assetId) continue;
      expect(node.assetId).toMatch(/^assets\/scenes\/ch02\//);
      const url = resolveAssetUrl(node.assetId);
      expect(url.startsWith("/assets/scenes/ch02/")).toBe(true);
      expect(existsSync(path.join(root, "public", url.slice(1))), `${node.nodeId} ${url}`).toBe(
        true,
      );
    }
  });
});
