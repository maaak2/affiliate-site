"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const DISMISSED_KEY = "analytics-notice-dismissed";

/**
 * Informational-only notice about our cookieless analytics — not a consent banner, since we
 * don't set cookies or collect personal data, so there's no tracking to opt in or out of.
 *
 * If cookie-based tracking is ever added (ads, affiliate widgets, etc.), replace this with a
 * real consent banner that gates those scripts on the visitor's choice. This component's
 * dismiss-and-remember pattern is a reasonable starting point, but the actual accept/reject
 * logic — and wiring it to whatever script needs consent — still needs to be built then.
 */
export default function AnalyticsNotice() {
  const t = useTranslations("analyticsNotice");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem(DISMISSED_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2 text-sm">
        <p className="text-foreground/70">
          {t("message")}{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            {t("linkText")}
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("dismiss")}
          className="shrink-0 px-2 text-foreground/50 hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
