/**
 * Resolves the BigCommerce store credentials used for REST requests.
 *
 * Today this runs in "static mode": a single store's hash + API token come
 * from environment variables. It's structured so that multi-tenant OAuth token
 * storage can slot in later behind the same getters — when STATIC_MODE is off,
 * the credentials would be looked up per request (e.g. by store hash from the
 * session). That path is stubbed to throw for now.
 */

/** Static mode is the default; only an explicit "false" disables it. */
export function isStaticMode(): boolean {
  return (process.env.STATIC_MODE ?? "true").toLowerCase() !== "false";
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
