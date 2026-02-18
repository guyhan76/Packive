import { NextRequest, NextResponse } from 'next/server'
import { reviewDesignQuality } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, boxType, dimensions, material, language } = await req.json()

    if (!imageBase64 || !boxType || !dimensions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: imageBase64, boxType, dimensions' },
        { status: 400 }
      )
    }

    const result = await reviewDesignQuality(imageBase64, boxType, dimensions, material, language)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
