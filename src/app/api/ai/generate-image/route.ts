import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PROMPT_TEMPLATES: Record<string, (input: string) => string> = {
    logo: (input) =>
      `Design a clean, professional brand logo: ${input}. Minimalist style, vector-like, centered, suitable for packaging print. IMPORTANT: Do NOT include any text, letters, words, characters, or typography in the image. Symbol/icon only. High contrast, crisp edges.`,
    product: (input) =>
      `Professional product photography of ${input}. Clean studio lighting, high resolution, centered, no background, suitable for packaging design. Photorealistic, commercial quality. IMPORTANT: Do NOT include any text, letters, words, characters, labels, or typography anywhere in the image. Image only, no text at all.`,
    background: (input) =>
      `${input}. Seamless pattern or background suitable for packaging design. High resolution, print quality, vibrant colors. IMPORTANT: Do NOT include any text, letters, words, characters, or typography in the image.`,
    illustration: (input) =>
      `${input}. Clean vector-style illustration suitable for packaging design. Simple, bold lines, print-ready quality. IMPORTANT: Do NOT include any text, letters, words, characters, or typography in the image.`,
    icon: (input) =>
      `${input}. Simple flat icon design, minimal detail, bold shapes, suitable for packaging label or badge. Clean edges, centered. IMPORTANT: Do NOT include any text, letters, words, characters, or typography in the image.`,
    free: (input) => `${input}. IMPORTANT: Do NOT include any text, letters, words, characters, or typography in the image unless explicitly requested.`,
  };
  

export async function POST(req: NextRequest) {
  try {
    const { category, prompt, transparent } = await req.json();
    if (!prompt || !category) {
      return NextResponse.json({ error: 'prompt and category are required' }, { status: 400 });
    }

    const template = PROMPT_TEMPLATES[category] || PROMPT_TEMPLATES.free;
    const fullPrompt = template(prompt);

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: fullPrompt,
      size: '1024x1024',
      quality: 'medium',
      background: transparent ? 'transparent' : 'opaque',
      output_format: 'png',
      n: 1,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    return NextResponse.json({
      image: `data:image/png;base64,${b64}`,
      usage: response.usage,
    });
  } catch (error: any) {
    console.error('AI image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Image generation failed' },
      { status: 500 }
    );
  }
}
