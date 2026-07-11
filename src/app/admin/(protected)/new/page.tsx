import ReviewForm from "@/components/admin/ReviewForm";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";

export default async function NewReviewPage() {
  const [categories, tags] = await Promise.all([listCategories(), listTags()]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Add a review</h1>
      <div className="mt-6">
        <ReviewForm categories={categories} tags={tags} />
      </div>
    </div>
  );
}
