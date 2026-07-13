import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link, getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getReview } from "@/lib/reviews";
import { getCategory, getCategoryName } from "@/lib/categories";
import { listTags, getTagName } from "@/lib/tags";
import { buildReviewJsonLd } from "@/lib/structuredData";
import AffiliateLink from "@/components/AffiliateLink";
import ReviewViewTracker from "@/components/ReviewViewTracker";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const review = await getReview(slug);
  if (!review || !review.published) return {};

  const translation =
    review.translations[locale as Locale] ?? review.translations.en;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const thumbnail = review.media.find((item) => item.type === "photo");

  const loc = locale as Locale;
  const metaTitle = review.seo.metaTitle[loc]?.trim() || translation.title;
  const metaDescription = review.seo.metaDescription[loc]?.trim() || translation.summary;
  const socialTitle = review.seo.socialTitle[loc]?.trim() || metaTitle;
  const socialDescription = review.seo.socialDescription[loc]?.trim() || metaDescription;
  const socialImage = review.seo.socialImage || thumbnail?.url;

  const languages = Object.fromEntries(
    routing.locales.map((loc) => [
      loc,
      new URL(
        getPathname({ locale: loc, href: `/reviews/${slug}` }),
        siteUrl
      ).toString(),
    ])
  );

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: getPathname({
        locale: locale as Locale,
        href: `/reviews/${slug}`,
      }),
      languages,
    },
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      images: socialImage ? [socialImage] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const review = await getReview(slug);
  if (!review || !review.published) notFound();

  const category = await getCategory(review.categorySlug);
  const allTags = await listTags();
  const reviewTags = allTags.filter((tag) => review.tags.includes(tag.slug));
  const translation =
    review.translations[locale as Locale] ?? review.translations.en;
  const t = await getTranslations("review");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = buildReviewJsonLd(review, category, locale as Locale, siteUrl);

  const paragraphs = translation.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        // Escape "<" so a title/summary containing "</script>" can't break out of this tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ReviewViewTracker reviewSlug={review.slug} locale={locale} />

      <Link href="/" className="text-sm text-blue-600 hover:underline">
        {locale === "ar" ? "→" : "←"} {t("backToHome")}
      </Link>

      {category && (
        <div className="mt-4">
          <Link
            href={`/categories/${category.slug}`}
            className="text-xs font-medium uppercase tracking-wide text-blue-600 hover:underline"
          >
            {getCategoryName(category, locale as Locale)}
          </Link>
        </div>
      )}

      {reviewTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {reviewTags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs text-foreground/70 hover:border-blue-600 hover:text-blue-600"
            >
              #{getTagName(tag, locale as Locale)}
            </Link>
          ))}
        </div>
      )}

      {review.media.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {review.media.map((item, index) =>
            item.type === "video" ? (
              <video
                key={index}
                src={item.url}
                controls
                className="w-full rounded-lg sm:col-span-2 max-h-96"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={item.url}
                alt={translation.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">{translation.title}</h1>
        <span className="text-lg font-semibold text-amber-600">
          ★ {review.rating}{" "}
          <span className="text-sm text-foreground/60">/ 5</span>
        </span>
      </div>

      <p className="mt-4 text-sm text-foreground/60">
        {t("publishedOn")} {review.publishedAt}
      </p>

      <div className="mt-6 space-y-4 text-foreground/90 leading-relaxed">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="font-semibold text-green-700">{t("pros")}</h2>
          <ul className="mt-2 list-disc ps-5 space-y-1">
            {translation.pros.map((pro, i) => (
              <li key={i}>{pro}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-red-700">{t("cons")}</h2>
          <ul className="mt-2 list-disc ps-5 space-y-1">
            {translation.cons.map((con, i) => (
              <li key={i}>{con}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4 flex-wrap">
        <span className="text-2xl font-bold">
          {review.price.amount} {review.price.currency}
        </span>
        {review.promoCode && (
          <span className="rounded bg-green-50 px-3 py-1 text-sm font-medium text-green-800">
            {t("promoCode")}: {review.promoCode}
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {review.affiliateLinks.map((link, index) => (
          <AffiliateLink
            key={index}
            href={link.url}
            reviewSlug={review.slug}
            position={(index + 1) as 1 | 2}
            label={link.label}
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
          >
            {review.affiliateLinks.length > 1
              ? `${t("checkPrice")} — ${link.label}`
              : t("checkPrice")}
          </AffiliateLink>
        ))}
      </div>
    </article>
  );
}
