import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Deliberately not listing the admin path here — robots.txt is public, and disallow
      // entries would publish the exact path we're trying to keep unguessable. The real
      // "/admin" always 404s, and unauthenticated requests are rejected server-side regardless.
      disallow: ["/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
