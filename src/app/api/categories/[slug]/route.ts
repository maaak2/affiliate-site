import { NextRequest, NextResponse } from "next/server";
import { deleteCategory, getCategory, updateCategory } from "@/lib/categories";
import { listReviewsByCategory } from "@/lib/reviews";
import { isAdminRequest } from "@/lib/auth";
import { isTrustedOrigin } from "@/lib/csrf";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const category = await updateCategory(slug, { nameEn: body.nameEn, nameAr: body.nameAr });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update category." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  const reviewsInUse = await listReviewsByCategory(slug);
  if (reviewsInUse.length > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete "${category.translations.en.name}" — ${reviewsInUse.length} review(s) still use this category. Reassign or delete them first.`,
      },
      { status: 409 }
    );
  }

  await deleteCategory(slug);
  return NextResponse.json({ ok: true });
}
