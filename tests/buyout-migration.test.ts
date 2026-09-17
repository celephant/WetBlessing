import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileRoute } from "../lib/content";
import { tryReadCh02Office, tryReadCh03Night } from "../lib/dev-packs.node";
import {
  hasEntitlement,
  playChoices,
  selectChoice,
  startGame,
  unlockScope,
} from "../lib/engine";
import {
  ENTITLEMENT_STORAGE_KEY,
  emptyEntitlements,
  mintFullEntitle,
  normalizeEntitlements,
  parseEntitlements,
  saveEntitlements,
} from "../lib/entitlement";
import { clearRunProgress } from "../lib/new-run";
import {
  GATE_CHAPTER_START,
  PAYWALL_CHAPTER,
  PAYWALL_EDGE_LOCK,
  PAYWALL_HARD,
  SCOPE_W1_CONTINUE,
  SCOPE_W2_OFFICE,
  SCOPE_W3_EDGE_NIGHT,
} from "../lib/paywall-copy";
import { CHAPTER_UNLOCK_PRICE } from "../lib/paywall-copy";
import { PASS_PRICE, SKU_STORY_PASS } from "../lib/tokens";

const root = path.resolve(__dirname, "..");
const MONTH_CARD = /月卡|订阅|本月/;
const ch01Dodge = ["c_dodge_both", "c_dodge_party", "c_sms_shut"] as const;

function installMemoryStore(store: Record<string, string>) {
  const memory = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
  (globalThis as { window?: { localStorage: typeof memory } }).window = {
    localStorage: memory,
  };
  (globalThis as { localStorage?: typeof memory }).localStorage = memory;
  return store;
}

describe("B5 one-time buyout migration", () => {
  it("renames the live SKU to story_pass and keeps month-card saves", () => {
    const fromMonth = parseEntitlements(
      JSON.stringify({ story_pass_month: true, w1_continue: true }),
    );
    expect(fromMonth.story_pass).toBe(true);
    expect(fromMonth.story_pass_month).toBe(true);
    expect(fromMonth.w1_continue).toBe(true);

    const fromPass = parseEntitlements(JSON.stringify({ story_pass: true }));
    expect(fromPass.story_pass).toBe(true);
    expect(fromPass.story_pass_month).toBe(true);

    const empty = parseEntitlements(JSON.stringify({ story_pass_month: false }));
    expect(empty.story_pass).toBe(false);

    const store = installMemoryStore({});
    saveEntitlements(mintFullEntitle());
    const written = JSON.parse(store[ENTITLEMENT_STORAGE_KEY]!) as {
      story_pass: boolean;
      story_pass_month: boolean;
    };
    expect(written.story_pass).toBe(true);
    expect(written.story_pass_month).toBe(true);
  });

  it("prints one-time 通行证 at $8.99 / $2.99 and never 月卡/订阅/本月", () => {
    expect(PASS_PRICE).toBe(8.99);
    expect(CHAPTER_UNLOCK_PRICE).toBe(2.99);
    expect(SKU_STORY_PASS).toBe("story_pass");
    for (const pack of [PAYWALL_HARD, PAYWALL_CHAPTER, PAYWALL_EDGE_LOCK]) {
      expect(pack["zh-CN"].primary).toBe("一次性通行证 · $8.99");
      expect(pack["zh-CN"].secondary).toMatch(/\$2\.99/);
      expect(pack["zh-CN"].tertiary).toBe("回标题");
      expect(JSON.stringify(pack["zh-CN"])).not.toMatch(MONTH_CARD);
      expect(pack.behavior.primaryAction).toBe("checkout_sku:story_pass");
    }

    const overlay = readFileSync(path.join(root, "components/PaywallOverlay.tsx"), "utf8");
    const chips = readFileSync(path.join(root, "components/ChoiceList.tsx"), "utf8");
    expect(overlay).toContain("一次性通行证");
    expect(overlay).toContain("假开通一次性通行证");
    expect(overlay).toContain("zh.tertiary");
    expect(overlay).not.toMatch(MONTH_CARD);
    expect(chips).not.toContain("PASS_PRICE");
    expect(chips).not.toContain("通行证");
    expect(chips).not.toMatch(/\$8\.99|锁 ·/);
    expect(chips).not.toMatch(MONTH_CARD);
  });

  it("keeps w1_continue from unlocking Ch02 or Ch03", () => {
    const wall = playChoices([...ch01Dodge]);
    const locked = selectChoice(wall, "c_sub_round_mia");
    expect(locked.ok).toBe(false);
    if (locked.ok) return;

    const scoped = unlockScope(locked.state, SCOPE_W1_CONTINUE);
    expect(scoped.ok).toBe(true);
    if (!scoped.ok) return;
    expect(scoped.state.entitlements.w1_continue).toBe(true);
    expect(scoped.state.entitlements.story_pass).toBe(false);
    expect(hasEntitlement(scoped.state, SCOPE_W2_OFFICE, GATE_CHAPTER_START)).toBe(
      false,
    );
    expect(hasEntitlement(scoped.state, SCOPE_W3_EDGE_NIGHT, "edge_lock")).toBe(
      false,
    );

    const ch02 = compileRoute(tryReadCh02Office()!);
    const office = playChoices(["c_s13_ok"], scoped.state.entitlements, ch02);
    expect(selectChoice(office, "c_ch02_enter", ch02).ok).toBe(false);

    const ch03 = compileRoute(tryReadCh03Night()!);
    const emptyOpen = startGame(scoped.state.entitlements, ch03);
    expect(hasEntitlement(emptyOpen, "edge_lock", "edge_lock")).toBe(false);
  });

  it("lets a new run pick another Catch after Ch01 without a second pay", () => {
    const store = installMemoryStore({
      [ENTITLEMENT_STORAGE_KEY]: JSON.stringify({
        story_pass: false,
        w1_continue: true,
        w2_office: false,
        w3_edge_night: false,
      }),
    });
    clearRunProgress();
    expect(JSON.parse(store[ENTITLEMENT_STORAGE_KEY]!).w1_continue).toBe(true);

    const entitled = normalizeEntitlements({ w1_continue: true });
    const dodge = playChoices([...ch01Dodge], entitled);
    expect(dodge.entitlements.w1_continue).toBe(true);
    expect(dodge.flags.went_with).toBe("none");
    expect(dodge.flags.catch_target).toBeUndefined();

    const jade = selectChoice(dodge, "c_sub_round_jade");
    expect(jade.ok).toBe(true);
    if (!jade.ok) return;
    expect(jade.state.flags.catch_target).toBe("jade");
    expect(jade.state.entitlements.story_pass).toBe(false);
    expect(jade.state.entitlements.w2_office).toBeFalsy();

    const mia = playChoices([...ch01Dodge, "c_sub_round_mia"], entitled, undefined, {
      pumpAfter: false,
    });
    expect(mia.flags.catch_target).toBe("mia");
  });

  it("DEV full entitle still mints the one-time pass plus every wall", () => {
    const minted = mintFullEntitle(emptyEntitlements());
    expect(minted.story_pass).toBe(true);
    expect(minted.w1_continue).toBe(true);
    expect(minted.w2_office).toBe(true);
    expect(minted.w3_edge_night).toBe(true);
    const entitled = startGame(minted);
    expect(hasEntitlement(entitled, SKU_STORY_PASS, "first_sub")).toBe(true);
    expect(hasEntitlement(entitled, SCOPE_W2_OFFICE, GATE_CHAPTER_START)).toBe(true);
    expect(hasEntitlement(entitled, SCOPE_W3_EDGE_NIGHT, "edge_lock")).toBe(true);
  });
});
