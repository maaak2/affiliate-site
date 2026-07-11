import { NextRequest, NextResponse } from "next/server";
import { reorderCategories } from "@/lib/categories";
import { isAdminRequest } from "@/lib/auth";
import { isTrustedOrigin } from "@/lib/csrf";

export async function PUT(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const order = Array.isArray(body.order) ? body.order : [];

  try {
    const categories = await reorderCategories(order);
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reorder categories." },
      { status: 400 }
    );
  }
}
