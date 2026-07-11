/** The admin panel is served from this path instead of the guessable "/admin".
 * Safe to expose to the client — anyone on the admin panel already sees the path in their URL bar,
 * and this only protects against automated scanners hitting well-known paths, not a logged-in user. */
export function getAdminPath(): string {
  return process.env.NEXT_PUBLIC_ADMIN_PATH?.trim() || "admin";
}

/** Builds a same-origin admin URL, e.g. adminHref("/new") -> "/my-secret-path/new". */
export function adminHref(subpath: string = ""): string {
  const base = `/${getAdminPath()}`;
  if (!subpath) return base;
  return `${base}${subpath.startsWith("/") ? subpath : `/${subpath}`}`;
}
