"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/umami";

/** Umami auto-tracks page views, but this fires a dedicated event so review
 * traffic across both locale URLs can be aggregated by review slug. */
export default function ReviewViewTracker({
  reviewSlug,
  locale,
}: {
  reviewSlug: string;
  locale: string;
}) {
  useEffect(() => {
    trackEvent("review-view", { reviewSlug, locale });
  }, [reviewSlug, locale]);

  return null;
}
