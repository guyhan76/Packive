with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Replace the convertImageXObjectsToCMYK function with a binary-safe version
old_func_start = 'function convertImageXObjectsToCMYK(pdfStr: string'
start = src.find(old_func_start)
if start < 0:
    print('ERROR: function not found')
else:
    brace_count = 0
    func_end = start
    found_first = False
    for i in range(start, len(src)):
        if src[i] == '{':
            brace_count += 1
            found_first = True
        elif src[i] == '}':
            brace_count -= 1
            if found_first and brace_count == 0:
                func_end = i + 1
                break

    # New approach: work on Uint8Array level instead of string
    # Move conversion to AFTER we have the Uint8Array buffer
    new_func = '''function convertImageXObjectsToCMYK(buf: Uint8Array, cmykEngine: any): Uint8Array {
  // Work directly on PDF binary buffer to avoid string encoding issues
  // Find image XObject headers and convert RGB stream data to CMYK
  
  // Helper: find byte sequence in buffer
  function findBytes(haystack: Uint8Array, needle: number[], from: number): number {
    outer: for (let i = from; i <= haystack.length - needle.length; i++) {
      for (let j = 0; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) continue outer;
      }
      return i;
    }
    return -1;
  }
  
  // Helper: extract ASCII string from buffer
  function extractStr(buf: Uint8Array, start: number, len: number): string {
    let s = "";
    for (let i = 0; i < len && start + i < buf.length; i++) {
      s += String.fromCharCode(buf[start + i]);
    }
    return s;
  }
  
  // Find "/Subtype /Image" markers
  const subtypeImage = [0x2F,0x53,0x75,0x62,0x74,0x79,0x70,0x65,0x20,0x2F,0x49,0x6D,0x61,0x67,0x65]; // /Subtype /Image
  const deviceRGB = "/ColorSpace /DeviceRGB";
  const streamMarker = [0x73,0x74,0x72,0x65,0x61,0x6D,0x0A]; // stream\\n
  const streamMarkerRN = [0x73,0x74,0x72,0x65,0x61,0x6D,0x0D,0x0A]; // stream\\r\\n
  
  let converted = 0;
  const patches: Array<{headerStart: number, streamEnd: number, newData: Uint8Array}> = [];
  
  let searchPos = 0;
  while (true) {
    const imgPos = findBytes(buf, subtypeImage, searchPos);
    if (imgPos < 0) break;
    searchPos = imgPos + 1;
    
    // Find the << before this /Subtype
    let dictStart = imgPos;
    for (let i = imgPos; i >= Math.max(0, imgPos - 500); i--) {
      if (buf[i] === 0x3C && buf[i+1] === 0x3C) { dictStart = i; break; }
    }
    
    // Extract header as string to parse Width/Height/Length/ColorSpace
    const headerLen = Math.min(600, buf.length - dictStart);
    const header = extractStr(buf, dictStart, headerLen);
    
    if (!header.includes("/ColorSpace /DeviceRGB")) continue;
    if (!header.includes("/BitsPerComponent 8")) continue;
    
    const wM = header.match(/\\/Width (\\d+)/);
    const hM = header.match(/\\/Height (\\d+)/);
    const lM = header.match(/\\/Length (\\d+)/);
    if (!wM || !hM || !lM) continue;
    
    const w = parseInt(wM[1]);
    const h = parseInt(hM[1]);
    const dataLen = parseInt(lM[1]);
    if (dataLen !== w * h * 3) {
      console.log("[PDF-CMYK] " + w + "x" + h + " len=" + dataLen + " not raw RGB, skip");
      continue;
    }
    
    // Find "stream\\n" or "stream\\r\\n" after dict
    let streamStart = -1;
    const s1 = findBytes(buf, streamMarkerRN, dictStart);
    const s2 = findBytes(buf, streamMarker, dictStart);
    if (s1 >= 0 && s1 < dictStart + headerLen) {
      streamStart = s1 + streamMarkerRN.length;
    } else if (s2 >= 0 && s2 < dictStart + headerLen) {
      streamStart = s2 + streamMarker.length;
    }
    if (streamStart < 0) continue;
    
    // Read RGB pixels and convert to CMYK
    const cmykLen = w * h * 4;
    const cmykBuf = new Uint8Array(cmykLen);
    let ok = true;
    for (let p = 0; p < w * h; p++) {
      const si = streamStart + p * 3;
      if (si + 2 >= buf.length) { ok = false; break; }
      const r = buf[si], g = buf[si+1], b = buf[si+2];
      const [c, m, y, k] = cmykEngine.srgbToCmyk(r, g, b);
      const di = p * 4;
      cmykBuf[di]   = Math.round(c * 2.55);
      cmykBuf[di+1] = Math.round(m * 2.55);
      cmykBuf[di+2] = Math.round(y * 2.55);
      cmykBuf[di+3] = Math.round(k * 2.55);
    }
    if (!ok) continue;
    
    // Build new header: replace DeviceRGB->DeviceCMYK, Length->new length
    const newHeader = header.substring(0, header.indexOf("stream"))
      .replace("/ColorSpace /DeviceRGB", "/ColorSpace /DeviceCMYK")
      .replace("/Length " + dataLen, "/Length " + cmykLen);
    
    // Encode new header as bytes
    const headerBytes = new Uint8Array(newHeader.length);
    for (let i = 0; i < newHeader.length; i++) headerBytes[i] = newHeader.charCodeAt(i);
    
    // stream marker
    const sm = (s1 >= 0 && s1 < dictStart + headerLen) ? new Uint8Array([0x73,0x74,0x72,0x65,0x61,0x6D,0x0D,0x0A]) : new Uint8Array([0x73,0x74,0x72,0x65,0x61,0x6D,0x0A]);
    
    // Combine: newHeader + stream\\n + cmykData
    const patch = new Uint8Array(headerBytes.length + sm.length + cmykBuf.length);
    patch.set(headerBytes, 0);
    patch.set(sm, headerBytes.length);
    patch.set(cmykBuf, headerBytes.length + sm.length);
    
    patches.push({ headerStart: dictStart, streamEnd: streamStart + dataLen, newData: patch });
    converted++;
    console.log("[PDF-CMYK] Converted " + w + "x" + h + ": RGB(" + dataLen + ") -> CMYK(" + cmykLen + ")");
  }
  
  if (patches.length === 0) {
    console.log("[PDF-CMYK] No raw RGB images found");
    return buf;
  }
  
  // Apply patches in reverse order
  patches.sort((a, b) => b.headerStart - a.headerStart);
  let result = buf;
  for (const p of patches) {
    const before = result.slice(0, p.headerStart);
    const after = result.slice(p.streamEnd);
    const combined = new Uint8Array(before.length + p.newData.length + after.length);
    combined.set(before, 0);
    combined.set(p.newData, before.length);
    combined.set(after, before.length + p.newData.length);
    result = combined;
  }
  
  console.log("[PDF-CMYK] Total converted: " + converted + ", new size: " + result.length);
  return result;
}'''

    src = src[:start] + new_func + src[func_end:]
    print(f'Replaced function')

# Now update the caller: work on Uint8Array instead of string
# Find the call site
old_call = '''if (cmykEngine?.isReverseLUTReady()) {
    rawPdf = convertImageXObjectsToCMYK(rawPdf, cmykEngine);'''
new_call = '''if (cmykEngine?.isReverseLUTReady()) {
    // Convert to Uint8Array for binary-safe image processing, then back
    const tempLen = rawPdf.length;
    const tempBuf = new Uint8Array(tempLen);
    for (let ti = 0; ti < tempLen; ti++) tempBuf[ti] = rawPdf.charCodeAt(ti) & 0xff;
    const cmykBuf = convertImageXObjectsToCMYK(tempBuf, cmykEngine);
    rawPdf = "";
    const cs = 8192;
    for (let ci = 0; ci < cmykBuf.length; ci += cs) {
      const chunk = cmykBuf.subarray(ci, Math.min(ci + cs, cmykBuf.length));
      rawPdf += String.fromCharCode.apply(null, Array.from(chunk));
    }'''

if old_call in src:
    src = src.replace(old_call, new_call)
    print('Updated caller to use Uint8Array')
else:
    print('Caller pattern not found, trying flexible match...')
    if 'rawPdf = convertImageXObjectsToCMYK(rawPdf, cmykEngine)' in src:
        src = src.replace(
            'rawPdf = convertImageXObjectsToCMYK(rawPdf, cmykEngine)',
            '''// Convert to Uint8Array for binary-safe image processing
    const tempLen2 = rawPdf.length;
    const tempBuf2 = new Uint8Array(tempLen2);
    for (let ti = 0; ti < tempLen2; ti++) tempBuf2[ti] = rawPdf.charCodeAt(ti) & 0xff;
    const cmykBuf2 = convertImageXObjectsToCMYK(tempBuf2, cmykEngine);
    rawPdf = "";
    const cs2 = 8192;
    for (let ci2 = 0; ci2 < cmykBuf2.length; ci2 += cs2) {
      const chunk2 = cmykBuf2.subarray(ci2, Math.min(ci2 + cs2, cmykBuf2.length));
      rawPdf += String.fromCharCode.apply(null, Array.from(chunk2));
    }'''
        )
        print('Updated caller (flexible match)')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)

print(f'Total lines: {len(src.splitlines())}')
