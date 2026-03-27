import { NextRequest, NextResponse } from 'next/server';
import { generateDieline, downloadDieline, DctDielineVariables, DctConfig } from '@/lib/dct-api';
import { getDctTemplateId, modelNameToBoxCode } from '@/lib/dct-templates';

// === Dieline Cache ===
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'public', 'dielines', 'cache');

function getCacheKey(model: string, params: Record<string, any>): string {
  const parts = [
    model,
    params.length, params.width, params.depth,
    params.thickness || '4',
    params.units || 'mm',
    params.height || ''
  ].filter(Boolean).join('_');
  return parts.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getCachePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

function getFromCache(key: string): any | null {
  const p = getCachePath(key);
  if (fs.existsSync(p)) {
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
      console.log(`[Dieline-Cache] HIT: ${key}`);
      return data;
    } catch { return null; }
  }
  return null;
}

function saveToCache(key: string, data: any): void {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(getCachePath(key), JSON.stringify(data), 'utf-8');
  console.log(`[Dieline-Cache] SAVED: ${key}`);
}


// Legacy EasyPackMaker import (fallback)
let generateModelEPM: any = null;
try {
  const epm = require('@/lib/easypackmaker-api');
  generateModelEPM = epm.generateModel;
} catch {}

function getDctConfig(): DctConfig {
  return {
    apiKey: process.env.DCT_API_KEY || '',
    useSandbox: process.env.DCT_USE_SANDBOX === 'true',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelName, epmModel, length, width, depth, thickness, units, options, height } = body;
    console.log('[Dieline] RECEIVED params:', { modelName, epmModel, length, width, depth, thickness, units, height });

    if (!modelName || !length || !width || !depth) {
      return NextResponse.json(
        { error: 'Missing required parameters: modelName, length, width, depth' },
        { status: 400 }
      );
    }

    // === Check Cache ===
    const cacheKey = getCacheKey(epmModel || modelName, { length, width, depth, thickness, units, height });
    const cached = getFromCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // === Determine API priority ===
    // If epmModel is provided (from template), prefer EPM for consistent clean output
    const preferEPM = !!epmModel;

    // === Try Die Cut Templates API first (only if not preferring EPM) ===
    const dctConfig = getDctConfig();
    const boxCode = modelNameToBoxCode(modelName);
    const dctTemplateId = getDctTemplateId(boxCode);

    console.log('[Dieline] modelName:', modelName, 'epmModel:', epmModel, '-> boxCode:', boxCode, '-> dctTemplateId:', dctTemplateId, '| apiKey set:', !!dctConfig.apiKey);

    if (dctConfig.apiKey && dctTemplateId && !preferEPM) {
      console.log(`[Dieline-DCT] Generating ${boxCode} (${dctTemplateId}) L=${length} W=${width} D=${depth} Th=${thickness}`);

      try {
        const variables: DctDielineVariables = {
          unit: (units === 'in' ? 'in' : 'mm') as 'mm' | 'in',
          material: Number(thickness) || 3.0,
          length: Number(length),
          width: Number(width),
          height: Number(depth),
          dimension_type: 'external',
          printing_method: 'offset',
          dimension_texts: false,
        };

        // Generate SVG dieline
        const dieline = await generateDieline(dctConfig, dctTemplateId, 'svg', variables);
        console.log(`[Dieline-DCT] Generated: ${dieline.id}, artwork: ${dieline.artwork_dimensions.width}x${dieline.artwork_dimensions.height}mm`);

        // Download SVG content
        let svgContent = await downloadDieline(dieline);
        console.log(`[Dieline-DCT] SVG downloaded: ${svgContent.length} chars`);
        // Remove flute direction mark and info text (same as EPM)
        svgContent = svgContent.replace(/<path[^>]*stroke:#7b7979[^>]*\/>/gs, '');
        svgContent = svgContent.replace(/<path[^>]*stroke:#231f20[^>]*\/>/gs, '');
        svgContent = svgContent.replace(/<path[^>]*aria-label="[^"]*"[^>]*\/>/gs, '');
        console.log('[Dieline-DCT] SVG cleaned');

        const dctResult = {
          success: true,
          svg: svgContent,
          preview: null,
          sizes: {
            PageW: parseFloat(dieline.artwork_dimensions.width),
            PageH: parseFloat(dieline.artwork_dimensions.height),
          },
          dctDielineId: dieline.id,
          dctDielineUrl: dieline.url,
          source: 'dct',
        };
        saveToCache(cacheKey, dctResult);
        return NextResponse.json(dctResult);
      } catch (dctError: any) {
        console.error(`[Dieline-DCT] Error: ${dctError.message}. Falling back to EPM...`);
        // Fall through to EasyPackMaker
      }
    }

    // === Fallback: EasyPackMaker API ===
    console.log(`[Dieline-EPM] Fallback for ${modelName}`);

    const epmConfig = {
      username: process.env.EPM_USERNAME || '',
      password: process.env.EPM_PASSWORD || '',
    };

    if (!epmConfig.username || !epmConfig.password || !generateModelEPM) {
      return NextResponse.json(
        { error: `No API available for box type: ${boxCode || modelName}. DCT template not mapped, EPM not configured.` },
        { status: 400 }
      );
    }

    const { EpmModelParams, EpmModelOptions } = require('@/lib/easypackmaker-api');

    const params = {
      L: String(length),
      W: String(width),
      D: String(depth),
      Th: String(thickness || 4),
      Units: units || 'mm',
    } as any;
    if (height) params.H = String(height);

    // Build options - some models don't support GlueZone (e.g., 04xx folder types)
    const baseOptions: Record<string, any> = {
      DimensionType: 'In',
      KnifeInfo: true,
      Sizes: true,
    };
    // Only add GlueZone for models that support it (02xx slotted, 03xx telescope, 05xx slide, 07xx ready-glued)
    const epmName = epmModel || modelName || '';
    if (/^fefco_(02|03|05|07)/.test(epmName) || /^A\d/.test(epmName)) {
      baseOptions.GlueZone = false;
    }
    const modelOptions = { ...baseOptions, ...options };

    console.log(`[Dieline-EPM] Generating ${epmModel || modelName} L=${length} W=${width} D=${depth} Th=${thickness}`);
    // Use epmModel (from template) if provided, otherwise fall back to modelName from client
      const epmModelName = epmModel || modelName;
      console.log(`[Dieline-EPM] Using model: ${epmModelName} (epmModel=${epmModel}, modelName=${modelName})`);
      const result = await generateModelEPM(epmConfig, epmModelName, params, modelOptions);

    if (result.Status !== 'Success') {
      return NextResponse.json(
        { error: `EasyPackMaker: ${result.Details || 'Unknown error'}`, code: result.ErrorCode },
        { status: 400 }
      );
    }

    if (!result.Model) {
      return NextResponse.json({ error: 'No model data returned' }, { status: 500 });
    }

    // Convert PDF to SVG (requires Inkscape)
    const { execFile } = require('child_process');
    const { writeFile, readFile, unlink, mkdtemp } = require('fs/promises');
    const { tmpdir } = require('os');
    const path = require('path');
    const { promisify } = require('util');
    const execFileAsync = promisify(execFile);

    const INKSCAPE_PATHS = [
      'C:\\Program Files\\Inkscape\\bin\\inkscape.exe',
      'C:\\Program Files (x86)\\Inkscape\\bin\\inkscape.exe',
      '/usr/bin/inkscape',
      'inkscape',
    ];

    let inkscape: string | null = null;
    for (const p of INKSCAPE_PATHS) {
      try { await execFileAsync(p, ['--version']); inkscape = p; break; } catch {}
    }
    if (!inkscape) throw new Error('Inkscape not found on server');

    const tmpDir = await mkdtemp(path.join(tmpdir(), 'dieline-'));
    const pdfPath = path.join(tmpDir, 'model.pdf');
    const svgPath = path.join(tmpDir, 'model.svg');

    try {
      const pdfBuffer = Buffer.from(result.Model, 'base64');
      await writeFile(pdfPath, pdfBuffer);
      await execFileAsync(inkscape, [pdfPath, '--export-type=svg', '--export-filename=' + svgPath], { timeout: 30000 });
      let svgContent = await readFile(svgPath, 'utf-8');
      // Remove flute direction mark (gray #7b7979 paths)
      svgContent = svgContent.replace(/<path[^>]*stroke:#7b7979[^>]*\/>/gs, '');
      svgContent = svgContent.replace(/<path[^>]*stroke:#7b7979[^/]*?\/>/gs, '');
      console.log('[Dieline-EPM] Removed flute direction marks');
      // Remove info text paths (black #231f20 and aria-label paths)
      svgContent = svgContent.replace(/<path[^>]*stroke:#231f20[^>]*\/>/gs, '');
      svgContent = svgContent.replace(/<path[^>]*aria-label="[^"]*"[^>]*\/>/gs, '');
      console.log('[Dieline-EPM] Removed info text paths');

      const epmResult = {
        success: true,
        svg: svgContent,
        preview: result.Preview || null,
        sizes: result.Sizes || null,
        source: 'epm',
      };
      saveToCache(cacheKey, epmResult);
      return NextResponse.json(epmResult);
    } finally {
      try { await unlink(pdfPath); } catch {}
      try { await unlink(svgPath); } catch {}
      try { const { rmdir } = require('fs/promises'); await rmdir(tmpDir); } catch {}
    }

  } catch (error: any) {
    console.error('[Dieline] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
