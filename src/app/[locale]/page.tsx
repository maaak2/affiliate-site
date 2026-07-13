import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { listReviews } from "@/lib/reviews";
import { listCategories, getCategoryName } from "@/lib/categories";
import { getSeoSettings } from "@/lib/seoSettings";
import ReviewCard from "@/components/ReviewCard";
import type { Locale } from "@/i18n/routing";

// Always read the content folder fresh so reviews added via /admin show up
// immediately, instead of only after a rebuild.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSeoSettings();
  const loc = locale as Locale;
  const title = settings.homepageMetaTitle[loc]?.trim();
  const description = settings.homepageMetaDescription[loc]?.trim();

  // Omit unset keys entirely rather than setting them to undefined — Next.js treats an
  // explicit `title: undefined` as "clear this," not "inherit the parent layout's title,"
  // which otherwise wipes out the site default when no override is configured.
  return {
    // "absolute" so this doesn't get wrapped by the root layout's "%s | Mahmoud Tries" template
    // — an admin-provided title is meant to be the exact, complete title.
    ...(title ? { title: { absolute: title } } : {}),
    ...(description ? { description } : {}),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const [reviews, categories] = await Promise.all([listReviews(), listCategories()]);
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("heading")}</h1>
      <p className="mt-2 text-foreground/70">{t("subheading")}</p>

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
