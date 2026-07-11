import { notFound } from "next/navigation";
import { getReview } from "@/lib/reviews";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";
import ReviewForm from "@/components/admin/ReviewForm";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [review, categories, tags] = await Promise.all([
    getReview(slug),
    listCategories(),
    listTags(),
  ]);
  if (!review) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit review</h1>
      <div className="mt-6">
        <ReviewForm initialReview={review} categories={categories} tags={tags} />
      </div>
    </div>
  );
}
