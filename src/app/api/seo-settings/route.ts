import { NextRequest, NextResponse } from "next/server";
import { updateSeoSettings } from "@/lib/seoSettings";
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

  try {
    const settings = await updateSeoSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update SEO settings." },
      { status: 400 }
    );
  }
}
