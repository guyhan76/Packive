import { NextRequest, NextResponse } from "next/server";
import { removeBackground, UNIT_COSTS } from "@/lib/recraft";

export async function POST(req: NextRequest) {
  try {
    const token = process.env.RECRAFT_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "RECRAFT_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "file is required" },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PNG, JPG, WEBP allowed" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resultUrl = await removeBackground({ token }, buffer, file.name);

    return NextResponse.json({
      success: true,
      imageUrl: resultUrl,
      creditsUsed: UNIT_COSTS.remove_bg,
      costUsd: UNIT_COSTS.remove_bg / 1000,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[remove-bg]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}