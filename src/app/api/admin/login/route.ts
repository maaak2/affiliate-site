import { NextRequest, NextResponse } from "next/server";
import {
  checkPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { adminHref } from "@/lib/adminPath";
import { isTrustedOrigin } from "@/lib/csrf";
import { clearAttempts, clientKey, isLockedOut, recordFailedAttempt } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const key = clientKey(request);
  if (isLockedOut(key)) {
    return NextResponse.redirect(
      new URL(`${adminHref("/login")}?error=locked`, request.url),
      303
    );
  }

  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");

  if (!checkPassword(password)) {
    recordFailedAttempt(key);
    return NextResponse.redirect(
      new URL(`${adminHref("/login")}?error=1`, request.url),
      303
    );
  }

  clearAttempts(key);

  const response = NextResponse.redirect(new URL(adminHref(), request.url), 303);
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
