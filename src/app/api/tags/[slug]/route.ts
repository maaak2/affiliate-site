import { NextRequest, NextResponse } from "next/server";
import { deleteTag, getTag, updateTag } from "@/lib/tags";
import { listReviewsByTag } from "@/lib/reviews";
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
    const tag = await updateTag(slug, { nameEn: body.nameEn, nameAr: body.nameAr });
    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update tag." },
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
  const tag = await getTag(slug);
  if (!tag) {
    return NextResponse.json({ error: "Tag not found." }, { status: 404 });
  }

  const reviewsInUse = await listReviewsByTag(slug);
  if (reviewsInUse.length > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete "${tag.translations.en.name}" — ${reviewsInUse.length} review(s) still use this tag. Remove it from those reviews first.`,
      },
      { status: 409 }
    );
  }

  await deleteTag(slug);
  return NextResponse.json({ ok: true });
}
