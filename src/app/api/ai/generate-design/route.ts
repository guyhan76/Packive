import { NextRequest, NextResponse } from 'next/server'
import { generatePackageDesign } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { prompt, boxType, dimensions } = await req.json()

    if (!prompt || !boxType || !dimensions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: prompt, boxType, dimensions' },
        { status: 400 }
      )
    }

    const result = await generatePackageDesign(prompt, boxType, dimensions)

    if (!result.success || !result.url) {
      return NextResponse.json({
        success: false,
        error: result.error || 'No image generated',
      })
    }

    // Download image from OpenAI URL and convert to base64 (avoids CORS)
    try {
      const imageResponse = await fetch(result.url)
      const arrayBuffer = await imageResponse.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const dataUrl = `data:image/png;base64,${base64}`

      return NextResponse.json({
        success: true,
        imageUrl: dataUrl,
      })
    } catch {
      // If download fails, return original URL as fallback
      return NextResponse.json({
        success: true,
        imageUrl: result.url,
      })
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
