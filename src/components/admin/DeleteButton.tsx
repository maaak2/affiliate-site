"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/reviews/${slug}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete review.");
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
