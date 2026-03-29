import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const family = req.nextUrl.searchParams.get("family");
  const weight = req.nextUrl.searchParams.get("weight") || "400";

  if (!family) {
    return NextResponse.json({ error: "family parameter required" }, { status: 400 });
  }

  try {
    // Request with TTF-compatible User-Agent to get ttf URLs instead of woff2
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
    const resp = await fetch(url, {
      headers: {
        // This UA forces Google to return TTF format
        "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/531.22.7 (KHTML, like Gecko) Version/5.0 Safari/531.22.7",
      },
    });

    if (!resp.ok) {
      return NextResponse.json({ error: "Font not found", status: resp.status }, { status: 404 });
    }

    const css = await resp.text();

    // Extract ALL font URLs (TTF preferred)
    const allUrls: string[] = [];
    const blocks = css.match(/@font-face\s*\{[^}]+\}/g) || [];
    for (const block of blocks) {
      const urlMatch = block.match(/url\((https:\/\/[^)]+)\)/);
      if (urlMatch) allUrls.push(urlMatch[1]);
    }

    // First URL is typically the one with broadest unicode coverage
    const fontUrl = allUrls[0] || null;

    return NextResponse.json({ css, fontUrl, allUrls });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}