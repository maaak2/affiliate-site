"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SeoSettings } from "@/lib/seoSettings";

const inputClass = "mt-1 w-full rounded border border-black/20 px-3 py-2 text-sm";
const labelClass = "block text-sm font-medium";

export default function SeoSettingsForm({ initialSettings }: { initialSettings: SeoSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updateLocalized(
    key: "homepageMetaTitle" | "homepageMetaDescription" | "categoryMetaTitleTemplate" | "categoryMetaDescriptionTemplate",
    locale: "en" | "ar",
    value: string
  ) {
    setSettings((prev) => ({ ...prev, [key]: { ...prev[key], [locale]: value } }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/seo-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Failed to save SEO settings.");
        return;
      }

      setSettings(data);
      setSaved(true);
      router.refresh();
    } catch {
      setError("Failed to save SEO settings — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {saved && !error && (
        <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-800">Saved.</p>
      )}

      <section>
        <h3 className="font-semibold border-b border-black/10 pb-2">Homepage defaults</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Meta title (English)</label>
            <input
              value={settings.homepageMetaTitle.en}
              onChange={(e) => updateLocalized("homepageMetaTitle", "en", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta title (Arabic)</label>
            <input
              value={settings.homepageMetaTitle.ar}
              onChange={(e) => updateLocalized("homepageMetaTitle", "ar", e.target.value)}
              dir="rtl"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta description (English)</label>
            <textarea
              value={settings.homepageMetaDescription.en}
              onChange={(e) => updateLocalized("homepageMetaDescription", "en", e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta description (Arabic)</label>
            <textarea
              value={settings.homepageMetaDescription.ar}
              onChange={(e) => updateLocalized("homepageMetaDescription", "ar", e.target.value)}
              rows={2}
              dir="rtl"
              className={inputClass}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-foreground/50">Leave blank to keep the site default.</p>
      </section>

      <section>
        <h3 className="font-semibold border-b border-black/10 pb-2">Category page defaults</h3>
        <p className="mt-2 text-xs text-foreground/50">
          Use <code>{"{category}"}</code> as a placeholder for the category&apos;s own name.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Meta title template (English)</label>
            <input
              value={settings.categoryMetaTitleTemplate.en}
              onChange={(e) => updateLocalized("categoryMetaTitleTemplate", "en", e.target.value)}
              placeholder="{category} Reviews | Mahmoud Tries"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta title template (Arabic)</label>
            <input
              value={settings.categoryMetaTitleTemplate.ar}
              onChange={(e) => updateLocalized("categoryMetaTitleTemplate", "ar", e.target.value)}
              dir="rtl"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta description template (English)</label>
            <textarea
              value={settings.categoryMetaDescriptionTemplate.en}
              onChange={(e) =>
                updateLocalized("categoryMetaDescriptionTemplate", "en", e.target.value)
              }
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Meta description template (Arabic)</label>
            <textarea
              value={settings.categoryMetaDescriptionTemplate.ar}
              onChange={(e) =>
                updateLocalized("categoryMetaDescriptionTemplate", "ar", e.target.value)
              }
              rows={2}
              dir="rtl"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold border-b border-black/10 pb-2">
          Social sharing &amp; site verification
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Default social share image URL</label>
            <input
              type="url"
              value={settings.defaultSocialImage}
              onChange={(e) => update("defaultSocialImage", e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-foreground/50">
              Used on pages without their own image (reviews always use their own photo).
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Google Search Console verification code</label>
              <input
                value={settings.googleSiteVerification}
                onChange={(e) => update("googleSiteVerification", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Bing Webmaster verification code</label>
              <input
                value={settings.bingSiteVerification}
                onChange={(e) => update("bingSiteVerification", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold border-b border-black/10 pb-2">AI crawler visibility</h3>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.robotsAllowAll}
              onChange={(e) => update("robotsAllowAll", e.target.checked)}
            />
            Allow search engines and AI crawlers to index the site
          </label>
          {!settings.robotsAllowAll && (
            <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This blocks the entire site from all crawlers via robots.txt — use only for
              maintenance or before launch.
            </p>
          )}
          <div>
            <label className={labelClass}>
              Additional disallowed paths (one per line, besides /api)
            </label>
            <textarea
              value={settings.robotsExtraDisallow}
              onChange={(e) => update("robotsExtraDisallow", e.target.value)}
              rows={3}
              placeholder="/drafts&#10;/internal"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>llms.txt description</label>
            <textarea
              value={settings.llmsDescription}
              onChange={(e) => update("llmsDescription", e.target.value)}
              rows={3}
              placeholder="Leave blank to use the built-in default description."
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
