# Plan: BigCommerce single-click app OAuth (minimal install)

## Context

`gift-certificate-manager` (now **Next 15.5.19 / React 18.3.1 / App Router**, custom Tailwind UI, deployed via OpenNext to Cloudflare) currently talks to the BigCommerce API in **static mode** — a single store's token/hash from env (`lib/bigcommerce/auth.ts`). The `"multiTenant"` branch of `getStoreToken()`/`getStoreHash()` is a stub that throws.

To become a real **single-click app**, it needs the OAuth install handshake: BigCommerce calls back an **auth** endpoint (exchange `code` → permanent token, persist it) and a **load** endpoint (verify the `signed_payload_jwt`, identify the user, start a session). This plan delivers the **minimal endpoints to get the app installed and loading**, with pluggable storage (file SQLite locally, Cloudflare D1 when deployed) and a `SameSite=None` JWT session cookie so the session survives inside BigCommerce's control-panel iframe.

**In scope:** libraries, storage adapters + selector, `/api/auth` + `/api/load` route handlers, the OAuth handshake (token exchange + JWT verification), persisting store/user/token, the session JWT cookie, **wiring the multi-tenant `getStoreToken()`/`getStoreHash()` to storage + session**, and a home-page readout to verify the cookie reaches the iframe.

**Out of scope (explicit follow-ups):** `uninstall` / `remove_user` callbacks; token encryption-at-rest; middleware auth gating; actually provisioning/deploying the D1 database (Cloudflare deploy remains GRC-gated).

**Decisions (confirmed):** raw SQL adapters behind a shared async interface · 3 tables (stores / users / store_users) · **jose** for all JWT work.

Reference implementation to mirror (their own lab): `/Users/chris.nanninga/Documents/Code/CourseLabs/lab-gift-certs-manager-app` — `app/api/auth/route.ts`, `app/api/load/route.ts`, `lib/auth.ts`, `lib/session.ts`, `lib/db/*`, `types/db.ts`. Note two deliberate departures from the reference: use **jose** (not `jsonwebtoken`) and a **`SameSite=None` cookie** (not a `?session=` query param), per the scoping doc.

---

## Stage 1 — Install libraries  *(commit)*

- `npm i jose better-sqlite3`
- `npm i -D @types/better-sqlite3`

`jose` = JWT verify/sign (Workers-compatible). `better-sqlite3` = local file SQLite driver (Node only; D1 needs no driver — it's a Workers binding). No ORM.

---

## Stage 2 — Storage adapters + selector  *(commit)*

Create `lib/storage/`:

- **`types.ts`** — record types + the async interface, e.g.
  `interface TokenStore { ensureSchema(): Promise<void>; upsertStore(s): Promise<void>; upsertUser(u): Promise<void>; linkStoreUser(storeHash, userId): Promise<void>; getStoreToken(storeHash): Promise<string|null>; }`
  Records: `StoreRecord { storeHash, accessToken, scope }`, `UserRecord { id, email, username }`.
- **`schema.ts`** — the `CREATE TABLE IF NOT EXISTS` DDL for `stores (store_hash PK, access_token, scope)`, `users (id PK, email, username)`, `store_users (store_hash, user_id, PRIMARY KEY(store_hash,user_id))`. Shared by both adapters (SQLite-compatible SQL; D1 is SQLite under the hood).
- **`sqlite.ts`** — `better-sqlite3` adapter (synchronous calls wrapped to satisfy the async interface). Opens a file from `SQLITE_PATH` (default `./.data/app.db`).
- **`d1.ts`** — D1 adapter using `env.DB.prepare(...).bind(...).run()/.first()`, reading the binding from `getCloudflareContext().env.DB` (`@opennextjs/cloudflare`).
- **`index.ts`** — `getTokenStore(): Promise<TokenStore>` factory that reads `STORAGE_DRIVER` (`"sqlite"` default | `"d1"`) and returns the right adapter. **Dynamically `import()` the chosen adapter** so `better-sqlite3` (a native module) is never bundled into the Cloudflare Worker.

Config:
- Env vars (provide for the user to add to `.env.local` / `.env.example` — `.env*` writes are blocked here): `STORAGE_DRIVER=sqlite`, `SQLITE_PATH=./.data/app.db`.
- **Wrangler config is out of scope for this plan** — the `d1.ts` adapter reads the `DB` binding from `getCloudflareContext().env`, but adding the `d1_databases` binding to `wrangler.jsonc` and re-running `cf-typegen` will be handled separately by the user. Until that's done, `CloudflareEnv.DB` may be untyped; the adapter can cast/guard as needed.
- D1 schema applied via `ensureSchema()` on first use for the POC; SQLite via `ensureSchema()` on open.

---

## Stage 3 — Minimal auth + load route skeletons  *(commit)*

- **`app/api/auth/route.ts`** — `export async function GET(request)` reading `code`, `scope`, `context` from `request.nextUrl.searchParams`; returns a placeholder 200 for now.
- **`app/api/load/route.ts`** — `GET` reading `signed_payload_jwt`; placeholder 200.

(Callback URLs registered in the BC Developer Portal will be `${APP_ORIGIN}/api/auth` and `${APP_ORIGIN}/api/load`.)

---

## Stage 4 — OAuth handshake logic  *(commit)*

- **`lib/bigcommerce/oauth.ts`**:
  - `exchangeCode(params)` → `POST ${BC_LOGIN_URL}/oauth2/token` (default `https://login.bigcommerce.com`) with JSON `{ client_id, client_secret, code, context, scope, grant_type: "authorization_code", redirect_uri }`; returns `{ access_token, scope, user: {id, email, username}, context, account_uuid }`.
  - `verifySignedPayload(jwt)` → `jose.jwtVerify` with `HS256` and `APP_CLIENT_SECRET` (as `TextEncoder` key); validate `iss === "bc"` and `aud === APP_CLIENT_ID`; return claims `{ sub: "stores/{hash}", user: {id, email}, owner: {id, email} }`.
  - helper `storeHashFromContext("stores/abc")` → `"abc"`.
- **`app/api/auth/route.ts`** — call `exchangeCode`, derive `storeHash`, then `store.upsertStore`, `store.upsertUser`, `store.linkStoreUser`; respond (redirect to `/` is fine — the real session is set on load).
- **`app/api/load/route.ts`** — call `verifySignedPayload`, derive `storeHash` + user; optionally confirm the store exists in storage.
- Env vars to provide: `APP_CLIENT_ID`, `APP_CLIENT_SECRET`, `APP_ORIGIN`, `AUTH_CALLBACK=${APP_ORIGIN}/api/auth`, `BC_LOGIN_URL` (optional).

---

## Stage 5 — Session JWT cookie in /load  *(commit)*

- **`lib/session.ts`**:
  - `createSession({ userId, name, storeHash })` → `jose.SignJWT` (`HS256`, `JWT_SECRET`), short TTL (e.g. `1h`).
  - `readSession()` → read the cookie via `next/headers` `cookies()`, `jwtVerify`, return claims or null.
  - `SESSION_COOKIE = "bc_app_session"`.
- **`app/api/load/route.ts`** — after verification, mint the session JWT with **user name, user id, store hash**, set it on a redirect response to `/` with attributes: `HttpOnly; Secure; SameSite=None; Path=/` (use `NextResponse.redirect(...).cookies.set(...)` or a `Set-Cookie` header). New env var to provide: `JWT_SECRET`.

---

## Stage 6 — Wire `getStoreToken` / `getStoreHash` to session + storage  *(commit)*

> Placed after Stage 5 (not immediately after Stage 4) because `getStoreHash()` reads the session via `readSession()` from `lib/session.ts`, which Stage 5 creates — so it can't compile or function before the session module exists.

- **`lib/bigcommerce/auth.ts`** — implement the `"multiTenant"` branches that currently throw:
  - `getStoreHash()` → return the store hash from `readSession()`; throw (unauthenticated) when there's no valid session.
  - `getStoreToken()` → `(await getTokenStore()).getStoreToken(await getStoreHash())`; throw when the store has no stored token.
  - Both become **async** (storage + cookie reads are async). Static mode keeps returning its env values, just wrapped to the same Promise-returning signature.
- **Callers** — update `lib/bigcommerce/client.ts` (`bigCommerceRequest` is already async → `await getStoreHash()` / `await getStoreToken()`) and any other call sites. No change needed in `lib/bigcommerce/gift-certificates.ts` — it routes through `client.ts`.
- Result: with `STATIC_MODE=false`, the existing gift-certificate data layer transparently uses the OAuth'd, per-store token from storage, keyed by the session's store hash — no `STATIC_STORE_*` env required.

---

## Stage 7 — Home-page cookie verification  *(commit)*

- **`app/page.tsx`** — call `readSession()` (server component) and render a small banner: **"Signed in as {name} — store {storeHash}"** when present, else a "no session" note. This confirms the `SameSite=None` cookie is sent on requests inside the BigCommerce iframe. (Remove the `after()` debug scaffolding while here if desired.)

---

## Critical files

- New: `lib/storage/{types,schema,sqlite,d1,index}.ts`, `lib/bigcommerce/oauth.ts`, `lib/session.ts`, `app/api/auth/route.ts`, `app/api/load/route.ts`
- Modified: `lib/bigcommerce/auth.ts` (implement multi-tenant getters, now async) + `lib/bigcommerce/client.ts` (await them), `app/page.tsx` (session readout), `package.json`, `.env.example` (+ `.env.local`, user-created)
- Not modified here (user handles separately): `wrangler.jsonc` (D1 binding + `cf-typegen`)
- Reuse: `lib/bigcommerce/client.ts` patterns; the `auth.ts` `isStaticMode`/env-flag style for `STORAGE_DRIVER`; `getCloudflareContext` (already a dependency) for the D1 binding.

## Verification

- **Per stage:** `npx tsc --noEmit`, `npx eslint .`, `npm run build` stay green.
- **End-to-end install (the real test):** `SameSite=None` cookies require HTTPS, and BC must reach the callbacks, so run dev behind an HTTPS tunnel (e.g. cloudflared/ngrok), set `APP_ORIGIN` + the Auth/Load callback URLs in the BC Developer Portal to the tunnel, then **Install** the app:
  1. BC calls `/api/auth` → token exchanged → `stores`/`users`/`store_users` rows written (verify by inspecting `./.data/app.db` with `sqlite3`).
  2. App loads → BC calls `/api/load` → session cookie set → redirect to `/`.
  3. Home page renders **"Signed in as {name} — store {hash}"** *inside the iframe* → confirms the `SameSite=None` cookie is delivered cross-site.
- **Storage selector:** default (`STORAGE_DRIVER=sqlite`) locally; `=d1` exercised only on Cloudflare (D1 db creation + deploy is the GRC-gated follow-up, not part of this plan).
- **Multi-tenant getters (Stage 6):** with `STATIC_MODE=false` and a valid session cookie, loading a gift-certificate page resolves the store hash from the session and the token from storage and hits the live API — with no `STATIC_STORE_*` env set.

## Notes / risks

- **better-sqlite3 must not be bundled into the Worker** — the `getTokenStore` factory dynamic-imports adapters so the native module is only loaded under `sqlite`.
- **`.env` writes are blocked** in this environment; the implementer will paste the listed vars into `.env.local` / `.env.example`.
- Making `getStoreToken`/`getStoreHash` **async** (Stage 6) ripples to their callers — audit every call site (currently `lib/bigcommerce/client.ts`) and `await` them. Static mode keeps working; only the multi-tenant branches change behavior.
