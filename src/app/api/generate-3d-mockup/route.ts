import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";

export const runtime = "nodejs";
export const maxDuration = 120;

const BLENDER_PATH = process.env.BLENDER_PATH || "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe";
const SCRIPT_PATH = path.join(process.cwd(), "lib", "blender_mockup.py");
const OUTPUT_DIR = path.join(process.cwd(), "public", "models", "generated");
const DESIGN_CACHE_DIR = path.join(os.tmpdir(), "packive-design-cache");

// ★ 12-panel FEFCO 0201 지원 — 4 측면 + 4 top inner flap + 4 bot inner flap + 2 legacy composite
const FACE_NAMES = [
  "front", "back", "left", "right",                              // 4 측면
  "top_front", "top_back", "top_left", "top_right",              // 4 top flap (개별)
  "bot_front", "bot_back", "bot_left", "bot_right",              // 4 bot flap (개별)
  "top", "bottom",                                                // 2 legacy composite (outer flap UV용)
] as const;
type FaceName = typeof FACE_NAMES[number];

interface FullRequestBody {
  L: number;
  W: number;
  D: number;
  faces: Partial<Record<FaceName, string>>;
  variant?: "simple" | "fefco0201" | "fefco0203";
  foldAngle?: number;
  outerGap?: number;
}

interface RefoldRequestBody {
  designHash: string;
  foldAngle: number;
  variant?: "simple" | "fefco0201" | "fefco0203";
  outerGap?: number;
}

type RequestBody = FullRequestBody | RefoldRequestBody;

function md5(s: string | Buffer): string {
  return crypto.createHash("md5").update(s).digest("hex");
}

async function runBlender(args: string[], outputPath: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(BLENDER_PATH, args, { windowsHide: true });
    let stderrBuf = "";
    proc.stderr.on("data", (d) => { stderrBuf += d.toString(); });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Blender exit ${code}\nSTDERR:\n${stderrBuf}`));
    });
  });
  const stat = await fs.stat(outputPath);
  if (stat.size < 1000) throw new Error("GLB output suspiciously small");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const variant = (body as any).variant ?? "fefco0201";
    const outerGap = (body as any).outerGap ?? 2;
    const foldAngle = (body as any).foldAngle ?? 20;

    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(DESIGN_CACHE_DIR, { recursive: true });

    let designHash: string;
    let texturesDir: string;
    let L: number, W: number, D: number;

    // ── Refold 요청: 캐시된 디자인 + 새 fold ──
    if ("designHash" in body && body.designHash) {
      designHash = body.designHash;
      texturesDir = path.join(DESIGN_CACHE_DIR, designHash);
      try {
        const meta = JSON.parse(await fs.readFile(path.join(texturesDir, "meta.json"), "utf-8"));
        L = meta.L; W = meta.W; D = meta.D;
      } catch {
        return NextResponse.json({ error: `Design cache miss for hash ${designHash}` }, { status: 404 });
      }
    }
    // ── 첫 호출: faces + L/W/D 받음 ──
    else {
      const fullBody = body as FullRequestBody;
      const { L: bL, W: bW, D: bD, faces } = fullBody;
      if (!bL || !bW || !bD || !faces) {
        return NextResponse.json({ error: "Missing required fields (L, W, D, faces)" }, { status: 400 });
      }
      L = bL; W = bW; D = bD;

      // design hash = 디자인 이미지 + 치수 (foldAngle 제외 → 같은 디자인의 다른 fold는 같은 hash)
      const faceHashes: Record<string, string> = {};
      for (const fn of FACE_NAMES) {
        const dataUrl = faces[fn];
        if (!dataUrl) continue;
        const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        faceHashes[fn] = md5(base64).substring(0, 12);
      }
      designHash = md5(JSON.stringify({ L, W, D, faceHashes })).substring(0, 16);
      texturesDir = path.join(DESIGN_CACHE_DIR, designHash);
      await fs.mkdir(texturesDir, { recursive: true });

      // PNG 저장 + meta.json
      const writes: Promise<void>[] = [];
      for (const fn of FACE_NAMES) {
        const dataUrl = faces[fn];
        if (!dataUrl) continue;
        const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        writes.push(fs.writeFile(path.join(texturesDir, `${fn}.png`), Buffer.from(base64, "base64")));
      }
      writes.push(fs.writeFile(
        path.join(texturesDir, "meta.json"),
        JSON.stringify({ L, W, D, savedAt: new Date().toISOString() }, null, 2)
      ));
      await Promise.all(writes);
    }

    // GLB 생성 (variant + foldAngle 별 캐시)
    const outputName = `box-${designHash}-${variant}-fold${String(foldAngle).padStart(2, "0")}.glb`;
    const outputPath = path.join(OUTPUT_DIR, outputName);
    const publicUrl = `/models/generated/${outputName}`;

    let cached = false;
    try {
      const stat = await fs.stat(outputPath);
      if (stat.size > 1000) cached = true;
    } catch {}

    if (!cached) {
      const args = [
        "--background",
        "--python", SCRIPT_PATH,
        "--",
        "--L", String(L),
        "--W", String(W),
        "--D", String(D),
        "--textures", texturesDir,
        "--output", outputPath,
        "--variant", variant,
        "--fold-angle", String(foldAngle),
        "--outer-gap", String(outerGap),
      ];
      await runBlender(args, outputPath);
    }

    const sz = (await fs.stat(outputPath)).size;
    return NextResponse.json({
      glbUrl: publicUrl,
      designHash,
      L, W, D,
      foldAngle,
      cached,
      sizeBytes: sz,
    });
  } catch (err: any) {
    console.error("[generate-3d-mockup]", err);
    return NextResponse.json(
      { error: err?.message || "unknown error" },
      { status: 500 }
    );
  }
}
