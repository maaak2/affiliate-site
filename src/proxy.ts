import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getAdminPath } from "./lib/adminPath";

const intlMiddleware = createMiddleware(routing);

// 'unsafe-inline' on script-src is a deliberate tradeoff: Next.js injects its own inline
// hydration/RSC payload scripts, and safely nonce-ing those requires request-header
// propagation that can't be verified without a real browser in this environment. The
// host allowlist still blocks the main XSS delivery vector (loading a remote attacker
// script from a different origin), and every other directive stays strict.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cloud.umami.is",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "media-src 'self' https:",
  "font-src 'self'",
  "connect-src 'self' https://cloud.umami.is",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminPath = getAdminPath();

  // API routes handle their own auth/CSRF checks; nothing to rewrite here.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Once a custom ADMIN_PATH is set, the literal "/admin" implementation path must never
  // resolve directly — otherwise the panel would be reachable at both the real and secret paths.
  if (adminPath !== "admin" && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    const response = NextResponse.rewrite(new URL(`/__not_found__${pathname}`, request.url));
    response.headers.set("Content-Security-Policy", CSP);
    return response;
  }

  // Transparently serve the real /admin implementation from the configured path. When
  // ADMIN_PATH is unset this is a no-op rewrite of "/admin" -> "/admin".
  if (pathname === `/${adminPath}` || pathname.startsWith(`/${adminPath}/`)) {
    const rewrittenPath = "/admin" + pathname.slice(adminPath.length + 1);
    const response = NextResponse.rewrite(new URL(rewrittenPath, request.url));
    response.headers.set("Content-Security-Policy", CSP);
    return response;
  }

  const response = intlMiddleware(request);
  response.headers.set("Content-Security-Policy", CSP);
  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
