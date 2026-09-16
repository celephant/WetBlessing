import { describe, expect, it } from "vitest";
import { resolveAssetUrl } from "../lib/assets";
import { content } from "../lib/content";
import {
  DEFAULT_SCENE_FX,
  MOTION_SPEC,
  SAME_ASSET_MOTIONS,
  SCENE_TRANSITIONS,
  TRANSITION_MS,
  WALL_RHYTHM,
  parseCamera,
  parseFx,
  parseTransition,
  phoneGlowAllowed,
  presentationHooksForBeat,
  resolveScenePresentation,
  sceneIdentity,
  selectAssetChangeTransition,
  selectSameAssetMotion,
  selectSceneFx,
  shouldPlayAssetTransition,
} from "../lib/scene-presentation";
import { tokens } from "../lib/tokens";
import type { ContentNode } from "../lib/types";

describe("asset-change transitions", () => {
  it("ships fade, soft-zoom, and dip-to-black", () => {
    expect([...SCENE_TRANSITIONS]).toEqual([
      "fade",
      "soft-zoom",
      "dip-to-black",
    ]);
    expect(TRANSITION_MS).toEqual({
      fade: 320,
      "soft-zoom": 420,
      "dip-to-black": 380,
    });
    expect(
      MOTION_SPEC.dipInMs + MOTION_SPEC.dipHoldMs + MOTION_SPEC.dipOutMs,
    ).toBe(TRANSITION_MS["dip-to-black"]);
    expect(MOTION_SPEC.dipOverlay.toLowerCase()).toBe("#07080c");
    expect(MOTION_SPEC.kenBurnsScale).toBe(1.028);
    expect(MOTION_SPEC.kenBurnsMs).toBe(14_000);
    expect(MOTION_SPEC.dialogMs).toBe(220);
    expect(MOTION_SPEC.dialogContinueMs).toBe(140);
    expect(MOTION_SPEC.choiceStaggerMs).toBe(48);
    expect(MOTION_SPEC.dialogMs).toBe(tokens.motion.dialogMs);
    expect(TRANSITION_MS.fade).toBe(tokens.transitions.fade.ms);
    expect(TRANSITION_MS["soft-zoom"]).toBe(tokens.transitions.softZoom.ms);
    expect(TRANSITION_MS["dip-to-black"]).toBe(tokens.transitions.dip.ms);
  });

  it("pins fade on SMS/wall and after purchase; tokens still name the old cuts", () => {
    expect(
      selectAssetChangeTransition({
        changeCount: 0,
        nodeId: "n_ch01_first_sub",
      }),
    ).toBe("fade");
    expect(
      selectAssetChangeTransition({
        changeCount: 1,
        nodeId: "n_sms_auto",
        explicit: "fade",
      }),
    ).toBe("fade");
    expect(
      selectAssetChangeTransition({
        changeCount: 0,
        afterPurchase: true,
        nodeId: "n_pay_01_catch_mia",
      }),
    ).toBe("fade");
    expect(WALL_RHYTHM.arrival).toBe("dip-to-black");
    expect(WALL_RHYTHM.afterPurchase).toBe("soft-zoom");
    expect(WALL_RHYTHM.goldOnlyOnYuan).toBe(true);
    expect(WALL_RHYTHM.forbidAllChipsGold).toBe(true);
    expect(WALL_RHYTHM.chipEnterDelayMs).toBe(380);
    expect(
      selectAssetChangeTransition({
        changeCount: 0,
        nodeId: "n_future_edge",
        gate: "edge_lock",
      }),
    ).toBe("fade");
  });

  it("ignores authored cuts and the cycle index; plate fade only", () => {
    expect(
      selectAssetChangeTransition({ explicit: "soft-zoom", changeCount: 0 }),
    ).toBe("fade");
    expect(
      selectAssetChangeTransition({ explicit: "dip-to-black", changeCount: 0 }),
    ).toBe("fade");
    expect(
      selectAssetChangeTransition({ explicit: "fade", changeCount: 2 }),
    ).toBe("fade");
  });

  it("does not cycle zoom/dip when the field is missing", () => {
    const cycled = [0, 1, 2, 3].map((changeCount) =>
      selectAssetChangeTransition({ changeCount }),
    );
    expect(cycled).toEqual(["fade", "fade", "fade", "fade"]);
  });

  it("degrades unknown transition strings to fade", () => {
    expect(parseTransition("explode")).toBeNull();
    expect(
      selectAssetChangeTransition({ explicit: "explode", changeCount: 0 }),
    ).toBe("fade");
    expect(
      selectAssetChangeTransition({ explicit: "explode", changeCount: 1 }),
    ).toBe("fade");
  });

  it("aliases soft-zoom / softZoomCrop spellings", () => {
    expect(parseTransition("soft-zoom")).toBe("soft-zoom");
    expect(parseTransition("softZoom")).toBe("soft-zoom");
    expect(parseTransition("soft_zoom")).toBe("soft-zoom");
    expect(parseTransition("soft-zoom-crop")).toBe("soft-zoom-crop");
    expect(parseTransition("softZoomCrop")).toBe("soft-zoom-crop");
    expect(parseTransition("soft_zoom_crop")).toBe("soft-zoom-crop");
    expect(
      selectAssetChangeTransition({ explicit: "softZoom", changeCount: 0 }),
    ).toBe("fade");
    expect(
      selectAssetChangeTransition({
        explicit: "softZoomCrop",
        changeCount: 0,
      }),
    ).toBe("fade");
  });

  it("cuts when resolved URL or authored assetId changes", () => {
    const open = sceneIdentity("assets/scenes/ch01/n_open.webp");
    const seeBoth = sceneIdentity("assets/scenes/ch01/n_see_both.webp");
    const mia = sceneIdentity("assets/scenes/ch01/n_mia_edge_1.webp");

    expect(open.url).toBe(resolveAssetUrl("assets/scenes/ch01/n_open.webp"));
    expect(open.url).not.toBe(seeBoth.url);
    expect(shouldPlayAssetTransition(open, seeBoth)).toBe(true);
    expect(shouldPlayAssetTransition(seeBoth, seeBoth)).toBe(false);
    expect(shouldPlayAssetTransition(seeBoth, mia)).toBe(true);
    expect(shouldPlayAssetTransition(null, open)).toBe(true);
  });
});

describe("same-asset motion", () => {
  it("freezes same-asset motion on every hold", () => {
    const motions = [0, 1, 2, 4].map((holdCount) =>
      selectSameAssetMotion({ holdCount }),
    );
    expect(new Set(motions)).toEqual(new Set(["hold"]));
    expect(SAME_ASSET_MOTIONS.length).toBeGreaterThan(0);
  });

  it("maps every camera word onto hold", () => {
    expect(
      selectSameAssetMotion({
        explicitCamera: "hold",
        holdCount: 3,
        allowHold: true,
      }),
    ).toBe("hold");
    expect(
      selectSameAssetMotion({ explicitCamera: "hold", holdCount: 3 }),
    ).toBe("hold");
    expect(
      selectSameAssetMotion({ explicitCamera: "breathe", holdCount: 0 }),
    ).toBe("hold");
    expect(
      selectSameAssetMotion({ explicitCamera: "kenburns-left", holdCount: 2 }),
    ).toBe("hold");
    expect(
      selectSameAssetMotion({ explicitCamera: "kenburns", holdCount: 2 }),
    ).toBe("hold");
  });

  it("degrades unknown camera strings to hold", () => {
    expect(parseCamera("drone")).toBeNull();
    expect(selectSameAssetMotion({ explicitCamera: "drone", holdCount: 0 })).toBe(
      "hold",
    );
  });

  it("maps 0.4.8-feel-hot camera words onto hold", () => {
    expect(parseCamera("wide")).toBe("hold");
    expect(parseCamera("close")).toBe("hold");
    expect(parseCamera("close_alt")).toBe("hold");
    expect(parseCamera("close_hand")).toBe("hold");
    expect(parseCamera("extreme_close")).toBe("hold");
    expect(
      selectSameAssetMotion({
        explicitCamera: "insert",
        holdCount: 2,
        allowHold: true,
      }),
    ).toBe("hold");
    expect(
      selectSameAssetMotion({ explicitCamera: "insert", holdCount: 2 }),
    ).toBe("hold");
  });
});

describe("fx + optional node/line hooks", () => {
  it("defaults fx to intimate warm; PhoneGlow stays off on SMS + wall", () => {
    expect(selectSceneFx({})).toBe(DEFAULT_SCENE_FX);
    expect(DEFAULT_SCENE_FX).toBe("warm-tint");
    expect(selectSceneFx({ explicit: "warm-tint" })).toBe("warm-tint");
    expect(selectSceneFx({ explicit: "soft-light" })).toBe("warm-tint");
    expect(selectSceneFx({ explicit: "none" })).toBe("warm-tint");
    expect(parseFx("bloom")).toBeNull();
    expect(parseFx("warm_dust")).toBe("warm-tint");
    expect(parseFx("warm-veil")).toBe("warm-tint");
    expect(parseFx("magenta-mist")).toBe("warm-tint");
    expect(parseFx("phone_glow")).toBe("soft-light");
    expect(parseFx("tension_hold")).toBe("vignette");
    expect(
      selectSceneFx({ explicit: "phone_glow", nodeId: "n_sms_auto" }),
    ).toBe("vignette");
    expect(
      selectSceneFx({ explicit: "tension_hold", nodeId: "n_ch01_first_sub" }),
    ).toBe("vignette");
    expect(selectSceneFx({ explicit: "warm_dust", nodeId: "n_open" })).toBe(
      "warm-tint",
    );
    expect(selectSceneFx({ explicit: "phone_glow", forceNightGrade: true })).toBe(
      "vignette",
    );
    expect(phoneGlowAllowed({ nodeId: "n_sms_auto" })).toBe(false);
    expect(phoneGlowAllowed({ nodeId: "n_ch01_first_sub" })).toBe(false);
    expect(phoneGlowAllowed({ gate: "edge_lock" })).toBe(false);
    expect(
      selectSceneFx({ explicit: "phone_glow", gate: "edge_lock" }),
    ).toBe("vignette");
    expect(phoneGlowAllowed({ forceNightGrade: true })).toBe(false);
    expect(phoneGlowAllowed({ nodeId: "n_open" })).toBe(true);
  });

  it("lets a line override node hooks; bare nodes stay defaultable", () => {
    const node: ContentNode = {
      nodeId: "n_demo",
      type: "dialogue",
      text: "open",
      transition: "fade",
      camera: "kenburns",
      fx: "vignette",
      lines: [
        { speaker: "mia", text: "hey", transition: "soft-zoom", fx: "warm-tint" },
      ],
    };

    expect(presentationHooksForBeat(node, 0)).toEqual({
      transition: "fade",
      camera: "kenburns",
      fx: "vignette",
    });
    expect(presentationHooksForBeat(node, 1)).toEqual({
      transition: "soft-zoom",
      camera: "kenburns",
      fx: "warm-tint",
    });

    const bare: ContentNode = {
      nodeId: "n_open",
      type: "dialogue",
      text: "报到日",
    };
    expect(presentationHooksForBeat(bare, 0)).toEqual({
      transition: undefined,
      camera: undefined,
      fx: undefined,
    });
    expect(
      resolveScenePresentation(bare, 0, { changeCount: 2, holdCount: 0 }),
    ).toEqual({
      transition: "fade",
      motion: "hold",
      fx: "warm-tint",
      cropName: "wide",
      intimateBeat: null,
    });
  });

  it("resolves 0.4.8-feel-hot node fx/camera without requiring a fixture rewrite", () => {
    expect(content.contentVersion).toBe("0.4.8-feel-hot");
    const open = content.stages[0]!.nodes.find((node) => node.nodeId === "n_open");
    expect(open?.fx).toBe("warm_dust");
    expect(open?.camera).toBe("wide");
    const resolved = resolveScenePresentation(open!, 0, {
      changeCount: 0,
      holdCount: 0,
    });
    expect(resolved.fx).toBe("warm-tint");
    expect(resolved.motion).toBe("hold");
    expect(SCENE_TRANSITIONS).toContain(resolved.transition);
  });
});
