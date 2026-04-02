import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const GS_PATH = process.env.GS_PATH || 'C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe';
const INK_PATH = process.env.INK_PATH || 'C:\\Program Files\\Inkscape\\bin\\inkscape.com';

const TIMEOUT = 180000;

// ─── CorelDRAW EPS Native Parser ───
function parseCorelDrawEPS(content: string): { svg: string; width: number; height: number; pathCount: number } | null {
  if (!content.includes('wCorel') && !content.includes('CorelDRAW')) {
    return null;
  }

  const bbMatch = content.match(/%%BoundingBox:\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  if (!bbMatch) return null;

  const x1 = parseInt(bbMatch[1]);
  const y1 = parseInt(bbMatch[2]);
  const x2 = parseInt(bbMatch[3]);
  const y2 = parseInt(bbMatch[4]);
  const w = x2 - x1;
  const h = y2 - y1;
  const totalH = y1 + y2;

  const lines = content.split('\n');
  const segments: string[][] = [];
  let currentPath: string[] = [];
  let inDrawing = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.includes('%%EndPageSetup')) { inDrawing = true; continue; }
    if (!inDrawing) continue;

    // Skip type indicators
    if (/^[\d.]+\s+[\d.]+\s+\/$/.test(line)) continue;

    // moveto
    const mMatch = line.match(/^([\d.]+)\s+([\d.]+)\s+m$/);
    if (mMatch) {
      if (currentPath.length > 0) segments.push([...currentPath]);
      currentPath = [`M ${mMatch[1]} ${mMatch[2]}`];
      continue;
    }

    // lineto
    const lMatch = line.match(/^([\d.]+)\s+([\d.]+)\s+l$/);
    if (lMatch) {
      currentPath.push(`L ${lMatch[1]} ${lMatch[2]}`);
      continue;
    }

    // curveto
    const cMatch = line.match(/^([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+C/);
    if (cMatch) {
      currentPath.push(`C ${cMatch[1]} ${cMatch[2]} ${cMatch[3]} ${cMatch[4]} ${cMatch[5]} ${cMatch[6]}`);
      continue;
    }

    // stroke / closepath
    if (line === 'S' || line === '@c') {
      if (currentPath.length > 0) {
        segments.push([...currentPath]);
        currentPath = [];
      }
    }
  }
  if (currentPath.length > 0) segments.push([...currentPath]);

  if (segments.length === 0) return null;

  const svgPaths = segments.map(seg => {
    const d = seg.join(' ');
    return `  <path d="${d}" fill="none" stroke="#000000" stroke-width="0.72" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('\n');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${w}" height="${h}"
     viewBox="${x1} ${y1} ${w} ${h}">
  <g transform="scale(1,-1) translate(0,-${totalH})">
${svgPaths}
  </g>
</svg>`;

  return { svg, width: w, height: h, pathCount: segments.length };
}

export async function POST(request: NextRequest) {
  const tempDir = join(tmpdir(), `packive-${randomUUID()}`);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    if (!['eps', 'ai', 'pdf'].includes(ext)) {
      return NextResponse.json({ error: `Unsupported format: .${ext}. Use .eps, .ai, or .pdf` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const steps: string[] = [];

    // ─── Try CorelDRAW native parser first (no Ghostscript/Inkscape needed) ───
    if (ext === 'eps' || ext === 'ai') {
      const textContent = buffer.toString('utf-8');
      const parsed = parseCorelDrawEPS(textContent);

      if (parsed) {
        steps.push(`CorelDRAW native parser: ${parsed.pathCount} paths extracted`);
        return NextResponse.json({
          success: true,
          svg: parsed.svg,
          width: parsed.width,
          height: parsed.height,
          filename,
          steps,
          originalSize: buffer.length,
          svgSize: parsed.svg.length,
          viewBox: null,
          parser: 'coreldraw-native'
        });
      }
      steps.push('Not CorelDRAW format, using Ghostscript pipeline');
    }

    // ─── Standard pipeline: Ghostscript + Inkscape ───
    await mkdir(tempDir, { recursive: true });

    const inputPath = join(tempDir, `input.${ext}`);
    await writeFile(inputPath, buffer);

    let pdfPath = inputPath;
    let svgPath = join(tempDir, 'output.svg');

    // Step 1: EPS/AI -> PDF (via Ghostscript)
    if (ext === 'eps' || ext === 'ai') {
      if (!existsSync(GS_PATH)) {
        return NextResponse.json({ error: 'Ghostscript not found. Install from https://www.ghostscript.com' }, { status: 500 });
      }

      pdfPath = join(tempDir, 'intermediate.pdf');

      try {
        await execFileAsync(GS_PATH, [
          '-q', '-dNOPAUSE', '-dBATCH', '-dEPSCrop',
          '-sDEVICE=pdfwrite',
          `-sOutputFile=${pdfPath}`,
          inputPath
        ], { timeout: 30000 });
        steps.push(`GS: ${ext.toUpperCase()} -> PDF`);
      } catch (gsErr: any) {
        return NextResponse.json({
          error: `Ghostscript conversion failed: ${gsErr.message}`,
          step: `${ext.toUpperCase()} -> PDF`
        }, { status: 500 });
      }
    }

    // Step 2: PDF -> SVG (via Inkscape)
    if (!existsSync(INK_PATH)) {
      return NextResponse.json({ error: 'Inkscape not found. Install from https://inkscape.org' }, { status: 500 });
    }

    const pdfSize = existsSync(pdfPath) ? (await readFile(pdfPath)).length : 0;
    let finalPdfPath = pdfPath;

    if (ext === 'pdf' && pdfSize > 5 * 1024 * 1024 && existsSync(GS_PATH)) {
      const page1Path = join(tempDir, 'page1.pdf');
      try {
        await execFileAsync(GS_PATH, [
          '-q', '-dNOPAUSE', '-dBATCH',
          '-dFirstPage=1', '-dLastPage=1',
          '-sDEVICE=pdfwrite',
          `-sOutputFile=${page1Path}`,
          pdfPath
        ], { timeout: 30000 });
        finalPdfPath = page1Path;
        steps.push('GS: Extracted page 1 from large PDF');
      } catch {
        steps.push('GS: Page extraction skipped (using original)');
      }
    }

    try {
      await execFileAsync(INK_PATH, [
        '--pdf-poppler',
        '--pages=1',
        '--export-dpi=300',
        finalPdfPath,
        `--export-filename=${svgPath}`,
        '--export-plain-svg'
      ], { timeout: TIMEOUT });
      steps.push('Inkscape: PDF -> SVG (poppler)');
    } catch (inkErr1: any) {
      try {
        await execFileAsync(INK_PATH, [
          finalPdfPath,
          `--export-filename=${svgPath}`,
          '--export-dpi=300',
          '--export-plain-svg'
        ], { timeout: TIMEOUT });
        steps.push('Inkscape: PDF -> SVG (internal)');
      } catch (inkErr2: any) {
        return NextResponse.json({
          error: `Inkscape conversion failed: ${inkErr2.message}`,
          step: 'PDF -> SVG',
          stderr: inkErr2.stderr?.substring(0, 500)
        }, { status: 500 });
      }
    }

    if (!existsSync(svgPath)) {
      return NextResponse.json({ error: 'Conversion produced no output' }, { status: 500 });
    }

    const svgContent = await readFile(svgPath, 'utf-8');

    const widthMatch = svgContent.match(/width="([^"]+)"/);
    const heightMatch = svgContent.match(/height="([^"]+)"/);
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);

    let width = widthMatch ? parseFloat(widthMatch[1]) : 0;
    let height = heightMatch ? parseFloat(heightMatch[1]) : 0;

    if (widthMatch && widthMatch[1].includes('pt')) {
      width = parseFloat(widthMatch[1]) * 1.333333;
      height = parseFloat(heightMatch?.[1] || '0') * 1.333333;
    }

    if (viewBoxMatch) {
      const vb = viewBoxMatch[1].split(/\s+/).map(Number);
      if (vb.length === 4) {
        if (!width) width = vb[2];
        if (!height) height = vb[3];
      }
    }

    return NextResponse.json({
      success: true,
      svg: svgContent,
      width: Math.round(width),
      height: Math.round(height),
      filename,
      steps,
      originalSize: buffer.length,
      svgSize: svgContent.length,
      viewBox: viewBoxMatch ? viewBoxMatch[1] : null
    });

  } catch (err: any) {
    return NextResponse.json({
      error: `Conversion failed: ${err.message}`
    }, { status: 500 });
  } finally {
    try {
      if (existsSync(tempDir)) {
        await rm(tempDir, { recursive: true, force: true });
      }
    } catch {}
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};