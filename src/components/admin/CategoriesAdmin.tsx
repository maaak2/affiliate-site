"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export type CategoryRow = {
  slug: string;
  nameEn: string;
  nameAr: string;
  reviewCount: number;
};

const inputClass = "rounded border border-black/20 px-2 py-1 text-sm";

export default function CategoriesAdmin({
  initialCategories,
}: {
  initialCategories: CategoryRow[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [error, setError] = useState<string | null>(null);

  const [newNameEn, setNewNameEn] = useState("");
  const [newNameAr, setNewNameAr] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editNameEn, setEditNameEn] = useState("");
  const [editNameAr, setEditNameAr] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn: newNameEn, nameAr: newNameAr }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Failed to add category.");
      setAdding(false);
      return;
    }

    setCategories((prev) => [
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

  function startEdit(category: CategoryRow) {
    setEditingSlug(category.slug);
    setEditNameEn(category.nameEn);
    setEditNameAr(category.nameAr);
    setError(null);
  }

  function cancelEdit() {
    setEditingSlug(null);
  }

  async function saveEdit(slug: string) {
    setSavingEdit(true);
    setError(null);

    const res = await fetch(`/api/categories/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameEn: editNameEn, nameAr: editNameAr }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Failed to update category.");
      setSavingEdit(false);
      return;
    }

    setCategories((prev) =>
      prev.map((category) =>
        category.slug === slug
          ? { ...category, nameEn: data.translations.en.name, nameAr: data.translations.ar.name }
          : category
      )
    );
    setEditingSlug(null);
    setSavingEdit(false);
    router.refresh();
  }

  async function handleDelete(category: CategoryRow) {
    if (category.reviewCount > 0) return;
    if (!confirm(`Delete "${category.nameEn}"? This cannot be undone.`)) return;

    setDeletingSlug(category.slug);
    setError(null);

    const res = await fetch(`/api/categories/${category.slug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete category.");
      setDeletingSlug(null);
      return;
    }

    setCategories((prev) => prev.filter((c) => c.slug !== category.slug));
    setDeletingSlug(null);
    router.refresh();
  }

  async function persistOrder(next: CategoryRow[]) {
    setReordering(true);
    setError(null);

    const res = await fetch("/api/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((c) => c.slug) }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to reorder categories.");
      setReordering(false);
      return;
    }

    setReordering(false);
    router.refresh();
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    persistOrder(next);
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-black/10">
            <th className="py-2 w-16"></th>
            <th className="py-2">English name</th>
            <th className="py-2">Arabic name</th>
            <th className="py-2">Reviews</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => {
            const isEditing = editingSlug === category.slug;
            return (
              <tr key={category.slug} className="border-b border-black/10 last:border-0">
                <td className="py-2">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || reordering}
                      className="disabled:opacity-30"
                      aria-label={`Move ${category.nameEn} up`}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === categories.length - 1 || reordering}
                      className="disabled:opacity-30"
                      aria-label={`Move ${category.nameEn} down`}
                    >
                      ↓
                    </button>
                  </div>
                </td>
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
                    <td className="py-2">{category.reviewCount}</td>
                    <td className="py-2 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => saveEdit(category.slug)}
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
                      {category.nameEn}
                      <div className="text-xs text-foreground/50">{category.slug}</div>
                    </td>
                    <td className="py-2" dir="rtl">
                      {category.nameAr}
                    </td>
                    <td className="py-2">{category.reviewCount}</td>
                    <td className="py-2 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={category.reviewCount > 0 || deletingSlug === category.slug}
                        title={
                          category.reviewCount > 0
                            ? `Reassign or delete ${category.reviewCount} review(s) in this category before deleting it.`
                            : undefined
                        }
                        className="text-red-600 hover:underline disabled:opacity-30 disabled:no-underline"
                      >
                        {deletingSlug === category.slug ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

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
          {adding ? "Adding..." : "+ Add category"}
        </button>
      </form>
    </div>
  );
}
