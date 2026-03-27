import { NextRequest, NextResponse } from 'next/server';
import { create3dMockup, DctConfig } from '@/lib/dct-api';

function getDctConfig(): DctConfig {
  return {
    apiKey: process.env.DCT_API_KEY || '',
    useSandbox: process.env.DCT_USE_SANDBOX === 'true',
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const dielineId = formData.get('dielineId') as string;
    const file = formData.get('file') as File;
    const name = (formData.get('name') as string) || 'Packive Design';
    const outsideDesign = formData.get('outside_design') !== 'false';

    if (!dielineId || !file) {
      return NextResponse.json(
        { error: 'Missing required: dielineId and file' },
        { status: 400 }
      );
    }

    const config = getDctConfig();
    if (!config.apiKey) {
      return NextResponse.json(
        { error: 'DCT API key not configured' },
        { status: 500 }
      );
    }

    console.log(`[3D-Mockup] Creating mockup for dieline ${dielineId}, file: ${file.name} (${file.size} bytes)`);

    const buffer = Buffer.from(await file.arrayBuffer());
    const mockup = await create3dMockup(config, dielineId, buffer, file.name, {
      name,
      outside_design: outsideDesign,
    });

    console.log(`[3D-Mockup] Created: ${mockup.id} -> ${mockup.url}`);

    return NextResponse.json({
      success: true,
      mockupId: mockup.id,
      mockupUrl: mockup.url,
    });

  } catch (error: any) {
    console.error('[3D-Mockup] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create 3D mockup' },
      { status: 500 }
    );
  }
}
