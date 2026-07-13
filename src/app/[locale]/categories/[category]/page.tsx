import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCategory, getCategoryName } from "@/lib/categories";
import { listReviewsByCategory } from "@/lib/reviews";
import { getSeoSettings, renderCategoryTemplate } from "@/lib/seoSettings";
import ReviewCard from "@/components/ReviewCard";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category: categorySlug } = await params;
  const category = await getCategory(categorySlug);
  if (!category) return {};

  const loc = locale as Locale;
  const categoryName = getCategoryName(category, loc);
  const settings = await getSeoSettings();
  const titleTemplate = settings.categoryMetaTitleTemplate[loc]?.trim();
  const descriptionTemplate = settings.categoryMetaDescriptionTemplate[loc]?.trim();

  return {
    // A custom template is "absolute" (exact, not wrapped by the root layout's title template)
    // since the admin-provided text is meant to be the complete title. With no template set,
    // the bare category name keeps the existing "Hotels | Mahmoud Tries" suffixed behavior.
    title: titleTemplate ? { absolute: renderCategoryTemplate(titleTemplate, categoryName) } : categoryName,
    // Omitting the key entirely when unset (rather than `description: undefined`) — Next.js
    // treats an explicit undefined as "clear this," not "inherit," which would otherwise erase
    // the parent layout's default description on every category page.
    ...(descriptionTemplate
      ? { description: renderCategoryTemplate(descriptionTemplate, categoryName) }
      : {}),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category: categorySlug } = await params;
  const category = await getCategory(categorySlug);
  if (!category) notFound();

  const reviews = await listReviewsByCategory(categorySlug, { publishedOnly: true });
  const t = await getTranslations("home");
  const categoryName = getCategoryName(category, locale as Locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">{categoryName}</h1>

      {reviews.length === 0 ? (
        <p className="mt-8 text-foreground/60">{t("noReviews")}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.slug}
              review={review}
              locale={locale as Locale}
              categoryName={categoryName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
