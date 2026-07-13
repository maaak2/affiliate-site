import type { MetadataRoute } from "next";
import { getSeoSettings, robotsDisallowPaths } from "@/lib/seoSettings";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const settings = await getSeoSettings();

  if (!settings.robotsAllowAll) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Deliberately not listing the admin path here — robots.txt is public, and disallow
      // entries would publish the exact path we're trying to keep unguessable. The real
      // "/admin" always 404s, and unauthenticated requests are rejected server-side regardless.
      disallow: robotsDisallowPaths(settings),
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
