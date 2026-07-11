import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "about" });
  return { title: t("heading") };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("heading")}</h1>

      <div className="mt-8 flex flex-col sm:flex-row gap-6 items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://placehold.co/300x300?text=Photo"
          alt={t("heading")}
          className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover shrink-0"
        />
        <div>
          <p className="text-foreground/90 leading-relaxed">{t("bio")}</p>
          <div className="mt-6">
            <h2 className="font-semibold">{t("contact")}</h2>
            <a
              href={`mailto:${t("contactEmail")}`}
              className="mt-1 inline-block text-blue-600 hover:underline"
            >
              {t("contactEmail")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
