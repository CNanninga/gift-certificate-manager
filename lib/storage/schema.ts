/**
 * Shared DDL for the OAuth storage tables. The SQL is plain SQLite — D1 runs
 * SQLite under the hood, so the same statements seed both adapters. Each entry
 * is a single statement (D1 prepares/executes one statement at a time).
 */
export const SCHEMA_STATEMENTS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS stores (
    store_hash TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    scope TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS store_users (
    store_hash TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (store_hash, user_id)
  )`,
];
