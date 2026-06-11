import { NextRequest, NextResponse } from "next/server";

/**
 * BigCommerce OAuth install callback (`/api/auth`). After a merchant authorizes
 * the single-click app, BigCommerce redirects here with `code`, `scope`, and
 * `context` query params. This skeleton just acknowledges the callback; the
 * token exchange + persistence is wired up in a later stage.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = request.nextUrl.searchParams;
  const received = params.has("code") && params.has("context");

  return NextResponse.json({ status: "ok", received });
}
