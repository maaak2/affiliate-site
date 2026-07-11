import { listReviews } from "@/lib/reviews";
import { listCategories, getCategoryName } from "@/lib/categories";

export default async function AdminMonitoringPage() {
  const [reviews, categories] = await Promise.all([listReviews(), listCategories()]);

  const counts = new Map<string, number>();
  for (const review of reviews) {
    counts.set(review.categorySlug, (counts.get(review.categorySlug) ?? 0) + 1);
  }
  const maxCount = Math.max(1, ...categories.map((category) => counts.get(category.slug) ?? 0));

  return (
    <div>
      <h1 className="text-2xl font-bold">Monitoring</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">Content stats</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-black/10 p-4">
            <div className="text-sm text-foreground/60">Total reviews</div>
            <div className="text-3xl font-bold">{reviews.length}</div>
          </div>
          <div className="rounded-lg border border-black/10 p-4">
            <div className="text-sm text-foreground/60">Total categories</div>
            <div className="text-3xl font-bold">{categories.length}</div>
          </div>
        </div>

        <h3 className="mt-6 text-sm font-medium text-foreground/70">Reviews per category</h3>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/60">No categories yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {categories.map((category) => {
              const count = counts.get(category.slug) ?? 0;
              const width = (count / maxCount) * 100;
              return (
                <div key={category.slug}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{getCategoryName(category, "en")}</span>
                    <span className="text-foreground/60">{count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded bg-black/5 dark:bg-white/10">
                    <div className="h-2 rounded bg-blue-600" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">
          Traffic analytics
        </h2>
        <p className="mt-4 text-sm text-foreground/70">
          Traffic is tracked via{" "}
          <a
            href="https://cloud.umami.is"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Umami
          </a>
          . Page views, and affiliate link clicks tagged with the review and which link (first or
          second) was clicked, are already being sent — view them live in your Umami dashboard.
          Pulling a summary of this data into this page is a follow-up.
        </p>
      </section>
    </div>
  );
}
