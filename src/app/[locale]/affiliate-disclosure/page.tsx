import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "affiliateDisclosure" });
  return { title: t("heading") };
}

export default async function AffiliateDisclosurePage() {
  const t = await getTranslations("affiliateDisclosure");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("heading")}</h1>

      <div className="mt-8 space-y-4 text-foreground/90 leading-relaxed">
        <p>{t("body1")}</p>
        <p>{t("body2")}</p>
        <p>{t("body3")}</p>
        <p>
          {t("body4")}{" "}
          <a href="mailto:info@mahmoudtries.com" className="text-blue-600 hover:underline">
            info@mahmoudtries.com
          </a>
        </p>
      </div>
    </div>
  );
}
