import type { TokenStore } from "./types";

/**
 * Storage selector. `STORAGE_DRIVER` picks the adapter: `sqlite` (default, local
 * file) or `d1` (Cloudflare). The chosen adapter is loaded with a dynamic
 * `import()` so the native `better-sqlite3` module is never pulled into the
 * Cloudflare Worker bundle when running under D1.
 */

export type StorageDriver = "sqlite" | "d1";

/** Resolves the active driver from env; anything but `d1` means `sqlite`. */
export function getStorageDriver(): StorageDriver {
  return (process.env.STORAGE_DRIVER ?? "sqlite").toLowerCase() === "d1"
    ? "d1"
    : "sqlite";
}

let storePromise: Promise<TokenStore> | null = null;

/** Returns the singleton TokenStore for the active driver. */
export function getTokenStore(): Promise<TokenStore> {
  if (!storePromise) {
    storePromise = (async () => {
      if (getStorageDriver() === "d1") {
        const { D1TokenStore } = await import("./d1");
        return new D1TokenStore();
      }
      const { SqliteTokenStore } = await import("./sqlite");
      return new SqliteTokenStore();
    })();
  }
  return storePromise;
}

export type { StoreRecord, TokenStore, UserRecord } from "./types";
