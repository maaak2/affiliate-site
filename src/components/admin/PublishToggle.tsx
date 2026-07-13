"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishToggle({
  slug,
  published,
}: {
  slug: string;
  published: boolean;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(published);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !checked;
    setChecked(next);
    setSaving(true);

    try {
      const res = await fetch(`/api/reviews/${slug}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Failed to update review.");
        setChecked(!next);
        return;
      }

      router.refresh();
    } catch {
      alert("Failed to update review — check your connection and try again.");
      setChecked(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        disabled={saving}
        onChange={toggle}
        className="h-4 w-4"
      />
      <span className={checked ? "text-green-700" : "text-foreground/50"}>
        {checked ? "Published" : "Hidden"}
      </span>
    </label>
  );
}
