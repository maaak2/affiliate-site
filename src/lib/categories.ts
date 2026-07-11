import { promises as fs } from "fs";
import path from "path";
import { isValidSlug, slugify } from "./slug";

// The schema.org type used for this category's items in JSON-LD (itemReviewed).
export type SchemaOrgType = "Product" | "Hotel" | "Service";

export interface CategoryTranslation {
  name: string;
}

export interface Category {
  slug: string;
  schemaType: SchemaOrgType;
  translations: {
    en: CategoryTranslation;
    ar: CategoryTranslation;
  };
}

const CATEGORIES_FILE = path.join(process.cwd(), "content", "categories.json");

export async function listCategories(): Promise<Category[]> {
  const raw = await fs.readFile(CATEGORIES_FILE, "utf-8").catch(() => "[]");
  try {
    return JSON.parse(raw) as Category[];
  } catch {
    return [];
  }
}

export async function getCategory(slug: string): Promise<Category | null> {
  if (!isValidSlug(slug)) return null;
  const categories = await listCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

export function getCategoryName(category: Category, locale: "en" | "ar"): string {
  return category.translations[locale]?.name ?? category.translations.en.name;
}

async function writeCategories(categories: Category[]): Promise<void> {
  await fs.mkdir(path.dirname(CATEGORIES_FILE), { recursive: true });
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2), "utf-8");
}

function normalizeNames(input: { nameEn?: string; nameAr?: string }): {
  nameEn: string;
  nameAr: string;
} {
  const nameEn = input.nameEn?.trim() ?? "";
  const nameAr = input.nameAr?.trim() ?? "";
  if (!nameEn) throw new Error("English name is required.");
  if (!nameAr) throw new Error("Arabic name is required.");
  return { nameEn, nameAr };
}

export async function createCategory(input: {
  nameEn?: string;
  nameAr?: string;
}): Promise<Category> {
  const { nameEn, nameAr } = normalizeNames(input);
  const slug = slugify(nameEn);
  if (!isValidSlug(slug)) {
    throw new Error("Could not derive a valid slug from the English name.");
  }

  const categories = await listCategories();
  if (categories.some((category) => category.slug === slug)) {
    throw new Error(`A category with slug "${slug}" already exists.`);
  }

  const category: Category = {
    slug,
    schemaType: "Product",
    translations: { en: { name: nameEn }, ar: { name: nameAr } },
  };

  await writeCategories([...categories, category]);
  return category;
}

export async function updateCategory(
  slug: string,
  input: { nameEn?: string; nameAr?: string }
): Promise<Category> {
  const { nameEn, nameAr } = normalizeNames(input);
  const categories = await listCategories();
  const index = categories.findIndex((category) => category.slug === slug);
  if (index === -1) {
    throw new Error(`No category found with slug "${slug}".`);
  }

  const updated: Category = {
    ...categories[index],
    translations: { en: { name: nameEn }, ar: { name: nameAr } },
  };
  categories[index] = updated;
  await writeCategories(categories);
  return updated;
}

export async function deleteCategory(slug: string): Promise<void> {
  const categories = await listCategories();
  const filtered = categories.filter((category) => category.slug !== slug);
  if (filtered.length !== categories.length) {
    await writeCategories(filtered);
  }
}

/** Rewrites categories.json in the given slug order. The file order is what drives display order across the site. */
export async function reorderCategories(orderedSlugs: string[]): Promise<Category[]> {
  const categories = await listCategories();
  const isSameSet =
    orderedSlugs.length === categories.length &&
    orderedSlugs.every((slug) => categories.some((category) => category.slug === slug));
  if (!isSameSet) {
    throw new Error("Reorder list must contain exactly the existing category slugs.");
  }

  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const reordered = orderedSlugs.map((slug) => bySlug.get(slug)!);
  await writeCategories(reordered);
  return reordered;
}
