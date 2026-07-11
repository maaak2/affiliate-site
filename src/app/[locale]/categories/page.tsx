import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listCategories, getCategoryName } from "@/lib/categories";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("categories");
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("heading")}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="rounded-lg border border-black/10 dark:border-white/10 p-6 font-semibold hover:shadow-md transition-shadow"
          >
            {getCategoryName(category, locale as Locale)}
          </Link>
        ))}
      </div>
    </div>
  );
}
