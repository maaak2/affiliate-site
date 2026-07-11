import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen antialiased bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
