import { NextRequest, NextResponse } from 'next/server'
import { generatePackageCopy } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { productName, brandName, targetAudience, language, category, tone } = await req.json()

    if (!productName || !brandName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: productName, brandName' },
        { status: 400 }
      )
    }

    const result = await generatePackageCopy(
      productName,
      brandName,
      targetAudience || 'General',
      language || 'en',
      category,
      tone
    )
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
