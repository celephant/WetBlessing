import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { matchesDenyGlob } from "../lib/allowlist";
import { resolveAssetUrl } from "../lib/assets";
import { walkChoiceIndexPaths } from "../lib/choice-index";
import { compileRoute, content, DEFAULT_CH01_VERSION } from "../lib/content";
import {
  isFunnelPack,
  isFourweekPack,
  LANDING_FUNNEL_PATH,
  LANDING_FUNNEL_ROUTE_ID,
  LANDING_FUNNEL_VERSION,
  resolvePlayRoute,
} from "../lib/dev-packs";
import { tryReadLandingFunnel } from "../lib/dev-packs.node";
import { clickAdvance, selectChoice, startGame, view } from "../lib/engine";
import {
  CH01_HANDOFF_NODE,
  FUNNEL_NOTICE,
  FUNNEL_ZONE_LINES,
  handoffFunnelToCh01,
} from "../lib/funnel";

const root = path.resolve(__dirname, "..");

const BANNED =
  /认领|两条认领|不是雨|氯不是雨|周一还在|稍后再说|你只能带走一个故事|登录后开始|你真的跟到这里来了|先站到我这边/;
const HEART_BTN = /♥|♡|～|〜/;
const FORBIDDEN = /阴茎|阴道|阴蒂|性交|插入|口交|生殖器|高中生|未成年|幼/;

function spokenHay(file = tryReadLandingFunnel(root)!) {
  return file.stages[0]!.nodes
    .flatMap((node) => [
      node.text ?? "",
      ...(node.lines?.map((line) => line.text) ?? []),
      ...(node.choices?.map((choice) => choice.text) ?? []),
    ])
    .join("\n");
}

function pumpToPrompt(state: ReturnType<typeof startGame>, compiled: ReturnType<typeof compileRoute>) {
  let current = state;
  for (let i = 0; i < 8; i += 1) {
    const snap = view(current, compiled);
    if (snap.choices.length > 0 || snap.isSettle) return current;
    if (!snap.canClickAdvance) return current;
    current = clickAdvance(current, compiled);
  }
  return current;
}

describe("landing funnel (pre-login, not default)", () => {
  it("does not replace default Ch01 bytes, version, or n_open entry", () => {
    expect(DEFAULT_CH01_VERSION).toBe("0.4.8-feel-hot");
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(content.stages[0]?.entryNodeId).toBe("n_open");
    expect(
      createHash("sha256")
        .update(readFileSync(path.join(root, "content/CONTENT-ch01-free-to-firstsub.json")))
        .digest("hex"),
    ).toBe("0b79b2273b7a7853936e013820461b787f828e10df5a4dfe85b38a474388f7ec");
  });

  it("loads only via /play?content=funnel", () => {
    const file = tryReadLandingFunnel(root);
    expect(file).not.toBeNull();
    expect(file?.contentVersion).toBe(LANDING_FUNNEL_VERSION);
    expect(file?.routeId).toBe(LANDING_FUNNEL_ROUTE_ID);
    expect(file?.stages[0]?.entryNodeId).toBe("n_funnel_01");
    expect(matchesDenyGlob(LANDING_FUNNEL_PATH)).toBe(true);
    expect(isFunnelPack("funnel")).toBe(true);
    expect(isFunnelPack("landing-funnel")).toBe(true);
    expect(isFunnelPack(null)).toBe(false);
    expect(isFourweekPack("funnel")).toBe(false);
    expect(() =>
      compileRoute(file!, { asDefault: true, sourcePath: LANDING_FUNNEL_PATH }),
    ).toThrow(/P-D2 deny/);
    expect(resolvePlayRoute("funnel", null, null, null, null, null)).toBe(
      "missing-funnel",
    );
    const play = resolvePlayRoute("funnel", null, null, null, null, file);
    expect(play).not.toBe("missing-funnel");
    if (typeof play === "string") return;
    expect(play.content.contentVersion).toBe(LANDING_FUNNEL_VERSION);
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    expect(content.stages[0]?.entryNodeId).toBe("n_open");
  });

  it("keeps player copy on the voice lock and ships KEEP stills", () => {
    const file = tryReadLandingFunnel(root)!;
    const hay = spokenHay(file);
    expect(hay).not.toMatch(BANNED);
    expect(hay).not.toMatch(FORBIDDEN);
    expect(hay).not.toMatch(/十八|证件照片|JK/);
    for (const node of file.stages[0]!.nodes) {
      for (const choice of node.choices ?? []) {
        expect(choice.text).not.toMatch(HEART_BTN);
      }
      if (!node.assetId) continue;
      const url = resolveAssetUrl(node.assetId);
      expect(existsSync(path.join(root, "public", url.slice(1)))).toBe(true);
      expect(node.assetId).not.toMatch(/kiss|ot-|catch-/i);
      expect(node.assetId).not.toContain("n_open");
    }
    expect(hay).toContain("Kai。别动。就一张。");
    expect(hay).toContain("还站中间干什么。");
    expect(hay).toContain("唔……！手拿开。……不、别停。");
    expect(hay).toContain("进来。……别、别给别人看。");
    expect(hay).toContain("别盯。……不、拿着就拿着。");
    expect(hay).toContain("门缝还开着。……从里面关。别、别出声。");
    expect(hay).toContain("点开那张拼贴。");
    expect(hay).not.toMatch(/箱子/);
    expect(FUNNEL_NOTICE).toContain("学生事务。带学生证。");
    expect(readFileSync(path.join(root, "components/VNPlayer.tsx"), "utf8")).toContain(
      "choice-overlay z-[5]",
    );
    expect(readFileSync(path.join(root, "components/FunnelHud.tsx"), "utf8")).toContain(
      'data-funnel-hotspot={zone}',
    );
  });

  it("walks night pool to collage then auth without blowing the cap", () => {
    const file = tryReadLandingFunnel(root)!;
    const compiled = compileRoute(file);
    const paths = walkChoiceIndexPaths(compiled);
    expect(paths.length).toBeGreaterThan(0);
    expect(Math.max(...paths.map((path) => path.choiceIndex))).toBeLessThanOrEqual(10);

    let state = startGame({}, compiled);
    state = pumpToPrompt(state, compiled);
    expect(view(state, compiled).node.nodeId).toBe("n_funnel_01");
    state = selectChoice(state, "c_f1_enter", compiled).ok
      ? (selectChoice(state, "c_f1_enter", compiled) as { ok: true; state: typeof state }).state
      : state;
    state = pumpToPrompt(state, compiled);
    expect(view(state, compiled).node.nodeId).toBe("n_funnel_02");
    const seen = selectChoice(state, "c_f2_seen", compiled);
    expect(seen.ok).toBe(true);
    if (!seen.ok) return;
    state = pumpToPrompt(seen.state, compiled);
    expect(view(state, compiled).node.nodeId).toBe("n_funnel_03");
    const take = selectChoice(state, "c_f3_take", compiled);
    expect(take.ok).toBe(true);
    if (!take.ok) return;
    state = take.state;
    while (view(state, compiled).node.nodeId !== "n_funnel_07") {
      const snap = view(state, compiled);
      if (snap.choices.length > 0) {
        const pick = snap.choices.find((choice) => choice.choiceId.endsWith("_take")) ?? snap.choices[0]!;
        const next = selectChoice(state, pick.choiceId, compiled);
        if (!next.ok) break;
        state = next.state;
      } else {
        state = clickAdvance(state, compiled);
      }
    }
    expect(view(state, compiled).node.nodeId).toBe("n_funnel_07");
    const labels = view(state, compiled).choices.map((choice) => choice.text);
    expect(labels).toEqual([
      "接招：侧门。",
      "接招：上台阶。",
      "接招：走向跳台。",
      "接招：走向冒气的门。",
      "躲开：谁也不跟。",
    ]);
    const goMia = selectChoice(state, "c_f7_mia", compiled);
    expect(goMia.ok).toBe(true);
    if (!goMia.ok) return;
    state = pumpToPrompt(goMia.state, compiled);
    expect(view(state, compiled).node.assetId).toBe("assets/scenes/heat/S06a.webp");
    expect(state.flags.went_with).toBe("mia");
    expect(state.flags.stood_up_jade).toBe(true);
    const closer = selectChoice(state, "c_f8_mia", compiled);
    expect(closer.ok).toBe(true);
    if (!closer.ok) return;
    state = pumpToPrompt(closer.state, compiled);
    expect(view(state, compiled).node.nodeId).toBe("n_funnel_09");
    const open = selectChoice(state, "c_f9_open", compiled);
    expect(open.ok).toBe(true);
    if (!open.ok) return;
    expect(view(open.state, compiled).node.nodeId).toBe("n_funnel_10");
    const handed = handoffFunnelToCh01(open.state);
    expect(handed.nodeId).toBe(CH01_HANDOFF_NODE);
    expect(handed.flags.went_with).toBe("mia");
    expect(handed.flags.funnel_completed).toBe(true);
  });
});
