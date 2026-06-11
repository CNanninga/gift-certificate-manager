/**
 * Storage contract for multi-tenant OAuth data. Both the local SQLite adapter
 * and the Cloudflare D1 adapter implement this so the rest of the app never
 * cares which one is active (see `getTokenStore` in `./index`).
 *
 * The interface is fully async even though the SQLite driver is synchronous —
 * that keeps the D1 (Workers, async-only) adapter swappable behind the same
 * shape.
 */

/** A BigCommerce store and its permanent API token, keyed by store hash. */
export interface StoreRecord {
  /** Short store identifier, e.g. the `abc` in `stores/abc`. */
  storeHash: string;
  /** Permanent OAuth access token sent as `X-Auth-Token`. */
  accessToken: string;
  /** Space-separated OAuth scopes granted at install. */
  scope: string;
}

/** A control-panel user who installed or loaded the app. */
export interface UserRecord {
  /** BigCommerce numeric user id. */
  id: number;
  /** User's email. */
  email: string;
  /** User's username (may be empty for some payloads). */
  username: string;
}

export interface TokenStore {
  /** Creates the tables if they don't exist. Idempotent. */
  ensureSchema(): Promise<void>;
  /** Inserts or updates a store's token + scope. */
  upsertStore(store: StoreRecord): Promise<void>;
  /** Inserts or updates a user. */
  upsertUser(user: UserRecord): Promise<void>;
  /** Records that a user belongs to a store. */
  linkStoreUser(storeHash: string, userId: number): Promise<void>;
  /** Returns the stored access token for a store, or null if none. */
  getStoreToken(storeHash: string): Promise<string | null>;
}
