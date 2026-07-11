import type { NextRequest } from "next/server";

/** Defense-in-depth alongside the SameSite=Lax session cookie: reject any state-changing
 * request that declares a cross-origin Origin header. Same-origin requests (including native
 * form posts and fetch() calls from our own pages) always send a matching Origin or none at all. */
export function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === request.nextUrl.origin;
}
