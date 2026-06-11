import { NextRequest, NextResponse } from "next/server";

/**
 * BigCommerce load callback (`/api/load`). Every time the app is opened inside
 * the BigCommerce control panel, BigCommerce redirects here with a
 * `signed_payload_jwt`. This skeleton just acknowledges it; JWT verification
 * and the session cookie are wired up in later stages.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const signedPayloadJwt =
    request.nextUrl.searchParams.get("signed_payload_jwt");

  return NextResponse.json({ status: "ok", received: Boolean(signedPayloadJwt) });
}
