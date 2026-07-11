"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export type TagRow = {
  slug: string;
  nameEn: string;
  nameAr: string;
  reviewCount: number;
};

const inputClass = "rounded border border-black/20 px-2 py-1 text-sm";

export default function TagsAdmin({ initialTags }: { initialTags: TagRow[] }) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [error, setError] = useState<string | null>(null);

  const [newNameEn, setNewNameEn] = useState("");
  const [newNameAr, setNewNameAr] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editNameEn, setEditNameEn] = useState("");
  const [editNameAr, setEditNameAr] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn: newNameEn, nameAr: newNameAr }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Failed to add tag.");
      setAdding(false);
      return;
    }

    setTags((prev) => [
      ...prev,
      {
        slug: data.slug,
        nameEn: data.translations.en.name,
        nameAr: data.translations.ar.name,
        reviewCount: 0,
      },
    ]);
    setNewNameEn("");
    setNewNameAr("");
    setAdding(false);
    router.refresh();
  }

  function startEdit(tag: TagRow) {
    setEditingSlug(tag.slug);
    setEditNameEn(tag.nameEn);
    setEditNameAr(tag.nameAr);
    setError(null);
  }

  function cancelEdit() {
    setEditingSlug(null);
  }

  async function saveEdit(slug: string) {
    setSavingEdit(true);
    setError(null);

    const res = await fetch(`/api/tags/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn: editNameEn, nameAr: editNameAr }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Failed to update tag.");
      setSavingEdit(false);
      return;
    }

    setTags((prev) =>
      prev.map((tag) =>
        tag.slug === slug
          ? { ...tag, nameEn: data.translations.en.name, nameAr: data.translations.ar.name }
          : tag
      )
    );
    setEditingSlug(null);
    setSavingEdit(false);
    router.refresh();
  }

  async function handleDelete(tag: TagRow) {
    if (tag.reviewCount > 0) return;
    if (!confirm(`Delete "${tag.nameEn}"? This cannot be undone.`)) return;

    setDeletingSlug(tag.slug);
    setError(null);

    const res = await fetch(`/api/tags/${tag.slug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete tag.");
      setDeletingSlug(null);
      return;
    }

    setTags((prev) => prev.filter((t) => t.slug !== tag.slug));
    setDeletingSlug(null);
    router.refresh();
  }

  return (
    <div>
      {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {tags.length === 0 ? (
        <p className="text-sm text-foreground/60">No tags yet. Add your first one below.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-black/10">
              <th className="py-2">English name</th>
              <th className="py-2">Arabic name</th>
              <th className="py-2">Reviews</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => {
              const isEditing = editingSlug === tag.slug;
              return (
                <tr key={tag.slug} className="border-b border-black/10 last:border-0">
                  {isEditing ? (
                    <>
                      <td className="py-2 pe-2">
                        <input
                          value={editNameEn}
                          onChange={(e) => setEditNameEn(e.target.value)}
                          className={inputClass}
                        />
                      </td>
                      <td className="py-2 pe-2" dir="rtl">
                        <input
                          value={editNameAr}
                          onChange={(e) => setEditNameAr(e.target.value)}
                          className={inputClass}
                          dir="rtl"
                        />
                      </td>
                      <td className="py-2">{tag.reviewCount}</td>
                      <td className="py-2 text-right space-x-3">
                        <button
                          type="button"
                          onClick={() => saveEdit(tag.slug)}
                          disabled={savingEdit}
                          className="text-blue-600 hover:underline disabled:opacity-50"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-foreground/60 hover:underline"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2">
                        {tag.nameEn}
                        <div className="text-xs text-foreground/50">{tag.slug}</div>
                      </td>
                      <td className="py-2" dir="rtl">
                        {tag.nameAr}
                      </td>
                      <td className="py-2">{tag.reviewCount}</td>
                      <td className="py-2 text-right space-x-3">
                        <button
                          type="button"
                          onClick={() => startEdit(tag)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tag)}
                          disabled={tag.reviewCount > 0 || deletingSlug === tag.slug}
                          title={
                            tag.reviewCount > 0
                              ? `Remove this tag from ${tag.reviewCount} review(s) before deleting it.`
                              : undefined
                          }
                          className="text-red-600 hover:underline disabled:opacity-30 disabled:no-underline"
                        >
                          {deletingSlug === tag.slug ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <form onSubmit={handleAdd} className="mt-8 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium">English name</label>
          <input
            value={newNameEn}
            onChange={(e) => setNewNameEn(e.target.value)}
            required
            className={`${inputClass} mt-1`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Arabic name</label>
          <input
            value={newNameAr}
            onChange={(e) => setNewNameAr(e.target.value)}
            required
            dir="rtl"
            className={`${inputClass} mt-1`}
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? "Adding..." : "+ Add tag"}
        </button>
      </form>
    </div>
  );
}
