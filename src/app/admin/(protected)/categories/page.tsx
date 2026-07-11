import { listCategories } from "@/lib/categories";
import { listReviews } from "@/lib/reviews";
import CategoriesAdmin from "@/components/admin/CategoriesAdmin";

export default async function AdminCategoriesPage() {
  const [categories, reviews] = await Promise.all([listCategories(), listReviews()]);

  const counts = new Map<string, number>();
  for (const review of reviews) {
    counts.set(review.categorySlug, (counts.get(review.categorySlug) ?? 0) + 1);
  }

  const rows = categories.map((category) => ({
    slug: category.slug,
    nameEn: category.translations.en.name,
    nameAr: category.translations.ar.name,
    reviewCount: counts.get(category.slug) ?? 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories</h1>
      <div className="mt-6">
        <CategoriesAdmin initialCategories={rows} />
      </div>
    </div>
  );
}
