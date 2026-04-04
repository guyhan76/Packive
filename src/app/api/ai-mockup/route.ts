import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, L, W, D, boxType, mode, material } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-image-preview',
      generationConfig: {
        responseModalities: ['image', 'text'],
      },
    });

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    let prompt: string;

    if (mode === 'enhance') {
      const matDesc = material === 'kraft'
        ? 'brown kraft corrugated cardboard with visible fiber texture'
        : 'white coated smooth cardboard with subtle matte finish';

      prompt = `This is a 3D render of a ${matDesc} packaging box (${L}x${W}x${D}mm).

ABSOLUTE RULES — VIOLATION IS FORBIDDEN:
1. Every printed design, text, logo, image, color, and graphic on EVERY face of the box must remain PIXEL-PERFECT IDENTICAL to the input. Do NOT redraw, move, resize, distort, recolor, or remove ANY element.
2. The box shape, proportions, folding structure, and camera angle must remain EXACTLY as shown.
3. The box surface base color must remain exactly as shown — ${material === 'kraft' ? 'brown kraft' : 'white'}.

YOUR ONLY JOB — enhance the photograph quality:
- Replace the background with a premium product photography studio: soft neutral gray-to-white gradient, clean and minimal
- Add professional 3-point studio lighting: key light from upper-left, fill light from right, rim light from behind
- Add realistic subtle shadow beneath the box on a reflective surface
- Add very subtle ambient occlusion along the box edges and folds
- Make the ${matDesc} texture feel tactile and real
- The final result should look like a high-end commercial product photograph shot with a DSLR camera

Generate the enhanced photograph now.`;
    } else {
      prompt = `You are looking at a flat dieline (die-cut template) for a ${boxType || 'FEFCO 0201'} corrugated box (${L}x${W}x${D}mm).

Assemble this dieline into a perfectly folded 3D box. Preserve ALL artwork, text, and designs exactly as printed. Render in a minimal studio with soft lighting, ultra-realistic detail, matte ${material === 'kraft' ? 'brown kraft' : 'white coated'} paperboard texture, crisp folds. Show the box upright at a 3/4 angle. Premium editorial aesthetic.`;
    }

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    const candidates = response.candidates;

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ error: 'No response from Gemini' }, { status: 500 });
    }

    const parts = candidates[0].content.parts;
    const imagePart = parts.find((p: any) => p.inlineData);

    if (imagePart && imagePart.inlineData) {
      const generatedImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      return NextResponse.json({ image: generatedImage });
    }

    const textPart = parts.find((p: any) => p.text);
    return NextResponse.json({
      error: 'No image generated',
      text: textPart?.text || 'Unknown error',
    }, { status: 500 });

  } catch (error: any) {
    console.error('AI Mockup error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to generate mockup',
    }, { status: 500 });
  }
}
