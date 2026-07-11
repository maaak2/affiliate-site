import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Review } from "@/lib/reviews";
import type { Locale } from "@/i18n/routing";

export default async function ReviewCard({
  review,
  locale,
  categoryName,
}: {
  review: Review;
  locale: Locale;
  categoryName: string;
}) {
  const t = await getTranslations("home");
  const translation = review.translations[locale] ?? review.translations.en;
  const thumbnail = review.media.find((item) => item.type === "photo");

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/reviews/${review.slug}`}>
        {thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail.url}
            alt={translation.title}
            className="w-full h-48 object-cover"
          />
        )}
      </Link>
      <div className="p-4">
        <Link
          href={`/categories/${review.categorySlug}`}
          className="text-xs font-medium uppercase tracking-wide text-blue-600 hover:underline"
        >
          {categoryName}
        </Link>
        <Link href={`/reviews/${review.slug}`} className="block">
          <div className="flex items-start justify-between gap-2 mt-1">
            <h2 className="font-semibold text-lg">{translation.title}</h2>
            <span className="shrink-0 text-sm font-medium text-amber-600">
              ★ {review.rating}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground/70">{translation.summary}</p>
          <span className="mt-3 inline-block text-sm font-medium text-blue-600">
            {t("readMore")} {locale === "ar" ? "←" : "→"}
          </span>
        </Link>
      </div>
    </div>
  );
}
