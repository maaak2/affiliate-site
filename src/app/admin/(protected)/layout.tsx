import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminRequest } from "@/lib/auth";
import { adminHref } from "@/lib/adminPath";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminRequest())) {
    redirect(adminHref("/login"));
  }

  return (
    <div>
      <header className="border-b border-black/10">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={adminHref()} className="font-bold">
              Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href={adminHref()} className="text-foreground/70 hover:text-foreground">
                Reviews
              </Link>
              <Link
                href={adminHref("/categories")}
                className="text-foreground/70 hover:text-foreground"
              >
                Categories
              </Link>
              <Link href={adminHref("/tags")} className="text-foreground/70 hover:text-foreground">
                Tags
              </Link>
              <Link
                href={adminHref("/monitoring")}
                className="text-foreground/70 hover:text-foreground"
              >
                Monitoring
              </Link>
              <Link href={adminHref("/seo")} className="text-foreground/70 hover:text-foreground">
                SEO
              </Link>
            </nav>
          </div>
          <form method="POST" action="/api/admin/logout">
            <button
              type="submit"
              className="text-sm text-blue-600 hover:underline"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
