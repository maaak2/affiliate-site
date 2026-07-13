import { getContentStore } from "./contentStore";

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface SeoSettings {
  homepageMetaTitle: LocalizedText;
  homepageMetaDescription: LocalizedText;
  /** May include a {category} placeholder, substituted with the category's own name. */
  categoryMetaTitleTemplate: LocalizedText;
  categoryMetaDescriptionTemplate: LocalizedText;
  defaultSocialImage: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  /** When false, robots.txt disallows everything — a sitewide "noindex" kill switch. */
  robotsAllowAll: boolean;
  /** One path per line, added to robots.txt's disallow list alongside the built-in /api. */
  robotsExtraDisallow: string;
  /** Plain-English summary of the site's purpose, used in llms.txt. */
  llmsDescription: string;
}

const SEO_SETTINGS_KEY = "seo-settings.json";

const DEFAULT_SETTINGS: SeoSettings = {
  homepageMetaTitle: { en: "", ar: "" },
  homepageMetaDescription: { en: "", ar: "" },
  categoryMetaTitleTemplate: { en: "", ar: "" },
  categoryMetaDescriptionTemplate: { en: "", ar: "" },
  defaultSocialImage: "",
  googleSiteVerification: "",
  bingSiteVerification: "",
  robotsAllowAll: true,
  robotsExtraDisallow: "",
  llmsDescription: "",
};

function normalizeLocalizedText(t: Partial<LocalizedText> | undefined): LocalizedText {
  return { en: t?.en?.trim() ?? "", ar: t?.ar?.trim() ?? "" };
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const store = getContentStore();
  const stored = await store.get(SEO_SETTINGS_KEY, { type: "json" });
  if (!stored || typeof stored !== "object") return DEFAULT_SETTINGS;
  const settings = stored as Partial<SeoSettings>;
  return {
    homepageMetaTitle: normalizeLocalizedText(settings.homepageMetaTitle),
    homepageMetaDescription: normalizeLocalizedText(settings.homepageMetaDescription),
    categoryMetaTitleTemplate: normalizeLocalizedText(settings.categoryMetaTitleTemplate),
    categoryMetaDescriptionTemplate: normalizeLocalizedText(settings.categoryMetaDescriptionTemplate),
    defaultSocialImage: settings.defaultSocialImage?.trim() ?? "",
    googleSiteVerification: settings.googleSiteVerification?.trim() ?? "",
    bingSiteVerification: settings.bingSiteVerification?.trim() ?? "",
    robotsAllowAll: settings.robotsAllowAll ?? true,
    robotsExtraDisallow: settings.robotsExtraDisallow ?? "",
    llmsDescription: settings.llmsDescription?.trim() ?? "",
  };
}

export async function updateSeoSettings(input: Partial<SeoSettings>): Promise<SeoSettings> {
  const current = await getSeoSettings();
  const updated: SeoSettings = {
    homepageMetaTitle: normalizeLocalizedText(input.homepageMetaTitle ?? current.homepageMetaTitle),
    homepageMetaDescription: normalizeLocalizedText(
      input.homepageMetaDescription ?? current.homepageMetaDescription
    ),
    categoryMetaTitleTemplate: normalizeLocalizedText(
      input.categoryMetaTitleTemplate ?? current.categoryMetaTitleTemplate
    ),
    categoryMetaDescriptionTemplate: normalizeLocalizedText(
      input.categoryMetaDescriptionTemplate ?? current.categoryMetaDescriptionTemplate
    ),
    defaultSocialImage: (input.defaultSocialImage ?? current.defaultSocialImage).trim(),
    googleSiteVerification: (input.googleSiteVerification ?? current.googleSiteVerification).trim(),
    bingSiteVerification: (input.bingSiteVerification ?? current.bingSiteVerification).trim(),
    robotsAllowAll: input.robotsAllowAll ?? current.robotsAllowAll,
    robotsExtraDisallow: input.robotsExtraDisallow ?? current.robotsExtraDisallow,
    llmsDescription: (input.llmsDescription ?? current.llmsDescription).trim(),
  };

  if (updated.defaultSocialImage) {
    try {
      new URL(updated.defaultSocialImage);
    } catch {
      throw new Error(`"${updated.defaultSocialImage}" is not a valid URL.`);
    }
  }

  const store = getContentStore();
  await store.setJSON(SEO_SETTINGS_KEY, updated);
  return updated;
}

export function renderCategoryTemplate(template: string, categoryName: string): string {
  return template.replace(/\{category\}/g, categoryName);
}

export function robotsDisallowPaths(settings: SeoSettings): string[] {
  const extra = settings.robotsExtraDisallow
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return ["/api", ...extra];
}
