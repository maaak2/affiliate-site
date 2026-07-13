import Link from "next/link";
import { listReviews } from "@/lib/reviews";
import { listCategories, getCategoryName } from "@/lib/categories";
import DeleteButton from "@/components/admin/DeleteButton";
import PublishToggle from "@/components/admin/PublishToggle";
import { adminHref } from "@/lib/adminPath";

export default async function AdminHomePage() {
  const [reviews, categories] = await Promise.all([listReviews(), listCategories()]);
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <Link
          href={adminHref("/new")}
          className="rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700"
        >
          + Add review
        </Link>
      </div>

      {reviews.length === 0 ? (
        <p className="mt-6 text-foreground/60">
          No reviews yet. Add your first one.
        </p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="text-left border-b border-black/10">
              <th className="py-2">Title</th>
              <th className="py-2">Category</th>
              <th className="py-2">Rating</th>
              <th className="py-2">Price</th>
              <th className="py-2">Published on</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => {
              const category = categoryMap.get(review.categorySlug);
              return (
                <tr
                  key={review.slug}
                  className={`border-b border-black/10 last:border-0 ${
                    review.published ? "" : "bg-black/[0.03] dark:bg-white/[0.03]"
                  }`}
                >
                  <td className="py-2">
                    {review.translations.en.title}
                    {!review.published && (
                      <span className="ms-2 rounded bg-foreground/10 px-1.5 py-0.5 text-xs text-foreground/60">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="py-2">
                    {category ? getCategoryName(category, "en") : review.categorySlug}
                  </td>
                  <td className="py-2">★ {review.rating}</td>
                  <td className="py-2">
                    {review.price.amount} {review.price.currency}
                  </td>
                  <td className="py-2">{review.publishedAt}</td>
                  <td className="py-2">
                    <PublishToggle slug={review.slug} published={review.published} />
                  </td>
                  <td className="py-2 text-right space-x-3">
                    <Link
                      href={adminHref(`/${review.slug}/edit`)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton slug={review.slug} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
