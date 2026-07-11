import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-black/10 dark:border-white/10 mt-12">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-foreground/60">
        {t("text")}
      </div>
    </footer>
  );
}
