"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("languageSwitcher");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function selectLocale(loc: Locale) {
    setOpen(false);
    router.replace(pathname, { locale: loc });
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t("label")}
        className="flex items-center justify-center rounded p-1.5 text-foreground/70 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9Z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 z-20 mt-1 min-w-[8rem] rounded border border-black/10 bg-background py-1 shadow-md dark:border-white/10"
        >
          {routing.locales.map((loc) => (
            <button
              key={loc}
              type="button"
              role="menuitem"
              onClick={() => selectLocale(loc)}
              disabled={loc === locale}
              className={`block w-full px-3 py-1.5 text-start text-sm ${
                loc === locale
                  ? "font-semibold text-foreground"
                  : "text-foreground/70 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
              }`}
            >
              {t(loc)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
