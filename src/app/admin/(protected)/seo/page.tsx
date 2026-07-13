import { getSeoSettings } from "@/lib/seoSettings";
import { listReviews, getReview } from "@/lib/reviews";
import { listCategories, getCategory } from "@/lib/categories";
import { listTags } from "@/lib/tags";
import { buildReviewJsonLd } from "@/lib/structuredData";
import SeoSettingsForm from "@/components/admin/SeoSettingsForm";
import type { Locale } from "@/i18n/routing";

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; locale?: string }>;
}) {
  const { slug, locale: localeParam } = await searchParams;
  const checkerLocale = (localeParam === "ar" ? "ar" : "en") as Locale;

  const [settings, reviews, categories, tags] = await Promise.all([
    getSeoSettings(),
    listReviews(),
    listCategories(),
    listTags(),
  ]);
  const publishedCount = reviews.filter((review) => review.published).length;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const selectedSlug = slug || reviews[0]?.slug;
  const selectedReview = selectedSlug ? await getReview(selectedSlug) : null;
  const selectedCategory = selectedReview ? await getCategory(selectedReview.categorySlug) : null;
  const jsonLd = selectedReview
    ? buildReviewJsonLd(selectedReview, selectedCategory, checkerLocale, siteUrl)
    : null;
  const reviewUrl = selectedReview
    ? `${siteUrl}/${checkerLocale}/reviews/${selectedReview.slug}`
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold">Digital Marketing / SEO</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">Site-wide defaults</h2>
        <div className="mt-4">
          <SeoSettingsForm initialSettings={settings} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">Sitemap</h2>
        <p className="mt-4 text-sm">
          <a
            href={`${siteUrl}/sitemap.xml`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {siteUrl}/sitemap.xml
          </a>
        </p>
        <p className="mt-2 text-sm text-foreground/60">
          Updates automatically — currently lists {publishedCount} published review
          {publishedCount === 1 ? "" : "s"}
          {reviews.length !== publishedCount &&
            ` (${reviews.length - publishedCount} hidden review${
              reviews.length - publishedCount === 1 ? "" : "s"
            } excluded)`}
          , {categories.length} categor{categories.length === 1 ? "y" : "ies"}, and {tags.length}{" "}
          tag{tags.length === 1 ? "" : "s"}, across both languages. No rebuild or manual step is
          needed when you add, edit, or remove content.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">
          Structured data checker
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-foreground/60">No reviews yet.</p>
        ) : (
          <>
            <form method="GET" className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-sm font-medium">Review</label>
                <select
                  name="slug"
                  defaultValue={selectedSlug}
                  className="mt-1 rounded border border-black/20 px-2 py-2 text-sm"
                >
                  {reviews.map((review) => (
                    <option key={review.slug} value={review.slug}>
                      {review.translations.en.title}
                      {!review.published ? " (Hidden)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Locale</label>
                <select
                  name="locale"
                  defaultValue={checkerLocale}
                  className="mt-1 rounded border border-black/20 px-2 py-2 text-sm"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white font-semibold hover:bg-blue-700"
              >
                View
              </button>
            </form>

            {jsonLd && reviewUrl && (
              <div className="mt-4">
                <a
                  href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(reviewUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Test this page on Google&apos;s Rich Results Test →
                </a>
                <pre className="mt-3 overflow-x-auto rounded bg-black/[0.03] p-4 text-xs dark:bg-white/[0.05]">
                  {JSON.stringify(jsonLd, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">llms.txt</h2>
        <p className="mt-4 text-sm">
          <a
            href={`${siteUrl}/llms.txt`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {siteUrl}/llms.txt
          </a>
        </p>
        <p className="mt-2 text-sm text-foreground/60">
          Describes the site for AI assistants that read it — name, purpose, languages, and main
          content types. Edit the description in the site-wide defaults section above; the
          category list updates automatically.
        </p>
      </section>
    </div>
  );
}
