import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { listReviews } from "@/lib/reviews";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";

// Keep in sync with the homepage/review pages: always read the content
// folder fresh so newly-added reviews appear without a rebuild.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [reviews, categories, tags] = await Promise.all([
    listReviews({ publishedOnly: true }),
    listCategories(),
    listTags(),
  ]);

  const paths = [
    "/",
    "/categories",
    "/about",
    "/privacy",
    "/affiliate-disclosure",
    ...reviews.map((review) => `/reviews/${review.slug}`),
    ...categories.map((category) => `/categories/${category.slug}`),
    ...tags.map((tag) => `/tags/${tag.slug}`),
  ];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: new URL(getPathname({ locale, href: path }), siteUrl).toString(),
      lastModified: new Date(),
    }))
  );
}
