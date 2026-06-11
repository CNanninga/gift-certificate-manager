import { NextRequest, NextResponse } from "next/server";
import { storeHashFromContext, verifySignedPayload } from "@/lib/bigcommerce/oauth";
import { getTokenStore } from "@/lib/storage";
import { startSessionRedirect } from "@/lib/session";

/**
 * BigCommerce load callback (`/api/load`). Every time the app is opened inside
 * the BigCommerce control panel, BigCommerce redirects here with a
 * `signed_payload_jwt`. We verify it, identify the store + user, and confirm
 * the store is installed. The session cookie is added in a later stage.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get("signed_payload_jwt");

  if (!token) {
    return NextResponse.json(
      { status: "error", message: "Missing signed_payload_jwt" },
      { status: 400 },
    );
  }

  try {
    const payload = await verifySignedPayload(token);
    const storeHash = storeHashFromContext(payload.sub);

    const store = await getTokenStore();
    await store.ensureSchema();
    const storedToken = await store.getStoreToken(storeHash);
    if (!storedToken) {
      return NextResponse.json(
        { status: "error", message: "Store is not installed" },
        { status: 403 },
      );
    }

    return startSessionRedirect({
      userId: payload.user.id,
      name: payload.user.email,
      storeHash,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
