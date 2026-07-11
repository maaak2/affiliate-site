"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("languageSwitcher");
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          disabled={loc === locale}
          className={
            loc === locale
              ? "px-2 py-1 rounded font-semibold"
              : "px-2 py-1 rounded text-foreground/60 hover:text-foreground"
          }
        >
          {t(loc)}
        </button>
      ))}
    </div>
  );
}
