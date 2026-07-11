"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Review, MediaType } from "@/lib/reviews";
import { CURRENCIES, type Currency } from "@/lib/currency";
import type { Category } from "@/lib/categories";
import type { Tag } from "@/lib/tags";
import { adminHref } from "@/lib/adminPath";

type FormTranslation = {
  title: string;
  summary: string;
  body: string;
  pros: string;
  cons: string;
};

type MediaRow = {
  type: MediaType;
  url: string;
};

type FormState = {
  slug: string;
  categorySlug: string;
  tagSlugs: string[];
  rating: string;
  priceAmount: string;
  priceCurrency: Currency;
  promoCode: string;
  media: MediaRow[];
  link1Label: string;
  link1Url: string;
  hasSecondLink: boolean;
  link2Label: string;
  link2Url: string;
  publishedAt: string;
  en: FormTranslation;
  ar: FormTranslation;
  seoMetaTitleEn: string;
  seoMetaTitleAr: string;
  seoMetaDescriptionEn: string;
  seoMetaDescriptionAr: string;
  seoTargetKeywords: string;
  seoSocialImage: string;
  seoSocialTitleEn: string;
  seoSocialTitleAr: string;
  seoSocialDescriptionEn: string;
  seoSocialDescriptionAr: string;
};

function toFormTranslation(t?: {
  title: string;
  summary: string;
  body: string;
  pros: string[];
  cons: string[];
}): FormTranslation {
  return {
    title: t?.title ?? "",
    summary: t?.summary ?? "",
    body: t?.body ?? "",
    pros: t?.pros?.join("\n") ?? "",
    cons: t?.cons?.join("\n") ?? "",
  };
}

function reviewToFormState(review: Review | undefined, defaultCategorySlug: string): FormState {
  const links = review?.affiliateLinks ?? [];

  return {
    slug: review?.slug ?? "",
    categorySlug: review?.categorySlug ?? defaultCategorySlug,
    tagSlugs: review?.tags ?? [],
    rating: review ? String(review.rating) : "4.5",
    priceAmount: review ? String(review.price.amount) : "",
    priceCurrency: review?.price.currency ?? "SAR",
    promoCode: review?.promoCode ?? "",
    media: review?.media.map((item) => ({ ...item })) ?? [{ type: "photo", url: "" }],
    link1Label: links[0]?.label ?? "",
    link1Url: links[0]?.url ?? "",
    hasSecondLink: links.length > 1,
    link2Label: links[1]?.label ?? "",
    link2Url: links[1]?.url ?? "",
    publishedAt: review?.publishedAt ?? new Date().toISOString().slice(0, 10),
    en: toFormTranslation(review?.translations.en),
    ar: toFormTranslation(review?.translations.ar),
    seoMetaTitleEn: review?.seo?.metaTitle.en ?? "",
    seoMetaTitleAr: review?.seo?.metaTitle.ar ?? "",
    seoMetaDescriptionEn: review?.seo?.metaDescription.en ?? "",
    seoMetaDescriptionAr: review?.seo?.metaDescription.ar ?? "",
    seoTargetKeywords: review?.seo?.targetKeywords ?? "",
    seoSocialImage: review?.seo?.socialImage ?? "",
    seoSocialTitleEn: review?.seo?.socialTitle.en ?? "",
    seoSocialTitleAr: review?.seo?.socialTitle.ar ?? "",
    seoSocialDescriptionEn: review?.seo?.socialDescription.en ?? "",
    seoSocialDescriptionAr: review?.seo?.socialDescription.ar ?? "",
  };
}

function slugifyClient(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const inputClass = "mt-1 w-full rounded border border-black/20 px-3 py-2";
const labelClass = "block text-sm font-medium";

export default function ReviewForm({
  initialReview,
  categories,
  tags,
}: {
  initialReview?: Review;
  categories: Category[];
  tags: Tag[];
}) {
  const router = useRouter();
  const isEditing = Boolean(initialReview);
  const [form, setForm] = useState<FormState>(() =>
    reviewToFormState(initialReview, categories[0]?.slug ?? "")
  );
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [availableTags, setAvailableTags] = useState(tags);
  const [newTagNameEn, setNewTagNameEn] = useState("");
  const [newTagNameAr, setNewTagNameAr] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateTranslation(
    locale: "en" | "ar",
    key: keyof FormTranslation,
    value: string
  ) {
    setForm((prev) => ({ ...prev, [locale]: { ...prev[locale], [key]: value } }));
  }

  function handleTitleChange(value: string) {
    updateTranslation("en", "title", value);
    if (!slugTouched) {
      updateField("slug", slugifyClient(value));
    }
  }

  function updateMediaRow(index: number, field: keyof MediaRow, value: string) {
    setForm((prev) => ({
      ...prev,
      media: prev.media.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  }

  function addMediaRow() {
    setForm((prev) => ({ ...prev, media: [...prev.media, { type: "photo", url: "" }] }));
  }

  function removeMediaRow(index: number) {
    setForm((prev) => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }));
  }

  function toggleTag(slug: string) {
    setForm((prev) => ({
      ...prev,
      tagSlugs: prev.tagSlugs.includes(slug)
        ? prev.tagSlugs.filter((s) => s !== slug)
        : [...prev.tagSlugs, slug],
    }));
  }

  async function handleAddTag() {
    setAddingTag(true);
    setTagError(null);

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn: newTagNameEn, nameAr: newTagNameAr }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setTagError(data.error ?? "Failed to add tag.");
      setAddingTag(false);
      return;
    }

    setAvailableTags((prev) => [...prev, data]);
    setForm((prev) => ({ ...prev, tagSlugs: [...prev.tagSlugs, data.slug] }));
    setNewTagNameEn("");
    setNewTagNameAr("");
    setAddingTag(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const affiliateLinks = [{ label: form.link1Label, url: form.link1Url }];
    if (form.hasSecondLink && form.link2Url.trim()) {
      affiliateLinks.push({ label: form.link2Label, url: form.link2Url });
    }

    const payload = {
      slug: form.slug,
      categorySlug: form.categorySlug,
      tags: form.tagSlugs,
      rating: Number(form.rating),
      price: { amount: Number(form.priceAmount), currency: form.priceCurrency },
      promoCode: form.promoCode.trim() || undefined,
      media: form.media.filter((item) => item.url.trim()),
      affiliateLinks,
      publishedAt: form.publishedAt,
      translations: {
        en: {
          title: form.en.title,
          summary: form.en.summary,
          body: form.en.body,
          pros: linesToList(form.en.pros),
          cons: linesToList(form.en.cons),
        },
        ar: {
          title: form.ar.title,
          summary: form.ar.summary,
          body: form.ar.body,
          pros: linesToList(form.ar.pros),
          cons: linesToList(form.ar.cons),
        },
      },
      seo: {
        metaTitle: { en: form.seoMetaTitleEn, ar: form.seoMetaTitleAr },
        metaDescription: { en: form.seoMetaDescriptionEn, ar: form.seoMetaDescriptionAr },
        targetKeywords: form.seoTargetKeywords,
        socialImage: form.seoSocialImage.trim() || undefined,
        socialTitle: { en: form.seoSocialTitleEn, ar: form.seoSocialTitleAr },
        socialDescription: { en: form.seoSocialDescriptionEn, ar: form.seoSocialDescriptionAr },
      },
    };

    const url = isEditing ? `/api/reviews/${initialReview!.slug}` : "/api/reviews";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    router.push(adminHref());
    router.refresh();
  }

  if (categories.length === 0) {
    return (
      <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
        No categories exist yet. Add at least one to <code>content/categories.json</code>{" "}
        before creating a review.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={form.categorySlug}
            onChange={(e) => updateField("categorySlug", e.target.value)}
            required
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.translations.en.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              updateField("slug", e.target.value);
            }}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Lowercase letters, numbers, and hyphens only"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Rating (0-5)</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={form.rating}
            onChange={(e) => updateField("rating", e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Published date</label>
          <input
            type="date"
            value={form.publishedAt}
            onChange={(e) => updateField("publishedAt", e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Price you paid</label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.priceAmount}
              onChange={(e) => updateField("priceAmount", e.target.value)}
              required
              className="flex-1 rounded border border-black/20 px-3 py-2"
            />
            <select
              value={form.priceCurrency}
              onChange={(e) => updateField("priceCurrency", e.target.value as Currency)}
              className="rounded border border-black/20 px-3 py-2"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Promo code (optional)</label>
          <input
            value={form.promoCode}
            onChange={(e) => updateField("promoCode", e.target.value)}
            placeholder="SAVE10"
            className={inputClass}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">
          Affiliate links
        </h2>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Link 1 label</label>
              <input
                value={form.link1Label}
                onChange={(e) => updateField("link1Label", e.target.value)}
                placeholder="Booking.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Link 1 URL</label>
              <input
                type="url"
                value={form.link1Url}
                onChange={(e) => updateField("link1Url", e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {form.hasSecondLink ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Link 2 label</label>
                <input
                  value={form.link2Label}
                  onChange={(e) => updateField("link2Label", e.target.value)}
                  placeholder="Amazon"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Link 2 URL</label>
                <input
                  type="url"
                  value={form.link2Url}
                  onChange={(e) => updateField("link2Url", e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => updateField("hasSecondLink", false)}
                className="text-sm text-red-600 hover:underline text-left sm:col-span-2"
              >
                Remove second link
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => updateField("hasSecondLink", true)}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add a second link
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">Tags</h2>
        <div className="mt-4">
          {tagError && (
            <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{tagError}</p>
          )}

          {availableTags.length === 0 ? (
            <p className="text-sm text-foreground/60">No tags yet — add one below.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const selected = form.tagSlugs.includes(tag.slug);
                return (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() => toggleTag(tag.slug)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      selected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-black/20 text-foreground/70 hover:border-black/40"
                    }`}
                  >
                    {tag.translations.en.name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm font-medium">New tag — English</label>
              <input
                value={newTagNameEn}
                onChange={(e) => setNewTagNameEn(e.target.value)}
                className="mt-1 rounded border border-black/20 px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">New tag — Arabic</label>
              <input
                value={newTagNameAr}
                onChange={(e) => setNewTagNameAr(e.target.value)}
                dir="rtl"
                className="mt-1 rounded border border-black/20 px-2 py-1 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              disabled={addingTag || !newTagNameEn.trim() || !newTagNameAr.trim()}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {addingTag ? "Adding..." : "+ Add & assign tag"}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">
          Photos & videos
        </h2>
        <div className="mt-4 space-y-3">
          {form.media.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <select
                value={item.type}
                onChange={(e) => updateMediaRow(index, "type", e.target.value)}
                className="rounded border border-black/20 px-2 py-2"
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
              </select>
              <input
                type="url"
                value={item.url}
                onChange={(e) => updateMediaRow(index, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded border border-black/20 px-3 py-2"
              />
              <button
                type="button"
                onClick={() => removeMediaRow(index)}
                className="text-red-600 hover:underline px-2 py-2"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMediaRow}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add photo or video
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">
          English content
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              value={form.en.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Summary</label>
            <input
              value={form.en.summary}
              onChange={(e) => updateTranslation("en", "summary", e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Body (blank line = new paragraph)</label>
            <textarea
              value={form.en.body}
              onChange={(e) => updateTranslation("en", "body", e.target.value)}
              rows={8}
              required
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Pros (one per line)</label>
              <textarea
                value={form.en.pros}
                onChange={(e) => updateTranslation("en", "pros", e.target.value)}
                rows={4}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Cons (one per line)</label>
              <textarea
                value={form.en.cons}
                onChange={(e) => updateTranslation("en", "cons", e.target.value)}
                rows={4}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      <section dir="rtl">
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">
          المحتوى بالعربية (Arabic content — optional, falls back to English)
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>العنوان</label>
            <input
              value={form.ar.title}
              onChange={(e) => updateTranslation("ar", "title", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>الملخص</label>
            <input
              value={form.ar.summary}
              onChange={(e) => updateTranslation("ar", "summary", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>النص الكامل (سطر فارغ = فقرة جديدة)</label>
            <textarea
              value={form.ar.body}
              onChange={(e) => updateTranslation("ar", "body", e.target.value)}
              rows={8}
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>الإيجابيات (سطر لكل عنصر)</label>
              <textarea
                value={form.ar.pros}
                onChange={(e) => updateTranslation("ar", "pros", e.target.value)}
                rows={4}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>السلبيات (سطر لكل عنصر)</label>
              <textarea
                value={form.ar.cons}
                onChange={(e) => updateTranslation("ar", "cons", e.target.value)}
                rows={4}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">SEO</h2>
        <p className="mt-2 text-sm text-foreground/60">
          Falls back to the review title/summary above when left blank.
        </p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Meta title (English)</label>
              <input
                value={form.seoMetaTitleEn}
                onChange={(e) => updateField("seoMetaTitleEn", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Meta title (Arabic)</label>
              <input
                value={form.seoMetaTitleAr}
                onChange={(e) => updateField("seoMetaTitleAr", e.target.value)}
                dir="rtl"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Meta description (English)</label>
              <textarea
                value={form.seoMetaDescriptionEn}
                onChange={(e) => updateField("seoMetaDescriptionEn", e.target.value)}
                rows={2}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Meta description (Arabic)</label>
              <textarea
                value={form.seoMetaDescriptionAr}
                onChange={(e) => updateField("seoMetaDescriptionAr", e.target.value)}
                rows={2}
                dir="rtl"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Target keywords (your own notes, not published)</label>
            <textarea
              value={form.seoTargetKeywords}
              onChange={(e) => updateField("seoTargetKeywords", e.target.value)}
              rows={2}
              placeholder="e.g. best wireless earbuds saudi arabia, ..."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold border-b border-black/10 pb-2">
          Social sharing (Open Graph &amp; Twitter Card)
        </h2>
        <p className="mt-2 text-sm text-foreground/60">
          Falls back to the review&apos;s own title, summary, and first photo when left blank.
        </p>
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Social title (English)</label>
              <input
                value={form.seoSocialTitleEn}
                onChange={(e) => updateField("seoSocialTitleEn", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Social title (Arabic)</label>
              <input
                value={form.seoSocialTitleAr}
                onChange={(e) => updateField("seoSocialTitleAr", e.target.value)}
                dir="rtl"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Social description (English)</label>
              <textarea
                value={form.seoSocialDescriptionEn}
                onChange={(e) => updateField("seoSocialDescriptionEn", e.target.value)}
                rows={2}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Social description (Arabic)</label>
              <textarea
                value={form.seoSocialDescriptionAr}
                onChange={(e) => updateField("seoSocialDescriptionAr", e.target.value)}
                rows={2}
                dir="rtl"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Social share image URL (optional)</label>
            <input
              type="url"
              value={form.seoSocialImage}
              onChange={(e) => updateField("seoSocialImage", e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {submitting ? "Saving..." : isEditing ? "Save changes" : "Add review"}
      </button>
    </form>
  );
}
