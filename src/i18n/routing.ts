import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  // Arabic is the default entry point for visitors with no saved preference and no matching
  // browser language (primary market is Saudi Arabia/MENA). A visitor who explicitly picks
  // English via the language switcher is remembered via next-intl's own NEXT_LOCALE cookie
  // (enabled by default) and won't be reset back to Arabic on later visits.
  defaultLocale: "ar",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
