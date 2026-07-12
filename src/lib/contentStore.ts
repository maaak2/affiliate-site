import { getStore } from "@netlify/blobs";

/** Netlify Blobs is the source of truth for all admin-editable content (reviews, categories,
 * tags). Local filesystem writes don't persist on Netlify's serverless functions, so this
 * replaces the old content/*.json files. Requires Netlify's runtime context — locally that
 * means running via `netlify dev`, not plain `next dev` (see README/CLAUDE.md). */
export function getContentStore() {
  return getStore("content");
}
