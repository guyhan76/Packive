import { NextRequest, NextResponse } from 'next/server';
import { callEpmApi, EpmModelParams, EpmModelOptions, decodePdf } from '@/lib/easypackmaker-api';

const EPM_CONFIG = {
  userName: process.env.EPM_USERNAME || '',
  password: process.env.EPM_PASSWORD || '',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelName, orderId, modelParams, modelOptions, previewOnly } = body;

    if (!modelName || !modelParams) {
      return NextResponse.json({ error: 'Missing modelName or modelParams' }, { status: 400 });
    }

    if (!EPM_CONFIG.userName || !EPM_CONFIG.password) {
      return NextResponse.json({ error: 'EasyPackMaker API credentials not configured' }, { status: 500 });
    }

    const params: EpmModelParams = {
      L: String(modelParams.L),
      W: String(modelParams.W),
      D: String(modelParams.D),
      Th: String(modelParams.Th),
      Units: modelParams.Units || 'mm',
    };

    const options: EpmModelOptions = {
      DimensionType: modelOptions?.DimensionType || 'In',
      KnifeInfo: modelOptions?.KnifeInfo ?? true,
      GlueZone: modelOptions?.GlueZone ?? false,
      Sizes: modelOptions?.Sizes ?? true,
      ...(modelOptions?.FluteDir && { FluteDir: modelOptions.FluteDir }),
      ...(modelOptions?.GlueFlapCorr && { GlueFlapCorr: modelOptions.GlueFlapCorr }),
      ...(modelOptions?.LinesColors && { LinesColors: modelOptions.LinesColors }),
    };

    const result = await callEpmApi(
      EPM_CONFIG,
      modelName,
      orderId || `order_${Date.now()}`,
      params,
      options,
      previewOnly || false
    );

    if (result.Status === 0 && result.ModelData) {
      // PDF base64 → return as downloadable or for conversion
      return NextResponse.json({
        success: true,
        pdfBase64: result.ModelData,
        preview: result.ModelPreview || null,
        description: result.ModelDescription || null,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.StatusMessage || result.ErrorMessage || 'Unknown error',
        status: result.Status,
      }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[EasyPackMaker API Error]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}