import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to .env.local.");
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function timingSafeStringsEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return timingSafeStringsEqual(candidate, expected);
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function isSessionTokenValid(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!timingSafeStringsEqual(signature, sign(payload))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() <= expiresAt;
}

/** Reads the admin session cookie from the current request and reports whether it's valid. */
export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  return isSessionTokenValid(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
