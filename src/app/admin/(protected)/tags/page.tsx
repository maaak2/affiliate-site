import { listTags } from "@/lib/tags";
import { listReviews } from "@/lib/reviews";
import TagsAdmin from "@/components/admin/TagsAdmin";

export default async function AdminTagsPage() {
  const [tags, reviews] = await Promise.all([listTags(), listReviews()]);

  const counts = new Map<string, number>();
  for (const review of reviews) {
    for (const tagSlug of review.tags) {
      counts.set(tagSlug, (counts.get(tagSlug) ?? 0) + 1);
    }
  }

  const rows = tags.map((tag) => ({
    slug: tag.slug,
    nameEn: tag.translations.en.name,
    nameAr: tag.translations.ar.name,
    reviewCount: counts.get(tag.slug) ?? 0,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Tags</h1>
      <div className="mt-6">
        <TagsAdmin initialTags={rows} />
      </div>
    </div>
  );
}
