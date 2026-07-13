import { getPathname } from "@/i18n/navigation";
import type { Category } from "./categories";
import type { Review } from "./reviews";
import type { Locale } from "@/i18n/routing";

/** The exact JSON-LD a review page outputs — shared so the admin structured-data checker can
 * never drift from what actually gets rendered. */
export function buildReviewJsonLd(
  review: Review,
  category: Category | null,
  locale: Locale,
  siteUrl: string
) {
  const translation = review.translations[locale] ?? review.translations.en;
  const thumbnail = review.media.find((item) => item.type === "photo");

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": category?.schemaType ?? "Product",
      name: translation.title,
      image: thumbnail?.url,
      offers: review.affiliateLinks.map((link) => ({
        "@type": "Offer",
        url: link.url,
        price: review.price.amount,
        priceCurrency: review.price.currency,
      })),
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 0,
    },
    author: {
      "@type": "Organization",
      name: locale === "ar" ? "تجارب محمود" : "Mahmoud Tries",
    },
    datePublished: review.publishedAt,
    reviewBody: translation.summary,
    url: `${siteUrl}${getPathname({ locale, href: `/reviews/${review.slug}` })}`,
  };
}
