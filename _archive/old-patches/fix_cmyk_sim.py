with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Step 1: Remove the broken convertImageXObjectsToCMYK function entirely
func_start = src.find('function convertImageXObjectsToCMYK(')
if func_start >= 0:
    brace_count = 0
    func_end = func_start
    found_first = False
    for i in range(func_start, len(src)):
        if src[i] == '{':
            brace_count += 1
            found_first = True
        elif src[i] == '}':
            brace_count -= 1
            if found_first and brace_count == 0:
                func_end = i + 1
                break
    src = src[:func_start] + src[func_end:]
    print('Removed convertImageXObjectsToCMYK function')

# Step 2: Remove the caller block (Step 7b with Uint8Array conversion)
old_call = '''// Step 7b: Convert image XObjects from RGB to CMYK using FOGRA39 engine
  if (cmykEngine?.isReverseLUTReady()) {
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
    }
    console.log("[PDF] Step 7b: Image RGB->CMYK conversion done");
  } else {
    console.warn("[PDF] Step 7b: Reverse LUT not ready, images remain RGB");
  }'''

if old_call in src:
    src = src.replace(old_call, '  // Step 7b: Image CMYK simulation applied during pre-processing (see below)')
    print('Removed old Step 7b caller')
else:
    # Try to find and remove any Step 7b block
    s7b = src.find('// Step 7b:')
    if s7b >= 0:
        # Find the end of this block (next console.log Step 8)
        s8 = src.find('console.log("[PDF] Step 8:', s7b)
        if s8 > s7b:
            line_start = src.rfind('\n', 0, s7b) + 1
            src = src[:line_start] + '  // Step 7b: Image CMYK simulation applied during pre-processing\n' + src[s8:]
            print('Removed Step 7b block (flexible)')

# Step 3: Add CMYK simulation in the image pre-processing step
# Find the white background compositing area and add CMYK round-trip after it
anchor = "ctx.drawImage(el as HTMLImageElement, 0, 0);"
if anchor in src:
    cmyk_sim = '''ctx.drawImage(el as HTMLImageElement, 0, 0);
        // CMYK simulation: convert each pixel RGB->CMYK->RGB via FOGRA39
        if (cmykEngine?.isReverseLUTReady()) {
          const imgData = ctx.getImageData(0, 0, natW, natH);
          const px = imgData.data;
          for (let pi = 0; pi < px.length; pi += 4) {
            const [c, m, y, k] = cmykEngine.srgbToCmyk(px[pi], px[pi+1], px[pi+2]);
            const [nr, ng, nb] = cmykEngine.cmykToSrgb(c, m, y, k);
            px[pi] = nr; px[pi+1] = ng; px[pi+2] = nb;
          }
          ctx.putImageData(imgData, 0, 0);
          console.log("[PDF] Image CMYK-simulated: " + natW + "x" + natH);
        }'''
    src = src.replace(anchor, cmyk_sim, 1)
    print('Added CMYK simulation in image pre-processing')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)

print(f'Total lines: {len(src.splitlines())}')
