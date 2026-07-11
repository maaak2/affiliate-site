"use client";

import { trackEvent } from "@/lib/umami";

export default function AffiliateLink({
  href,
  reviewSlug,
  position,
  label,
  className,
  children,
}: {
  href: string;
  reviewSlug: string;
  position: 1 | 2;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={() =>
        trackEvent("affiliate-link-click", {
          reviewSlug,
          position,
          label,
          url: href,
        })
      }
    >
      {children}
    </a>
  );
}
