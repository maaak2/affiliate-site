import { isValidSlug } from "./slug";
import { getCategory } from "./categories";
import { getTag } from "./tags";
import { getContentStore } from "./contentStore";
import { CURRENCIES, type Currency } from "./currency";

export type { Currency } from "./currency";
export { CURRENCIES } from "./currency";

export type MediaType = "photo" | "video";

export interface MediaItem {
  type: MediaType;
  url: string;
}

export interface AffiliateLink {
  label: string;
  url: string;
}

export interface Price {
  amount: number;
  currency: Currency;
}

export interface ReviewTranslation {
  title: string;
  summary: string;
  body: string;
  pros: string[];
  cons: string[];
}

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface ReviewSeo {
  metaTitle: LocalizedText;
  metaDescription: LocalizedText;
  /** Free-text notes for the owner's own reference — not used for automated keyword targeting. */
  targetKeywords: string;
  /** Falls back to the review's first photo when unset. Feeds both Open Graph and Twitter Card. */
  socialImage?: string;
  socialTitle: LocalizedText;
  socialDescription: LocalizedText;
}

export interface Review {
  slug: string;
  categorySlug: string;
  /** Tag slugs — see lib/tags.ts. Independent from category. */
  tags: string[];
  rating: number;
  price: Price;
  promoCode?: string;
  media: MediaItem[];
  /** 1 or 2 entries — e.g. the same item listed on two different retailers. */
  affiliateLinks: AffiliateLink[];
  publishedAt: string;
  translations: {
    en: ReviewTranslation;
    ar: ReviewTranslation;
  };
  seo: ReviewSeo;
}

const REVIEWS_PREFIX = "reviews/";

export { isValidSlug, slugify } from "./slug";

function reviewKeyForSlug(slug: string): string {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug: ${slug}`);
  }
  return `${REVIEWS_PREFIX}${slug}.json`;
}

function normalizeTranslation(t: Partial<ReviewTranslation> | undefined): ReviewTranslation {
  return {
    title: t?.title ?? "",
    summary: t?.summary ?? "",
    body: t?.body ?? "",
    pros: Array.isArray(t?.pros) ? t.pros.filter((p) => typeof p === "string") : [],
    cons: Array.isArray(t?.cons) ? t.cons.filter((c) => typeof c === "string") : [],
  };
}

function assertValidUrl(url: string): string {
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error(`"${url}" is not a valid URL.`);
  }
}

function normalizeLocalizedText(t: Partial<LocalizedText> | undefined): LocalizedText {
  return { en: t?.en?.trim() ?? "", ar: t?.ar?.trim() ?? "" };
}

function normalizeSeo(seo: Partial<ReviewSeo> | undefined): ReviewSeo {
  return {
    metaTitle: normalizeLocalizedText(seo?.metaTitle),
    metaDescription: normalizeLocalizedText(seo?.metaDescription),
    targetKeywords: seo?.targetKeywords?.trim() ?? "",
    socialImage: seo?.socialImage?.trim() ? assertValidUrl(seo.socialImage.trim()) : undefined,
    socialTitle: normalizeLocalizedText(seo?.socialTitle),
    socialDescription: normalizeLocalizedText(seo?.socialDescription),
  };
}

/** Fills in missing tags/seo fields on reviews written before those fields existed. */
function withNewFieldDefaults(review: Review): Review {
  return {
    ...review,
    tags: Array.isArray(review.tags) ? review.tags : [],
    seo: normalizeSeo(review.seo),
  };
}

/** Fills in missing optional fields and throws with a clear message if required fields are invalid. */
async function normalizeAndValidateReview(input: Partial<Review>): Promise<Review> {
  if (!input.slug || !isValidSlug(input.slug)) {
    throw new Error("Slug must be lowercase letters, numbers, and hyphens only.");
  }

  if (!input.categorySlug) {
    throw new Error("Category is required.");
  }
  const category = await getCategory(input.categorySlug);
  if (!category) {
    throw new Error(`Unknown category "${input.categorySlug}".`);
  }

  const rating = Number(input.rating);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    throw new Error("Rating must be a number between 0 and 5.");
  }

  const amount = Number(input.price?.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Price must be a non-negative number.");
  }
  const currency = input.price?.currency;
  if (!currency || !(CURRENCIES as readonly string[]).includes(currency)) {
    throw new Error(`Currency must be one of: ${CURRENCIES.join(", ")}.`);
  }

  const affiliateLinks = (Array.isArray(input.affiliateLinks) ? input.affiliateLinks : [])
    .filter((link) => link?.url && link.url.trim())
    .slice(0, 2)
    .map((link) => ({
      label: link.label?.trim() || "Buy now",
      url: assertValidUrl(link.url.trim()),
    }));
  if (affiliateLinks.length === 0) {
    throw new Error("At least one affiliate link is required.");
  }

  const media = (Array.isArray(input.media) ? input.media : [])
    .filter((item) => item?.url && item.url.trim())
    .map((item) => ({
      type: (item.type === "video" ? "video" : "photo") as MediaType,
      url: assertValidUrl(item.url.trim()),
    }));

  const en = normalizeTranslation(input.translations?.en);
  if (!en.title || !en.summary || !en.body) {
    throw new Error("English title, summary, and body are required.");
  }

  const tagSlugs = Array.from(
    new Set(
      (Array.isArray(input.tags) ? input.tags : []).filter(
        (tag): tag is string => typeof tag === "string" && tag.trim() !== ""
      )
    )
  );
  for (const tagSlug of tagSlugs) {
    const tag = await getTag(tagSlug);
    if (!tag) {
      throw new Error(`Unknown tag "${tagSlug}".`);
    }
  }

  return {
    slug: input.slug,
    categorySlug: category.slug,
    tags: tagSlugs,
    rating,
    price: { amount, currency },
    promoCode: input.promoCode?.trim() || undefined,
    media,
    affiliateLinks,
    publishedAt: input.publishedAt || new Date().toISOString().slice(0, 10),
    translations: {
      en,
      ar: normalizeTranslation(input.translations?.ar),
    },
    seo: normalizeSeo(input.seo),
  };
}

export async function getAllSlugs(): Promise<string[]> {
  const store = getContentStore();
  const { blobs } = await store.list({ prefix: REVIEWS_PREFIX });
  return blobs
    .map((blob) => blob.key.slice(REVIEWS_PREFIX.length))
    .filter((key) => key.endsWith(".json"))
    .map((key) => key.replace(/\.json$/, ""));
}

export async function listReviews(): Promise<Review[]> {
  const slugs = await getAllSlugs();
  const reviews = await Promise.all(slugs.map((slug) => getReview(slug)));
  return reviews
    .filter((review): review is Review => review !== null)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function listReviewsByCategory(categorySlug: string): Promise<Review[]> {
  const reviews = await listReviews();
  return reviews.filter((review) => review.categorySlug === categorySlug);
}

export async function listReviewsByTag(tagSlug: string): Promise<Review[]> {
  const reviews = await listReviews();
  return reviews.filter((review) => review.tags.includes(tagSlug));
}

export async function getReview(slug: string): Promise<Review | null> {
  if (!isValidSlug(slug)) return null;
  const store = getContentStore();
  const review = await store.get(reviewKeyForSlug(slug), { type: "json" });
  if (!review) return null;
  return withNewFieldDefaults(review as Review);
}

export async function createReview(input: Partial<Review>): Promise<void> {
  const review = await normalizeAndValidateReview(input);
  const existing = await getReview(review.slug);
  if (existing) {
    throw new Error(`A review with slug "${review.slug}" already exists.`);
  }
  const store = getContentStore();
  await store.setJSON(reviewKeyForSlug(review.slug), review);
}

export async function updateReview(
  originalSlug: string,
  input: Partial<Review>
): Promise<void> {
  if (!isValidSlug(originalSlug)) {
    throw new Error("Invalid slug.");
  }
  const review = await normalizeAndValidateReview(input);
  const existing = await getReview(originalSlug);
  if (!existing) {
    throw new Error(`No review found with slug "${originalSlug}".`);
  }
  const store = getContentStore();
  if (review.slug !== originalSlug) {
    const collision = await getReview(review.slug);
    if (collision) {
      throw new Error(`A review with slug "${review.slug}" already exists.`);
    }
    await store.delete(reviewKeyForSlug(originalSlug));
  }
  await store.setJSON(reviewKeyForSlug(review.slug), review);
}

export async function deleteReview(slug: string): Promise<void> {
  if (!isValidSlug(slug)) {
    throw new Error("Invalid slug.");
  }
  const store = getContentStore();
  // Netlify Blobs' delete() is already idempotent — a no-op if the key doesn't exist.
  await store.delete(reviewKeyForSlug(slug));
}
