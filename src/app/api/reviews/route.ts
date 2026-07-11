import { NextRequest, NextResponse } from "next/server";
import { createReview, listReviews, type Review } from "@/lib/reviews";
import { isAdminRequest } from "@/lib/auth";
import { isTrustedOrigin } from "@/lib/csrf";

export async function GET() {
  const reviews = await listReviews();
  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<Review>;

  try {
    await createReview(body);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create review." },
      { status: 400 }
    );
  }
}
