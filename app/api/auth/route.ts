import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, storeHashFromContext } from "@/lib/bigcommerce/oauth";
import { getTokenStore } from "@/lib/storage";
import { startSessionRedirect } from "@/lib/session";

/**
 * BigCommerce OAuth install callback (`/api/auth`). After a merchant authorizes
 * the single-click app, BigCommerce redirects here with `code`, `scope`, and
 * `context`. We exchange the code for a permanent token and persist the store,
 * user, and their link. The session cookie itself is set on the load callback.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const scope = params.get("scope");
  const context = params.get("context");

  if (!code || !scope || !context) {
    return NextResponse.json(
      { status: "error", message: "Missing code, scope, or context" },
      { status: 400 },
    );
  }

  try {
    const result = await exchangeCode({ code, scope, context });
    const storeHash = storeHashFromContext(result.context);

    const store = await getTokenStore();
    await store.ensureSchema();
    await store.upsertStore({
      storeHash,
      accessToken: result.access_token,
      scope: result.scope,
    });
    await store.upsertUser({
      id: result.user.id,
      email: result.user.email,
      username: result.user.username,
    });
    await store.linkStoreUser(storeHash, result.user.id);

    // Start the session here too: on fresh install BigCommerce drops the user
    // straight at the app root, not always via /api/load.
    return startSessionRedirect({
      userId: result.user.id,
      name: result.user.email,
      storeHash,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
