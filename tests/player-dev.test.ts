import { describe, expect, it } from "vitest";
import { persistPlayerDevFlag, readPlayerDevFlag } from "../lib/player-dev";

describe("player DEV chrome flag", () => {
  it("stays off for the title a player sees", () => {
    expect(readPlayerDevFlag("")).toBe(false);
    expect(readPlayerDevFlag("?resume=1")).toBe(false);
    expect(readPlayerDevFlag("?dev=1")).toBe(true);
    expect(readPlayerDevFlag("?dev=0")).toBe(false);
    expect(
      readPlayerDevFlag("", {
        getItem: (key) => (key === "wb_dev" ? "1" : null),
      }),
    ).toBe(true);
    expect(
      readPlayerDevFlag("?dev=0", {
        getItem: (key) => (key === "wb_dev" ? "1" : null),
      }),
    ).toBe(false);
  });

  it("remembers ?dev=1 and clears on ?dev=0", () => {
    const store: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
    expect(persistPlayerDevFlag("?dev=1", storage)).toBe(true);
    expect(store.wb_dev).toBe("1");
    expect(persistPlayerDevFlag("", storage)).toBe(true);
    expect(persistPlayerDevFlag("?dev=0", storage)).toBe(false);
    expect(store.wb_dev).toBeUndefined();
  });
});
