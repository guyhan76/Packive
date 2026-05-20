with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    src = f.read()

# Step 1: Add import for srgbToCmyk at the top
import_line = 'import { srgbToCmyk, isReverseLUTReady } from "./cmyk-engine";'
if 'srgbToCmyk' not in src:
    # Find first line after comments
    idx = src.find('// text-to-outlines')
    if idx > 0:
        line_start = src.rfind('\n', 0, idx) + 1
        src = src[:line_start] + import_line + '\n' + src[line_start:]
        print('Fix1: Added srgbToCmyk import')
    else:
        src = import_line + '\n' + src
        print('Fix1: Added srgbToCmyk import at top')
else:
    print('Fix1: srgbToCmyk import already exists')

# Step 2: Add convertImageXObjectsToCMYK function before exportCmykPdf
func_code = '''
/**
 * Convert RGB image XObjects in PDF raw string to CMYK
 * Finds image streams with /DeviceRGB, converts pixel data RGB->CMYK via FOGRA39 LUT
 */
function convertImageXObjectsToCMYK(pdfStr: string): string {
  // Find all image XObjects: /Subtype /Image ... /ColorSpace /DeviceRGB ... stream\\r\\n...\\r\\nendstream
  const xobjRegex = /(\\/Subtype\\s*\\/Image[^]*?\\/ColorSpace\\s*)\\/DeviceRGB([^]*?\\/Width\\s+(\\d+)[^]*?\\/Height\\s+(\\d+)[^]*?\\/BitsPerComponent\\s+8[^]*?stream\\r?\\n)([\\s\\S]*?)(\\r?\\nendstream)/g;
  
  let result = pdfStr;
  let converted = 0;
  const matches: Array<{full: string, pre: string, post: string, w: number, h: number, streamData: string, endStream: string, index: number}> = [];
  
  let m: RegExpExecArray | null;
  // Use simpler approach: find /ColorSpace /DeviceRGB in image context and convert
  // Strategy: locate each image XObject block, extract stream, convert RGB bytes to CMYK bytes
  
  // Simpler approach: find all "stream" sections that follow /DeviceRGB image headers
  const imgHeaderRegex = /<<[^>]*\\/Subtype\\s*\\/Image[^>]*\\/ColorSpace\\s*\\/DeviceRGB[^>]*\\/Width\\s+(\\d+)[^>]*\\/Height\\s+(\\d+)[^>]*\\/BitsPerComponent\\s+8[^>]*\\/Length\\s+(\\d+)[^>]*>>\\s*stream\\r?\\n/g;
  
  while ((m = imgHeaderRegex.exec(pdfStr)) !== null) {
    const w = parseInt(m[1]);
    const h = parseInt(m[2]);
    const len = parseInt(m[3]);
    const streamStart = m.index + m[0].length;
    const rgbData = pdfStr.substring(streamStart, streamStart + len);
    
    // Verify: RGB data should be w * h * 3 bytes
    if (rgbData.length !== w * h * 3) {
      console.log("[PDF-CMYK] Image " + w + "x" + h + " stream length mismatch: " + rgbData.length + " vs expected " + (w*h*3) + ", skipping");
      continue;
    }
    
    // Convert RGB -> CMYK pixel by pixel
    const cmykLen = w * h * 4;
    const cmykChars: string[] = new Array(cmykLen);
    let pi = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const si = (y * w + x) * 3;
        const r = rgbData.charCodeAt(si) & 0xff;
        const g = rgbData.charCodeAt(si + 1) & 0xff;
        const b = rgbData.charCodeAt(si + 2) & 0xff;
        const [c, mk, yk, k] = srgbToCmyk(r, g, b);
        cmykChars[pi++] = String.fromCharCode(Math.round(c * 2.55));
        cmykChars[pi++] = String.fromCharCode(Math.round(mk * 2.55));
        cmykChars[pi++] = String.fromCharCode(Math.round(yk * 2.55));
        cmykChars[pi++] = String.fromCharCode(Math.round(k * 2.55));
      }
    }
    const cmykData = cmykChars.join("");
    
    // Replace in PDF: change /DeviceRGB to /DeviceCMYK, update /Length, replace stream data
    const headerStr = m[0];
    const newHeader = headerStr
      .replace("/DeviceRGB", "/DeviceCMYK")
      .replace("/Length " + len, "/Length " + cmykLen);
    const oldBlock = headerStr + rgbData;
    const newBlock = newHeader + cmykData;
    
    result = result.replace(oldBlock, newBlock);
    converted++;
    console.log("[PDF-CMYK] Converted image " + w + "x" + h + ": RGB(" + len + " bytes) -> CMYK(" + cmykLen + " bytes)");
  }
  
  console.log("[PDF-CMYK] Total images converted: " + converted);
  return result;
}
'''

# Insert before exportCmykPdf function
anchor = 'export async function exportCmykPdf'
idx = src.find(anchor)
if idx > 0:
    src = src[:idx] + func_code + '\n' + src[idx:]
    print('Fix2: Added convertImageXObjectsToCMYK function')
else:
    print('ERROR: exportCmykPdf not found')

# Step 3: Call the function after replacePdfColorsInString
old_step8 = '// Step 7b: Image XObjects kept as DeviceRGB (vector colors already CMYK via replacePdfColorsInString)'
new_step8 = '''// Step 7b: Convert image XObjects from RGB to CMYK using FOGRA39 engine
  if (isReverseLUTReady()) {
    rawPdf = convertImageXObjectsToCMYK(rawPdf);
    console.log("[PDF] Step 7b: Image RGB->CMYK conversion done");
  } else {
    console.warn("[PDF] Step 7b: Reverse LUT not ready, images remain RGB");
  }'''

if old_step8 in src:
    src = src.replace(old_step8, new_step8)
    print('Fix3: Added CMYK image conversion call')
else:
    print('ERROR: Step 7b comment not found')

with open('src/lib/pdf-cmyk-export.ts', 'w', encoding='utf-8') as f:
    f.write(src)

# Verify
with open('src/lib/pdf-cmyk-export.ts', 'r', encoding='utf-8') as f:
    v = f.read()
print(f'Has srgbToCmyk import: {"srgbToCmyk" in v}')
print(f'Has convertImageXObjectsToCMYK: {"convertImageXObjectsToCMYK" in v}')
print(f'Has DeviceCMYK in converter: {"DeviceCMYK" in v}')
print(f'Total lines: {len(v.splitlines())}')
