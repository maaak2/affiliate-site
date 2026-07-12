import type { NextRequest } from "next/server";

/** Origins allowed to make state-changing requests, built from NEXT_PUBLIC_SITE_URL (plus its
 * apex/www counterpart). We deliberately don't rely on the request's own Host header — behind
 * Netlify's custom-domain proxying, the Host a serverless function actually receives can differ
 * from what the browser sent as Origin, which made this check reject every real request. */
function getTrustedOrigins(): string[] {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return [];

  try {
    const url = new URL(siteUrl);
    const origins = new Set([url.origin]);
    if (url.hostname.startsWith("www.")) {
      origins.add(`${url.protocol}//${url.hostname.slice(4)}`);
    } else {
      origins.add(`${url.protocol}//www.${url.hostname}`);
    }
    return [...origins];
  } catch {
    return [];
  }
}

/** Defense-in-depth alongside the SameSite=Lax session cookie: reject any state-changing
 * request that declares a cross-origin Origin header. Same-origin requests (including native
 * form posts and fetch() calls from our own pages) always send a matching Origin or none at all. */
export function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const trusted = getTrustedOrigins();
  if (trusted.includes(origin)) return true;

  // Fallback for local dev / previews where NEXT_PUBLIC_SITE_URL may not match the port in use.
  return origin === request.nextUrl.origin;
}
