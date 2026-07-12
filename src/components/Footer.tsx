import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-black/10 dark:border-white/10 mt-12">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-foreground/60">
        <p>{t("text")}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            {t("privacyLink")}
          </Link>
          <Link href="/affiliate-disclosure" className="hover:text-foreground hover:underline">
            {t("affiliateLink")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
