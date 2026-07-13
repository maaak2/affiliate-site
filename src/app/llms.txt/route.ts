import { NextResponse } from "next/server";
import { listCategories, getCategoryName } from "@/lib/categories";
import { getSeoSettings } from "@/lib/seoSettings";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const DEFAULT_DESCRIPTION =
  "Mahmoud Tries is a bilingual (Arabic/English) affiliate review site. The owner personally " +
  "tests and reviews hotels, electronics, home goods, and services, publishing honest write-ups " +
  "with ratings out of 5 and affiliate links for purchasing or booking the reviewed item.";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [settings, categories] = await Promise.all([getSeoSettings(), listCategories()]);

  const description = settings.llmsDescription || DEFAULT_DESCRIPTION;
  const languages = routing.locales.map((locale) => (locale === "ar" ? "Arabic" : "English")).join(", ");

  const lines = [
    "# Mahmoud Tries",
    "",
    `> ${description}`,
    "",
    `Languages: ${languages}. Content type: product/service/hotel reviews with ratings, pros/cons, and affiliate purchase links.`,
    "",
    "## Main pages",
    `- [Latest reviews](${siteUrl}/en): all reviews, newest first.`,
    `- [Categories](${siteUrl}/en/categories): browse reviews by category.`,
    `- [About](${siteUrl}/en/about): who runs this site.`,
    "",
    "## Categories",
    ...categories.map(
      (category) => `- [${getCategoryName(category, "en")}](${siteUrl}/en/categories/${category.slug})`
    ),
    "",
    "## Policies",
    `- [Privacy policy](${siteUrl}/en/privacy)`,
    `- [Affiliate disclosure](${siteUrl}/en/affiliate-disclosure)`,
  ];

  return new NextResponse(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
