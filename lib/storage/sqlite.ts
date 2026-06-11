import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type DatabaseType from "better-sqlite3";
import { SCHEMA_STATEMENTS } from "./schema";
import type { StoreRecord, TokenStore, UserRecord } from "./types";

/**
 * Local, file-backed SQLite adapter (Node only). `better-sqlite3` is a native
 * module and must never be bundled into the Cloudflare Worker — it's loaded via
 * a dynamic `import()` here, and this whole module is only imported by the
 * factory when `STORAGE_DRIVER=sqlite`.
 */

const DEFAULT_PATH = "./.data/app.db";

let dbPromise: Promise<DatabaseType.Database> | null = null;

/** Opens (once) the SQLite file and ensures the schema exists. */
function getDb(): Promise<DatabaseType.Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { default: Database } = await import("better-sqlite3");
      const path = process.env.SQLITE_PATH ?? DEFAULT_PATH;
      mkdirSync(dirname(path), { recursive: true });
      const db = new Database(path);
      db.pragma("journal_mode = WAL");
      for (const statement of SCHEMA_STATEMENTS) {
        db.exec(statement);
      }
      return db;
    })();
  }
  return dbPromise;
}

export class SqliteTokenStore implements TokenStore {
  async ensureSchema(): Promise<void> {
    // Schema is applied when the file is opened; this is a no-op beyond that.
    await getDb();
  }

  async upsertStore(store: StoreRecord): Promise<void> {
    const db = await getDb();
    db.prepare(
      `INSERT INTO stores (store_hash, access_token, scope)
       VALUES (?, ?, ?)
       ON CONFLICT(store_hash) DO UPDATE SET
         access_token = excluded.access_token,
         scope = excluded.scope`,
    ).run(store.storeHash, store.accessToken, store.scope);
  }

  async upsertUser(user: UserRecord): Promise<void> {
    const db = await getDb();
    db.prepare(
      `INSERT INTO users (id, email, username)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         username = excluded.username`,
    ).run(user.id, user.email, user.username);
  }

  async linkStoreUser(storeHash: string, userId: number): Promise<void> {
    const db = await getDb();
    db.prepare(
      `INSERT INTO store_users (store_hash, user_id)
       VALUES (?, ?)
       ON CONFLICT(store_hash, user_id) DO NOTHING`,
    ).run(storeHash, userId);
  }

  async getStoreToken(storeHash: string): Promise<string | null> {
    const db = await getDb();
    const row = db
      .prepare(`SELECT access_token FROM stores WHERE store_hash = ?`)
      .get(storeHash) as { access_token: string } | undefined;
    return row?.access_token ?? null;
  }
}
