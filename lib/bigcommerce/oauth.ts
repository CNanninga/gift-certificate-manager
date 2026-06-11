import { jwtVerify } from "jose";

/**
 * BigCommerce single-click app OAuth handshake helpers.
 *
 * Two callbacks make up the install/load flow:
 *   - `/api/auth` (install): exchange the one-time `code` for a permanent token
 *     via `exchangeCode`, then persist it.
 *   - `/api/load` (every open): verify the `signed_payload_jwt` BigCommerce
 *     sends via `verifySignedPayload`, then start a session.
 */

const BC_LOGIN_URL = process.env.BC_LOGIN_URL ?? "https://login.bigcommerce.com";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

/** The control-panel user as returned by the token-exchange response. */
export interface OAuthUser {
  id: number;
  email: string;
  username: string;
}

/** Successful response from the OAuth token-exchange endpoint. */
export interface ExchangeCodeResult {
  access_token: string;
  scope: string;
  user: OAuthUser;
  /** Store context string, e.g. `stores/abc123`. */
  context: string;
  account_uuid: string;
}

/** The `code` / `scope` / `context` query params from the install callback. */
export interface AuthCallbackParams {
  code: string;
  scope: string;
  context: string;
}

/**
 * Exchanges the install `code` for a permanent access token. Mirrors the BC
 * docs: POST JSON to `/oauth2/token` with the app credentials + callback params.
 */
export async function exchangeCode(
  params: AuthCallbackParams,
): Promise<ExchangeCodeResult> {
  const redirectUri =
    process.env.AUTH_CALLBACK ?? `${requireEnv("APP_ORIGIN")}/api/auth`;

  const response = await fetch(`${BC_LOGIN_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: requireEnv("APP_CLIENT_ID"),
      client_secret: requireEnv("APP_CLIENT_SECRET"),
      code: params.code,
      context: params.context,
      scope: params.scope,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `OAuth token exchange failed: ${response.status} ${response.statusText} ${detail}`,
    );
  }

  return (await response.json()) as ExchangeCodeResult;
}

/** Verified claims of the load callback's `signed_payload_jwt`. */
export interface SignedPayload {
  aud: string;
  iss: string;
  /** Store context string, e.g. `stores/abc123`. */
  sub: string;
  /** The user opening the app. The load JWT carries id + email (no username). */
  user: { id: number; email: string; locale?: string };
  owner: { id: number; email: string };
}

/**
 * Verifies the load callback JWT (HS256, signed with the app's client secret)
 * and asserts the expected issuer/audience. Throws on any failure.
 */
export async function verifySignedPayload(token: string): Promise<SignedPayload> {
  const secret = new TextEncoder().encode(requireEnv("APP_CLIENT_SECRET"));
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
    issuer: "bc",
    audience: requireEnv("APP_CLIENT_ID"),
  });
  return payload as unknown as SignedPayload;
}

/** Extracts the store hash from a `stores/{hash}` context (tolerates a bare hash). */
export function storeHashFromContext(context: string): string {
  return context.split("/")[1] ?? context;
}
