import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { appUrl } from "@/lib/bigcommerce/oauth";

/**
 * The user's app session, carried in a JWT cookie.
 *
 * The cookie is `SameSite=None; Secure` so it's still sent on requests made
 * while the app runs inside BigCommerce's control-panel iframe (a cross-site
 * context). That requires HTTPS — locally, run behind an HTTPS tunnel.
 */

export const SESSION_COOKIE = "bc_app_session";
/** Session lifetime; the JWT `exp` and the cookie `Max-Age` are kept in sync. */
const SESSION_TTL_SECONDS = 60 * 60;

function sessionSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionData {
  /** BigCommerce user id. */
  userId: number;
  /** Display name for the signed-in user. */
  name: string;
  /** Store the session is scoped to. */
  storeHash: string;
}

/** Signs a session JWT (HS256) carrying the user id, name, and store hash. */
export async function createSession(data: SessionData): Promise<string> {
  return new SignJWT({ name: data.name, storeHash: data.storeHash })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(data.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(sessionSecret());
}

/** Reads + verifies the session cookie; returns the claims or null. */
export async function readSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, sessionSecret(), {
      algorithms: ["HS256"],
    });
    return {
      userId: Number(payload.sub),
      name: typeof payload.name === "string" ? payload.name : "",
      storeHash: typeof payload.storeHash === "string" ? payload.storeHash : "",
    };
  } catch {
    return null;
  }
}

/**
 * The cookie descriptor for an issued session token. `SameSite=None; Secure`
 * lets the cookie survive inside the BigCommerce iframe; `HttpOnly` keeps it
 * out of client JS.
 */
export function sessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/**
 * Mints a session JWT, sets it as the session cookie, and returns a redirect to
 * the app root. Both OAuth callbacks use this: `/api/auth` starts a session on
 * fresh install (BigCommerce drops the user straight at the app, not always via
 * `/api/load`), and `/api/load` (re)starts it on every subsequent open.
 */
export async function startSessionRedirect(
  data: SessionData,
): Promise<NextResponse> {
  const token = await createSession(data);
  const response = NextResponse.redirect(appUrl("/"), { status: 302 });
  response.cookies.set(sessionCookie(token));
  return response;
}
