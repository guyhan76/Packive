import { NextRequest, NextResponse } from "next/server";
import { generateVector, fetchSvgContent, UNIT_COSTS } from "@/lib/recraft";

export async function POST(req: NextRequest) {
  try {
    const token = process.env.RECRAFT_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "RECRAFT_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { prompt, model, style, size, colors } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const selectedModel = model === "recraftv4_pro_vector"
      ? "recraftv4_pro_vector"
      : "recraftv4_vector";

    const results = await generateVector(
      { token },
      {
        prompt: prompt.trim(),
        model: selectedModel,
        style: style || undefined,
        size: size || "1024x1024",
        colors: colors || undefined,
        responseFormat: "url",
      }
    );

    if (!results.length || !results[0].url) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    // Fetch actual SVG content
    const svgContent = await fetchSvgContent(results[0].url);

    const unitCost = UNIT_COSTS[selectedModel];

    return NextResponse.json({
      success: true,
      svgUrl: results[0].url,
      svgContent,
      model: selectedModel,
      creditsUsed: unitCost,
      costUsd: unitCost / 1000,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate-vector]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}