import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "privacy" });
  return { title: t("heading") };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");
  const legal = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t("heading")}</h1>

      <p className="mt-4 rounded bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {legal("draftNotice")}
      </p>

      <div className="mt-8 space-y-8 text-foreground/90 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold">{t("whoWeAreHeading")}</h2>
          <p className="mt-2">{t("whoWeAreBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{t("dataCollectedHeading")}</h2>
          <p className="mt-2">{t("dataCollectedBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{t("thirdPartiesHeading")}</h2>
          <p className="mt-2">{t("thirdPartiesIntro")}</p>
          <ul className="mt-2 list-disc ps-5 space-y-1">
            <li>{t("thirdPartyUmami")}</li>
            <li>{t("thirdPartyNetlify")}</li>
          </ul>
          <p className="mt-2">{t("thirdPartiesOutro")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{t("accountsHeading")}</h2>
          <p className="mt-2">{t("accountsBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{t("marketingHeading")}</h2>
          <p className="mt-2">{t("marketingBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{t("affiliateHeading")}</h2>
          <p className="mt-2">
            {t("affiliateBody")}{" "}
            <Link href="/affiliate-disclosure" className="text-blue-600 hover:underline">
              {t("affiliateLinkText")}
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">{t("contactHeading")}</h2>
          <p className="mt-2">
            {t("contactBody")}{" "}
            <a href="mailto:info@mahmoudtries.com" className="text-blue-600 hover:underline">
              info@mahmoudtries.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
