import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { adminHref } from "@/lib/adminPath";
import { isTrustedOrigin } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const response = NextResponse.redirect(
    new URL(adminHref("/login"), request.url),
    303
  );
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
