with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Replace Step 7b comment block with binary-level image conversion
# This time: work on the final Uint8Array buffer AFTER string processing is done
# Move the conversion to after outBuf is created

old_7b = '''// Step 7b: Images are CMYK-simulated (RGB pixels round-tripped through FOGRA39)
  // /DeviceRGB declaration is kept because pixel data is still 3-channel RGB format
  // Colors are perceptually identical to CMYK output
  console.log("[PDF] Step 7b: Images CMYK-simulated, keeping DeviceRGB for 3-channel compatibility");'''

new_7b = '''// Step 7b: CMYK simulation applied during preprocessing
  console.log("[PDF] Step 7b: CMYK simulation done");'''

if old_7b in src:
    src = src.replace(old_7b, new_7b)
    print('Fix1: Simplified Step 7b')

# Now find the blob creation and insert binary conversion before it
old_blob = 'const blob = new Blob([outBuf], { type: "application/pdf" });'
new_blob = '''// Step 7c: Convert image XObjects from 3-ch RGB to 4-ch CMYK in binary PDF
  if (cmykEngine?.isReverseLUTReady()) {
    const converted = convertImgRgbToCmykBinary(outBuf, cmykEngine);
    if (converted) {
      outBuf = converted;
      console.log("[PDF] Step 7c: Binary RGB->CMYK image conversion done, new size:", outBuf.length);
    }
  }
  const blob = new Blob([outBuf], { type: "application/pdf" });'''

if old_blob in src:
    # Also need to make outBuf mutable (let instead of const)
    src = src.replace('const outLen = rawPdf.length;\n  const outBuf = new Uint8Array(outLen);',
                      'const outLen = rawPdf.length;\n  let outBuf = new Uint8Array(outLen);')
    src = src.replace(old_blob, new_blob)
    print('Fix2: Added binary conversion before blob')

# Add the binary conversion function
func = '''
function convertImgRgbToCmykBinary(pdf: Uint8Array, engine: any): Uint8Array | null {
  // Search for /ColorSpace /DeviceRGB image XObjects and convert stream data
  const text = (start: number, len: number) => {
    let s = ""; for (let i = 0; i < len; i++) s += String.fromCharCode(pdf[start + i]); return s;
  };
  const find = (needle: string, from: number) => {
    for (let i = from; i <= pdf.length - needle.length; i++) {
      let ok = true;
      for (let j = 0; j < needle.length; j++) { if (pdf[i+j] !== needle.charCodeAt(j)) { ok = false; break; } }
      if (ok) return i;
    }
    return -1;
  };
  
  // Collect all patches first
  const patches: Array<{dictStart: number, streamDataStart: number, streamDataEnd: number, w: number, h: number}> = [];
  let pos = 0;
  while (true) {
    const si = find("/Subtype /Image", pos);
    if (si < 0) break;
    pos = si + 1;
    
    // Find << before this
    let ds = si;
    for (let i = si; i >= Math.max(0, si - 500); i--) {
      if (pdf[i] === 0x3C && pdf[i+1] === 0x3C) { ds = i; break; }
    }
    
    // Read header
    const hdr = text(ds, Math.min(500, pdf.length - ds));
    if (!hdr.includes("/ColorSpace /DeviceRGB") || !hdr.includes("/BitsPerComponent 8")) continue;
    
    const wm = hdr.match(/\/Width (\d+)/), hm = hdr.match(/\/Height (\d+)/), lm = hdr.match(/\/Length (\d+)/);
    if (!wm || !hm || !lm) continue;
    const w = parseInt(wm[1]), h = parseInt(hm[1]), len = parseInt(lm[1]);
    if (len !== w * h * 3) { console.log("[PDF-CMYK] Skip " + w + "x" + h + " (compressed)"); continue; }
    
    // Find stream\n
    const streamKey = find("stream\n", ds);
    const streamKeyRN = find("stream\r\n", ds);
    let dataStart = -1;
    if (streamKeyRN >= 0 && streamKeyRN < ds + 600) dataStart = streamKeyRN + 8;
    else if (streamKey >= 0 && streamKey < ds + 600) dataStart = streamKey + 7;
    if (dataStart < 0 || dataStart + len > pdf.length) continue;
    
    patches.push({ dictStart: ds, streamDataStart: dataStart, streamDataEnd: dataStart + len, w, h });
  }
  
  if (patches.length === 0) return null;
  console.log("[PDF-CMYK] Found " + patches.length + " RGB images to convert");
  
  // Build new PDF: process patches in order
  patches.sort((a, b) => a.dictStart - b.dictStart);
  const parts: Uint8Array[] = [];
  let cursor = 0;
  
  for (const p of patches) {
    // Copy everything before this dict
    parts.push(pdf.slice(cursor, p.dictStart));
    
    // Read and modify header: replace DeviceRGB with DeviceCMYK, update Length
    const hdrStr = text(p.dictStart, p.streamDataStart - p.dictStart);
    const newLen = p.w * p.h * 4;
    const newHdr = hdrStr
      .replace("/ColorSpace /DeviceRGB", "/ColorSpace /DeviceCMYK")
      .replace("/Length " + (p.w * p.h * 3), "/Length " + newLen);
    const hdrBytes = new Uint8Array(newHdr.length);
    for (let i = 0; i < newHdr.length; i++) hdrBytes[i] = newHdr.charCodeAt(i);
    parts.push(hdrBytes);
    
    // Convert RGB stream to CMYK
    const cmyk = new Uint8Array(newLen);
    for (let i = 0; i < p.w * p.h; i++) {
      const si = p.streamDataStart + i * 3;
      const [c, m, y, k] = engine.srgbToCmyk(pdf[si], pdf[si+1], pdf[si+2]);
      cmyk[i*4]   = Math.round(c * 2.55);
      cmyk[i*4+1] = Math.round(m * 2.55);
      cmyk[i*4+2] = Math.round(y * 2.55);
      cmyk[i*4+3] = Math.round(k * 2.55);
    }
    parts.push(cmyk);
    
    cursor = p.streamDataEnd;
    console.log("[PDF-CMYK] " + p.w + "x" + p.h + ": RGB(" + (p.w*p.h*3) + ") -> CMYK(" + newLen + ")");
  }
  
  // Copy remainder
  parts.push(pdf.slice(cursor));
  
  // Combine
  const totalLen = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(totalLen);
  let off = 0;
  for (const p of parts) { result.set(p, off); off += p.length; }
  
  console.log("[PDF-CMYK] Done: " + pdf.length + " -> " + result.length + " bytes");
  return result;
}
'''

# Insert function before exportCmykPdf
anchor = 'export async function exportCmykPdf'
idx = src.find(anchor)
if idx > 0:
    src = src[:idx] + func + '\n' + src[idx:]
    print('Fix3: Added convertImgRgbToCmykBinary function')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)
print(f'Total lines: {len(src.splitlines())}')
