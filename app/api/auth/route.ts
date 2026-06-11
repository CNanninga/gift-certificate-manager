import { NextRequest, NextResponse } from "next/server";
import { appUrl, exchangeCode, storeHashFromContext } from "@/lib/bigcommerce/oauth";
import { getTokenStore } from "@/lib/storage";

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

    // BigCommerce loads the app (calling /api/load) right after install, where
    // the session cookie is minted — so a redirect to the app root is enough.
    return NextResponse.redirect(appUrl("/"), { status: 302 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
