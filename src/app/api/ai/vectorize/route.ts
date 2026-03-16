import { NextRequest, NextResponse } from "next/server";
import { vectorizeImage, fetchSvgContent, UNIT_COSTS } from "@/lib/recraft";

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

    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
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

    const svgUrl = await vectorizeImage({ token }, buffer, file.name);
    const svgContent = await fetchSvgContent(svgUrl);

    return NextResponse.json({
      success: true,
      svgUrl,
      svgContent,
      creditsUsed: UNIT_COSTS.vectorize,
      costUsd: UNIT_COSTS.vectorize / 1000,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[vectorize]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}