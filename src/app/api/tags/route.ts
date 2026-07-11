import { NextRequest, NextResponse } from "next/server";
import { createTag, listTags } from "@/lib/tags";
import { isAdminRequest } from "@/lib/auth";
import { isTrustedOrigin } from "@/lib/csrf";

export async function GET() {
  const tags = await listTags();
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    const tag = await createTag({ nameEn: body.nameEn, nameAr: body.nameAr });
    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create tag." },
      { status: 400 }
    );
  }
}
