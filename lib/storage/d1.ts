import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SCHEMA_STATEMENTS } from "./schema";
import type { StoreRecord, TokenStore, UserRecord } from "./types";

/**
 * Cloudflare D1 adapter. D1 is a Workers binding (no driver to install), read
 * from the runtime context. The `DB` binding isn't typed yet — `wrangler.jsonc`
 * + `cf-typegen` are handled separately — so we describe the minimal D1 surface
 * we use locally and read the binding through a cast.
 */

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T = unknown>(colName?: string): Promise<T | null>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as { DB?: D1Database }).DB;
  if (!db) {
    throw new Error(
      "D1 binding `DB` is not configured. Add a d1_databases binding named DB to wrangler.jsonc.",
    );
  }
  return db;
}

export class D1TokenStore implements TokenStore {
  async ensureSchema(): Promise<void> {
    const db = await getDb();
    for (const statement of SCHEMA_STATEMENTS) {
      await db.prepare(statement).run();
    }
  }

  async upsertStore(store: StoreRecord): Promise<void> {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO stores (store_hash, access_token, scope)
         VALUES (?, ?, ?)
         ON CONFLICT(store_hash) DO UPDATE SET
           access_token = excluded.access_token,
           scope = excluded.scope`,
      )
      .bind(store.storeHash, store.accessToken, store.scope)
      .run();
  }

  async upsertUser(user: UserRecord): Promise<void> {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO users (id, email, username)
         VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           email = excluded.email,
           username = excluded.username`,
      )
      .bind(user.id, user.email, user.username)
      .run();
  }

  async linkStoreUser(storeHash: string, userId: number): Promise<void> {
    const db = await getDb();
    await db
      .prepare(
        `INSERT INTO store_users (store_hash, user_id)
         VALUES (?, ?)
         ON CONFLICT(store_hash, user_id) DO NOTHING`,
      )
      .bind(storeHash, userId)
      .run();
  }

  async getStoreToken(storeHash: string): Promise<string | null> {
    const db = await getDb();
    const token = await db
      .prepare(`SELECT access_token FROM stores WHERE store_hash = ?`)
      .bind(storeHash)
      .first<string>("access_token");
    return token ?? null;
  }
}
