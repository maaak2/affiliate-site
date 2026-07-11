/** In-memory login attempt limiter. This resets on server restart / across cold serverless
 * instances — acceptable here since this app already assumes a persistent writable filesystem
 * for content storage, implying a long-lived Node process rather than stateless serverless. */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, { count: number; firstAttemptAt: number }>();

function prune(key: string): void {
  const entry = attempts.get(key);
  if (entry && Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    attempts.delete(key);
  }
}

export function isLockedOut(key: string): boolean {
  prune(key);
  const entry = attempts.get(key);
  return entry !== undefined && entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
  prune(key);
  const entry = attempts.get(key);
  if (!entry) {
    attempts.set(key, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}

export function clientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
