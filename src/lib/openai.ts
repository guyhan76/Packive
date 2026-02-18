import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder',
})

const isConfigured = () => {
  const key = process.env.OPENAI_API_KEY
  return key && key !== 'placeholder' && key.length > 10
}

// ============================================================
// A) Generate Package Design Image (DALL-E 3)
// ============================================================
export async function generatePackageDesign(
  prompt: string,
  boxType: string,
  dimensions: { L: number; W: number; D: number }
) {
  if (!isConfigured()) {
    return { success: false, error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local', url: null }
  }

  const systemPrompt = `Design a single flat rectangular graphic for the ${boxType} panel of a product box. This is ONLY the ${boxType} face (${dimensions.L}x${dimensions.D}mm). DO NOT draw a 3D box or unfolded box template. DO NOT show multiple panels or fold lines. Create ONLY a single flat rectangle design that fills the entire image. Design concept: ${prompt}. Requirements: Clean professional product packaging design, suitable for print at 300DPI, vibrant CMYK-safe colors, include brand name placeholder, product info area, and decorative elements. The design should look like a finished single-panel artwork ready to be placed on one face of a box.`

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: systemPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })
    return { success: true, url: response.data?.[0]?.url || null, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, url: null, error: message }
  }
}

// ============================================================
// B) Generate Package Copy Text (GPT-4o-mini)
// ============================================================
export async function generatePackageCopy(
  productName: string,
  brandName: string,
  targetAudience: string,
  language: string,
  category?: string,
  tone?: string
) {
  if (!isConfigured()) {
    return { success: false, error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local', data: null }
  }

  const langMap: Record<string, string> = { en: 'English', ko: 'Korean', ja: 'Japanese' }
  const langName = langMap[language] || 'English'
  const catLine = category ? `\nProduct Category: ${category}` : ''
  const toneLine = tone ? `\nTone: ${tone}` : ''

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a packaging copy expert. Generate all text in ${langName}. Return valid JSON only, no markdown.`,
        },
        {
          role: 'user',
          content: `Generate packaging copy for:
Product: ${productName}
Brand: ${brandName}
Target Audience: ${targetAudience}${catLine}${toneLine}
Language: ${langName}

Return JSON with these exact keys:
{
  "headline": "catchy product headline",
  "description": "product description under 50 characters",
  "slogan": "marketing slogan",
  "features": ["feature 1", "feature 2", "feature 3"],
  "backPanel": "detailed back panel copy with ingredients/usage/etc"
}`,
        },
      ],
      temperature: 0.8,
    })
    const content = response.choices[0]?.message?.content || '{}'
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    try {
      const data = JSON.parse(cleaned)
      return { success: true, ...data, error: null }
    } catch {
      return { success: true, score: 75, summary: cleaned, issues: [], materialNotes: '', error: null }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// ============================================================
// C) Review Design Quality — 26-year packaging expert prompt
// ============================================================
export async function reviewDesignQuality(
  imageBase64: string,
  boxType: string,
  dimensions: { L: number; W: number; D: number },
  materialId?: string
) {
  if (!isConfigured()) {
    return { success: false, error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local', data: null }
  }

  const matLine = materialId ? ` Material: ${materialId}.` : ''

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a senior packaging print quality inspector with 26 years of experience in the Korean packaging industry. You specialize in corrugated board and single-sheet cardboard packaging (SC Manila, IV Ivory, RIV Royal Ivory, G/F/E/B/C/A flute, and double-wall EB/CB/BB/BA).

Analyze the provided packaging design image and check for the following issues based on real manufacturing standards:

CRITICAL CHECKS:
1. Text near fold lines: Any text within 3mm of fold lines will be distorted when the box is assembled. Flag this as CRITICAL.
2. Bleed margin: Default bleed should be 5mm on all sides, and 10mm on the glue flap side. Elements extending beyond these margins will be cut off.
3. Glue flap area: The glue flap area must be clean - no important design elements should be placed here as it will be covered with adhesive.
4. Dust flap design: Dust flaps are usually not visible when assembled. Warn if important branding is placed on dust flaps.
5. Snap lock bottom: For FEFCO 0215, the bottom snap-lock flaps should not have critical design elements as they overlap during assembly.

WARNING CHECKS:
6. Color contrast: Thin text under 8pt on dark backgrounds may not print clearly, especially on corrugated board where ink absorption is higher.
7. Barcode placement: Barcodes should be on a flat panel (not near fold lines), minimum 10mm from any edge, with quiet zone of at least 5mm.
8. Image resolution: If visible pixelation is detected, warn about print quality at 300 DPI.
9. Panel consistency: Front and back panels should have consistent design language.
10. Tuck flap: The tuck flap area often shows when the box is opened - consider if it needs design treatment.

MATERIAL-SPECIFIC CHECKS:
11. For corrugated board (fluted): Fine gradients and thin lines (<0.5pt) may not reproduce well due to the uneven surface.
12. For single-sheet cardboard: Embossing and debossing areas should be marked separately.

Respond in this exact JSON format (no markdown, no code fences):
{
  "score": (number 0-100),
  "issues": [{"type": "string", "severity": "critical|warning|info", "description": "string", "suggestion": "string"}],
  "summary": "2-3 sentence overall assessment",
  "materialNotes": "specific notes based on the material type"
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Review this packaging design for a ${boxType} box (${dimensions.L}x${dimensions.W}x${dimensions.D}mm).${matLine}`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/png;base64,${imageBase64}` },
            },
          ],
        },
      ],
      max_tokens: 1500,
    })
    const content = response.choices[0]?.message?.content || '{}'
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    try {
      const data = JSON.parse(cleaned)
      return { success: true, data, error: null }
    } catch {
      return { success: true, data: { headline: content, description: '', slogan: '', features: [], backPanel: '' }, error: null }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, data: null, error: message }
  }
}

// ============================================================
// D) Extract Colors from Image (GPT-4o-mini Vision)
// ============================================================
export async function extractColorsFromImage(imageUrl: string) {
  if (!isConfigured()) {
    return { success: false, error: 'OpenAI API key not configured.', colors: null }
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this packaging design image and extract the 5 most prominent colors. Return ONLY a JSON array of 5 objects with "hex" (color hex code) and "name" (color name in English). Example: [{"hex": "#F5E6D0", "name": "Cream"}]. Return ONLY the JSON array, no other text.',
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 300,
    })
    const content = response.choices[0]?.message?.content || '[]'
    const colors = JSON.parse(content)
    return { success: true, colors, error: null }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, colors: null, error: message }
  }
}
