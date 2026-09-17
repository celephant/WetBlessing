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
  "assets/scenes/ch02/S13-empty.webp",
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
    ).toBe("0d92196c38fec1890d4fc5e7674133060d7035492ba266b720d22d42ce04fd86");
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
    expect(compiled.entryNodeId).toBe("n_ch02_open");
    expect(compiled.firstSubNodeId).toBe("n_ch02_wall");
    expect(compiled.nodes.get("n_ch02_wall")?.gate).toBe("chapter_start");
    expect(compiled.nodes.get("n_s14_wall")?.gate).toBeUndefined();

    const spoken = spokenHay(file);
    expect(spoken).not.toMatch(/办公时间。带学生证。周一见/);
    expect(spoken).not.toMatch(/你鸽了我/);
    expect(spoken).not.toMatch(/门口那一下/);
    expect(spoken).toMatch(/右边那张脸/);
    expect(spoken).toMatch(/群是下午。你夜里站在甲板中间/);
    expect(spoken).toMatch(/昨晚——不是这张下午的图/);
    expect(spoken).not.toMatch(/二十九/);
    expect(spoken).toMatch(/衬衫敞着，丝还在/);
    expect(spoken).toMatch(/办公室的灯没关。拼贴还在她桌上/);
    expect(spoken).toMatch(/黑丝/);
    expect(spoken).toMatch(/锁/);
    expect(spoken).toMatch(/我还是你的讲师/);
    expect(spoken).toMatch(/嘴对上/);
    expect(spoken).toMatch(/教員室的门开着/);
    expect(spoken).not.toMatch(/想被点名/);
    expect(spoken).not.toMatch(BANNED);
    expect(spoken).not.toMatch(FORBIDDEN);
    expect(spoken).not.toMatch(/ぬぷ|ぎち|ずぶ/);

    const started = startGame({ story_pass_month: false }, compiled);
    expect(started.stats.reina.affection).toBe(0);
    expect(started.nodeId).toBe("n_ch02_open");
    expect(view(started, compiled).isPaywall).toBe(false);

    const unpaid = playChoices(["c_s13_ok"], { story_pass_month: false }, compiled);
    expect(unpaid.nodeId).toBe("n_ch02_wall");
    expect(view(unpaid, compiled).isPaywall).toBe(true);
    expect(selectChoice(unpaid, "c_ch02_enter", compiled).ok).toBe(false);
    expect(unpaid.flags.cafe_creditor).toBe("none");

    const free = playChoices(
      ["c_s13_ok", "c_ch02_enter", "c_s14_ok", "c_s14_free"],
      { story_pass_month: false, w2_office: true },
      compiled,
    );
    expect(free.nodeId).toBe("n_ch02_settle");
    expect(free.flags.cafe_creditor).toBe("none");
    expect(free.flags.office_locked).toBe(true);
    expect(free.stats.mia.affection).toBe(0);

    const paid = playChoices(
      ["c_s13_ok", "c_ch02_enter", "c_s14_ok", "c_s14_kiss"],
      { story_pass_month: false, w2_office: true },
      compiled,
    );
    expect(paid.nodeId).toBe("n_ch02_settle");
    expect(paid.flags.reina_office_kiss).toBe(true);
    expect(paid.stats.reina.desire).toBeGreaterThan(0);
    expect(paid.stats.reina.affection).toBeGreaterThan(0);

    const inside = playChoices(
      ["c_s13_ok", "c_ch02_enter", "c_s14_ok"],
      { story_pass_month: false, w2_office: true },
      compiled,
      {
      pumpAfter: true,
    });
    expect(inside.nodeId).toBe("n_s14_lock");
    const kissView = view(inside, compiled);
    expect(kissView.choices.map((choice) => choice.choiceId)).toEqual([
      "c_s14_kiss",
      "c_s14_free",
    ]);
    expect(
      kissView.node.choices?.find((c) => c.choiceId === "c_s14_kiss")?.requiresEntitlement,
    ).toBeUndefined();
    expect(selectChoice(inside, "c_s14_kiss", compiled).ok).toBe(true);
  });

  it("routes cafeteria by catch_target × went_with and stays under the choiceIndex cap", () => {
    const compiled = compileRoute(tryReadCh02Office(root)!);
    expect(compiled.nodes.get("n_s13_router")?.playerVisible).toBe(false);
    expect(compiled.nodes.get("n_s13_router")?.advanceByFlag).toMatchObject({
      "catch_target==mia && went_with==jade": "n_s13_mia_caught",
      "catch_target==jade && went_with==mia": "n_s13_mia_partner",
      "catch_target==mia": "n_s13_jade",
      "catch_target==jade": "n_s13_mia",
      "went_with==mia": "n_s13_jade",
      "went_with==jade": "n_s13_mia",
      "catch_target==lina": "n_s13_other",
      "catch_target==rae": "n_s13_other",
      default: "n_s13_none",
    });

    const cafeAt = (flags: Record<string, string>) => {
      let state = startGame({ story_pass_month: false, w2_office: true }, compiled);
      state = { ...state, flags: { ...state.flags, ...flags } };
      return pumpToPrompt(state, compiled).nodeId;
    };

    expect(cafeAt({ went_with: "mia", catch_target: "mia" })).toBe("n_s13_jade");
    expect(cafeAt({ went_with: "mia", catch_target: "jade" })).toBe("n_s13_mia_partner");
    expect(cafeAt({ went_with: "jade", catch_target: "mia" })).toBe("n_s13_mia_caught");
    expect(cafeAt({ went_with: "jade", catch_target: "jade" })).toBe("n_s13_mia");
    expect(cafeAt({ went_with: "mia" })).toBe("n_s13_jade");
    expect(cafeAt({ catch_target: "jade" })).toBe("n_s13_mia");
    expect(cafeAt({ catch_target: "lina" })).toBe("n_s13_other");
    expect(cafeAt({})).toBe("n_s13_none");

    const dodgeEmpty = playChoices(
      ["c_s13_dodge"],
      { story_pass_month: false, w2_office: true },
      compiled,
    );
    expect(compiled.nodes.get("n_s13_empty")?.assetId).toBe("assets/scenes/ch02/S13-empty.webp");
    expect(compiled.nodes.get("n_s13_both")?.choices?.find((c) => c.choiceId === "c_s13_dodge")?.next).toBe(
      "n_s13_empty",
    );
    expect(dodgeEmpty.nodeId).toBe("n_ch02_wall");

    const lock = playChoices(
      ["c_s13_ok", "c_ch02_enter", "c_s14_ok"],
      { story_pass_month: false, w2_office: true },
      compiled,
    );
    expect(lock.nodeId).toBe("n_s14_lock");
    expect(lock.flags.office_locked).toBe(true);

    const paths = walkChoiceIndexPaths(compiled);
    expect(Math.max(...paths.map((p) => p.choiceIndex))).toBeLessThanOrEqual(10);
  });

  it("covers Mia / other / none cafeteria questions without treating unused as 失约", () => {
    const jade = tryReadCh02Office(root)!.stages[0]!.nodes.find((n) => n.nodeId === "n_s13_jade")!;
    expect(jade.text).toMatch(/Jade 从你身后坐下/);
    expect(jade.lines?.some((line) => line.speaker === "mia" && /右边那张脸/.test(line.text))).toBe(
      true,
    );
    expect(
      jade.lines?.every((line) => line.speaker !== "jade" || line.text.startsWith("（身后）")),
    ).toBe(true);
    const both = tryReadCh02Office(root)!.stages[0]!.nodes.find((n) => n.nodeId === "n_s13_both")!;
    expect(both.lines?.[0]?.speaker).toBe("mia");
    expect(both.lines?.[0]?.text).toMatch(/右边那张脸/);
    const other = tryReadCh02Office(root)!.stages[0]!.nodes.find((n) => n.nodeId === "n_s13_other")!;
    expect(other.lines?.map((line) => line.text).join("\n")).toMatch(/昨晚——不是这张下午的图/);
    const none = tryReadCh02Office(root)!.stages[0]!.nodes.find((n) => n.nodeId === "n_s13_none")!;
    expect(none.characters).toContain("mia");
    expect(none.lines?.map((line) => line.text).join("\n")).toMatch(/群是下午/);
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
