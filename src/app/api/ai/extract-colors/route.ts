import { NextRequest, NextResponse } from 'next/server'
import { extractColorsFromImage } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing imageUrl' },
        { status: 400 }
      )
    }

    const result = await extractColorsFromImage(imageUrl)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
