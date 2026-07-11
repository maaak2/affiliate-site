import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-lg font-bold">
          {t("siteName")}
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/categories" className="text-sm text-foreground/70 hover:text-foreground">
            {t("categories")}
          </Link>
          <Link href="/about" className="text-sm text-foreground/70 hover:text-foreground">
            {t("about")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
