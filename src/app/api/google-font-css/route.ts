import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const family = req.nextUrl.searchParams.get("family");
  const weight = req.nextUrl.searchParams.get("weight") || "400";

  if (!family) {
    return NextResponse.json({ error: "family parameter required" }, { status: 400 });
  }

  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!resp.ok) {
      return NextResponse.json({ error: "Font not found", status: resp.status }, { status: 404 });
    }

    const css = await resp.text();

    // Extract TTF or WOFF2 URL from CSS
    const ttfMatch = css.match(/src:\s*url\(([^)]+\.ttf[^)]*)\)/);
    const woff2Match = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]woff2['"]\)/);
    const fontUrl = ttfMatch?.[1] || woff2Match?.[1] || null;

    return NextResponse.json({ css, fontUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
