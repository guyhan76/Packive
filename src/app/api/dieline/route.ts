import { NextRequest, NextResponse } from 'next/server';
import { generateModel, EpmModelParams, EpmModelOptions } from '@/lib/easypackmaker-api';
import { execFile } from 'child_process';
import { writeFile, readFile, unlink, mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Find Inkscape path
const INKSCAPE_PATHS = [
  'C:\\Program Files\\Inkscape\\bin\\inkscape.exe',
  'C:\\Program Files (x86)\\Inkscape\\bin\\inkscape.exe',
  '/usr/bin/inkscape',
  'inkscape',
];

async function findInkscape(): Promise<string | null> {
  for (const p of INKSCAPE_PATHS) {
    try {
      await execFileAsync(p, ['--version']);
      return p;
    } catch { /* continue */ }
  }
  return null;
}

async function pdfToSvg(pdfBase64: string): Promise<string> {
  const inkscape = await findInkscape();
  if (!inkscape) throw new Error('Inkscape not found on server');

  // Create temp directory
  const tmpDir = await mkdtemp(path.join(tmpdir(), 'dieline-'));
  const pdfPath = path.join(tmpDir, 'model.pdf');
  const svgPath = path.join(tmpDir, 'model.svg');

  try {
    // Write PDF
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    await writeFile(pdfPath, pdfBuffer);

    // Convert with Inkscape
    await execFileAsync(inkscape, [
      pdfPath,
      '--export-type=svg',
      '--export-filename=' + svgPath,
    ], { timeout: 30000 });

    // Read SVG
    const svgContent = await readFile(svgPath, 'utf-8');
    return svgContent;
  } finally {
    // Cleanup
    try { await unlink(pdfPath); } catch {}
    try { await unlink(svgPath); } catch {}
    try { const { rmdir } = require('fs/promises'); await rmdir(tmpDir); } catch {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelName, length, width, depth, thickness, units, options, height } = body;

    if (!modelName || !length || !width || !depth) {
      return NextResponse.json(
        { error: 'Missing required parameters: modelName, length, width, depth' },
        { status: 400 }
      );
    }

    const config = {
      username: process.env.EPM_USERNAME || '',
      password: process.env.EPM_PASSWORD || '',
    };

    if (!config.username || !config.password) {
      return NextResponse.json(
        { error: 'EasyPackMaker API credentials not configured' },
        { status: 500 }
      );
    }

    const params: EpmModelParams = {
      L: String(length),
      W: String(width),
      D: String(depth),
      Th: String(thickness || 4),
      Units: units || 'mm',
    };
    if (height) params.H = String(height);

    const modelOptions: EpmModelOptions = {
      DimensionType: 'In',
      KnifeInfo: true,
      GlueZone: false,
      Sizes: true,
      ...options,
    };

    // 1. Call EasyPackMaker API
    console.log(`[Dieline] Generating ${modelName} L=${length} W=${width} D=${depth} Th=${thickness}`);
    const result = await generateModel(config, modelName, params, modelOptions);

    if (result.Status !== 'Success') {
      return NextResponse.json(
        { error: `EasyPackMaker: ${result.Details || 'Unknown error'}`, code: result.ErrorCode },
        { status: 400 }
      );
    }

    if (!result.Model) {
      return NextResponse.json({ error: 'No model data returned' }, { status: 500 });
    }

    // 2. Convert PDF to SVG
    console.log('[Dieline] Converting PDF to SVG via Inkscape...');
    const svgContent = await pdfToSvg(result.Model);
    console.log(`[Dieline] SVG generated: ${svgContent.length} chars`);

    return NextResponse.json({
      success: true,
      svg: svgContent,
      preview: result.Preview || null,
      sizes: result.Sizes || null,
    });

  } catch (error: any) {
    console.error('[Dieline] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
