import { promises as fs } from "fs";
import path from "path";
import { isValidSlug, slugify } from "./slug";

export interface TagTranslation {
  name: string;
}

export interface Tag {
  slug: string;
  translations: {
    en: TagTranslation;
    ar: TagTranslation;
  };
}

const TAGS_FILE = path.join(process.cwd(), "content", "tags.json");

export async function listTags(): Promise<Tag[]> {
  const raw = await fs.readFile(TAGS_FILE, "utf-8").catch(() => "[]");
  try {
    return JSON.parse(raw) as Tag[];
  } catch {
    return [];
  }
}

export async function getTag(slug: string): Promise<Tag | null> {
  if (!isValidSlug(slug)) return null;
  const tags = await listTags();
  return tags.find((tag) => tag.slug === slug) ?? null;
}

export function getTagName(tag: Tag, locale: "en" | "ar"): string {
  return tag.translations[locale]?.name ?? tag.translations.en.name;
}

async function writeTags(tags: Tag[]): Promise<void> {
  await fs.mkdir(path.dirname(TAGS_FILE), { recursive: true });
  await fs.writeFile(TAGS_FILE, JSON.stringify(tags, null, 2), "utf-8");
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

export async function createTag(input: { nameEn?: string; nameAr?: string }): Promise<Tag> {
  const { nameEn, nameAr } = normalizeNames(input);
  const slug = slugify(nameEn);
  if (!isValidSlug(slug)) {
    throw new Error("Could not derive a valid slug from the English name.");
  }

  const tags = await listTags();
  if (tags.some((tag) => tag.slug === slug)) {
    throw new Error(`A tag with slug "${slug}" already exists.`);
  }

  const tag: Tag = { slug, translations: { en: { name: nameEn }, ar: { name: nameAr } } };
  await writeTags([...tags, tag]);
  return tag;
}

export async function updateTag(
  slug: string,
  input: { nameEn?: string; nameAr?: string }
): Promise<Tag> {
  const { nameEn, nameAr } = normalizeNames(input);
  const tags = await listTags();
  const index = tags.findIndex((tag) => tag.slug === slug);
  if (index === -1) {
    throw new Error(`No tag found with slug "${slug}".`);
  }

  const updated: Tag = { ...tags[index], translations: { en: { name: nameEn }, ar: { name: nameAr } } };
  tags[index] = updated;
  await writeTags(tags);
  return updated;
}

export async function deleteTag(slug: string): Promise<void> {
  const tags = await listTags();
  const filtered = tags.filter((tag) => tag.slug !== slug);
  if (filtered.length !== tags.length) {
    await writeTags(filtered);
  }
}
