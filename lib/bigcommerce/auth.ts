/**
 * Resolves the BigCommerce store credentials used for REST requests.
 *
 * Today this runs in "static mode": a single store's hash + API token come
 * from environment variables. It's structured so that multi-tenant OAuth token
 * storage can slot in later behind the same getters — when STATIC_MODE is off,
 * the credentials would be looked up per request (e.g. by store hash from the
 * session). That path is stubbed to throw for now.
 */

/**
 * Where gift certificate data comes from:
 *   - "mock"        → the in-repo mock dataset (no network); useful for tests.
 *   - "static"      → real REST API using a single static token (STATIC_MODE).
 *   - "multiTenant" → real REST API using a per-store OAuth token (not yet
 *                     implemented; the token getter throws).
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
export function getStoreHash(): string {
  if (isStaticMode()) {
    const storeHash = process.env.STATIC_STORE_HASH;
    if (!storeHash) {
      throw new Error("STATIC_STORE_HASH is not set");
    }
    return storeHash;
  }

  // TODO: resolve the active store hash from multi-tenant context.
  throw new Error("Multi-tenant store resolution is not implemented yet");
}

/** The API access token sent as the `X-Auth-Token` header. */
export function getStoreToken(): string {
  if (isStaticMode()) {
    const token = process.env.STATIC_STORE_TOKEN;
    if (!token) {
      throw new Error("STATIC_STORE_TOKEN is not set");
    }
    return token;
  }

  // TODO: look up the per-store OAuth token from token storage.
  throw new Error("Multi-tenant OAuth token retrieval is not implemented yet");
}
