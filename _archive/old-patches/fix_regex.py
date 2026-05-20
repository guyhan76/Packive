with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Replace the entire convertImageXObjectsToCMYK function
old_func_start = 'function convertImageXObjectsToCMYK(pdfStr: string, cmykEngine: any): string {'
old_func_end = '  return result;\n}'

start = src.find(old_func_start)
if start < 0:
    # Try without cmykEngine param
    old_func_start = 'function convertImageXObjectsToCMYK(pdfStr: string'
    start = src.find(old_func_start)

if start < 0:
    print('ERROR: function not found')
else:
    # Find the closing brace of this function
    # Count braces from start
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
    
    new_func = '''function convertImageXObjectsToCMYK(pdfStr: string, cmykEngine: any): string {
  // Find image XObject headers in PDF: multiline format between << and >>
  // Pattern: /Type /XObject, /Subtype /Image, /ColorSpace /DeviceRGB, /Width N, /Height N, /Length N
  let result = pdfStr;
  let converted = 0;
  
  // Search for each /Subtype /Image block
  const imgRegex = /\\/Subtype\\s*\\/Image[\\s\\S]*?\\/ColorSpace\\s*\\/DeviceRGB[\\s\\S]*?>>\\s*stream\\r?\\n/g;
  let match: RegExpExecArray | null;
  const replacements: Array<{oldBlock: string, newBlock: string}> = [];
  
  while ((match = imgRegex.exec(pdfStr)) !== null) {
    const headerEnd = match.index + match[0].length;
    const fullHeader = match[0];
    
    // Extract Width, Height, Length from header
    const wMatch = fullHeader.match(/\\/Width\\s+(\\d+)/);
    const hMatch = fullHeader.match(/\\/Height\\s+(\\d+)/);
    const lenMatch = fullHeader.match(/\\/Length\\s+(\\d+)/);
    if (!wMatch || !hMatch || !lenMatch) continue;
    
    const w = parseInt(wMatch[1]);
    const h = parseInt(hMatch[1]);
    const dataLen = parseInt(lenMatch[1]);
    
    // Verify RGB: dataLen should be w * h * 3
    if (dataLen !== w * h * 3) {
      console.log("[PDF-CMYK] Image " + w + "x" + h + " length " + dataLen + " != " + (w*h*3) + ", skipping (compressed?)");
      continue;
    }
    
    // Extract stream data
    const streamData = pdfStr.substring(headerEnd, headerEnd + dataLen);
    if (streamData.length !== dataLen) continue;
    
    // Convert RGB -> CMYK pixel by pixel
    const cmykLen = w * h * 4;
    const cmykChars: string[] = new Array(cmykLen);
    let pi = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const si = (y * w + x) * 3;
        const r = streamData.charCodeAt(si) & 0xff;
        const g = streamData.charCodeAt(si + 1) & 0xff;
        const b = streamData.charCodeAt(si + 2) & 0xff;
        const [c, mk, yk, k] = cmykEngine.srgbToCmyk(r, g, b);
        cmykChars[pi++] = String.fromCharCode(Math.round(c * 2.55));
        cmykChars[pi++] = String.fromCharCode(Math.round(mk * 2.55));
        cmykChars[pi++] = String.fromCharCode(Math.round(yk * 2.55));
        cmykChars[pi++] = String.fromCharCode(Math.round(k * 2.55));
      }
    }
    const cmykData = cmykChars.join("");
    
    // Build replacement: change DeviceRGB->DeviceCMYK, update Length
    const newHeader = fullHeader
      .replace("/ColorSpace /DeviceRGB", "/ColorSpace /DeviceCMYK")
      .replace("/Length " + dataLen, "/Length " + cmykLen);
    
    replacements.push({
      oldBlock: fullHeader + streamData,
      newBlock: newHeader + cmykData
    });
    converted++;
    console.log("[PDF-CMYK] Converted image " + w + "x" + h + ": RGB(" + dataLen + ") -> CMYK(" + cmykLen + ")");
  }
  
  // Apply replacements in reverse order to preserve positions
  for (const rep of replacements.reverse()) {
    result = result.replace(rep.oldBlock, rep.newBlock);
  }
  
  console.log("[PDF-CMYK] Total images converted: " + converted);
  return result;
}'''
    
    src = src[:start] + new_func + src[func_end:]
    print(f'Replaced function (old: {func_end - start} chars, new: {len(new_func)} chars)')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)

print(f'Total lines: {len(src.splitlines())}')
