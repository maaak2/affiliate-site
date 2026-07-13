import { NextRequest, NextResponse } from "next/server";
import { setReviewPublished } from "@/lib/reviews";
import { isAdminRequest } from "@/lib/auth";
import { isTrustedOrigin } from "@/lib/csrf";

export async function PATCH(
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

  if (typeof body.published !== "boolean") {
    return NextResponse.json({ error: "published must be a boolean." }, { status: 400 });
  }

  try {
    const review = await setReviewPublished(slug, body.published);
    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update review." },
      { status: 400 }
    );
  }
}
