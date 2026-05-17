import { NextResponse } from "next/server";
import { getCredits } from "@/lib/recraft";

export async function GET() {
  try {
    const token = process.env.RECRAFT_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "RECRAFT_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    const info = await getCredits({ token });

    return NextResponse.json({
      success: true,
      credits: info.credits,
      creditsUsd: info.credits / 1000,
      email: info.email,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[credits]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}