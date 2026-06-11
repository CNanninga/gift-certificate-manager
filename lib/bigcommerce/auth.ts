/**
 * Resolves the BigCommerce store credentials used for REST requests.
 *
 * In "static mode" a single store's hash + API token come from environment
 * variables. When STATIC_MODE is off ("multiTenant"), the credentials are
 * resolved per request from the OAuth session + token storage: the store hash
 * comes from the session cookie and the token from the store's stored record.
 */

import { readSession } from "@/lib/session";
import { getTokenStore } from "@/lib/storage";

/**
 * Where gift certificate data comes from:
 *   - "mock"        → the in-repo mock dataset (no network); useful for tests.
 *   - "static"      → real REST API using a single static token (STATIC_MODE).
 *   - "multiTenant" → real REST API using a per-store OAuth token resolved from
 *                     the session + token storage.
 */
export type DataSourceMode = "mock" | "static" | "multiTenant";

/** Mock mode is opt-in via MOCK_MODE=true (default off). */
export function isMockMode(): boolean {
  return (process.env.MOCK_MODE ?? "false").toLowerCase() === "true";
}

/** Static mode is the default; only an explicit "false" disables it. */
export function isStaticMode(): boolean {
  return (process.env.STATIC_MODE ?? "true").toLowerCase() !== "false";
}

/** Resolves the active data source from the env flags. Mock takes precedence. */
export function getDataSourceMode(): DataSourceMode {
  if (isMockMode()) {
    return "mock";
  }
  return isStaticMode() ? "static" : "multiTenant";
}

/** The store hash used in the API URL (`/stores/:store_hash/...`). */
export async function getStoreHash(): Promise<string> {
  if (isStaticMode()) {
    const storeHash = process.env.STATIC_STORE_HASH;
    if (!storeHash) {
      throw new Error("STATIC_STORE_HASH is not set");
    }
    return storeHash;
  }

  // Multi-tenant: the active store comes from the signed session cookie.
  const session = await readSession();
  if (!session?.storeHash) {
    throw new Error("No active session: cannot resolve the store hash");
  }
  return session.storeHash;
}

/** The API access token sent as the `X-Auth-Token` header. */
export async function getStoreToken(): Promise<string> {
  if (isStaticMode()) {
    const token = process.env.STATIC_STORE_TOKEN;
    if (!token) {
      throw new Error("STATIC_STORE_TOKEN is not set");
    }
    return token;
  }

  // Multi-tenant: look up the per-store OAuth token persisted at install.
  const store = await getTokenStore();
  const token = await store.getStoreToken(await getStoreHash());
  if (!token) {
    throw new Error("No stored OAuth token for the active store");
  }
  return token;
}
