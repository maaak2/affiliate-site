import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getTag, getTagName, listTags } from "@/lib/tags";
import { listReviewsByTag } from "@/lib/reviews";
import { listCategories, getCategoryName } from "@/lib/categories";
import ReviewCard from "@/components/ReviewCard";
import { routing, type Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const tags = await listTags();
  return routing.locales.flatMap((locale) =>
    tags.map((tag) => ({ locale, tag: tag.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}): Promise<Metadata> {
  const { locale, tag: tagSlug } = await params;
  const tag = await getTag(tagSlug);
  if (!tag) return {};
  return { title: getTagName(tag, locale as Locale) };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}) {
  const { locale, tag: tagSlug } = await params;
  const tag = await getTag(tagSlug);
  if (!tag) notFound();

  const [reviews, categories] = await Promise.all([
    listReviewsByTag(tagSlug),
    listCategories(),
  ]);
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));
  const t = await getTranslations("home");
  const tagName = getTagName(tag, locale as Locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">#{tagName}</h1>

      {reviews.length === 0 ? (
        <p className="mt-8 text-foreground/60">{t("noReviews")}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => {
            const category = categoryMap.get(review.categorySlug);
            const categoryName = category
              ? getCategoryName(category, locale as Locale)
              : review.categorySlug;
            return (
              <ReviewCard
                key={review.slug}
                review={review}
                locale={locale as Locale}
                categoryName={categoryName}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
