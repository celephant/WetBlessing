/** Player-facing DEV jumps stay off unless `?dev=1` (or wb_dev=1). */
export const PLAYER_DEV_QUERY = "dev";
export const PLAYER_DEV_STORAGE_KEY = "wb_dev";

export function readPlayerDevFlag(
  search = "",
  storage?: { getItem(key: string): string | null } | null,
): boolean {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  if (params.get(PLAYER_DEV_QUERY) === "0") return false;
  if (params.get(PLAYER_DEV_QUERY) === "1") return true;
  return storage?.getItem(PLAYER_DEV_STORAGE_KEY) === "1";
}

export function persistPlayerDevFlag(
  search: string,
  storage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  },
): boolean {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  if (params.get(PLAYER_DEV_QUERY) === "0") {
    storage.removeItem(PLAYER_DEV_STORAGE_KEY);
    return false;
  }
  if (params.get(PLAYER_DEV_QUERY) === "1") {
    storage.setItem(PLAYER_DEV_STORAGE_KEY, "1");
    return true;
  }
  return storage.getItem(PLAYER_DEV_STORAGE_KEY) === "1";
}
