$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# STEP 1: CMYK 변환 함수 추가
$oldExport = 'export default function UnifiedEditor'
$cmykFns = "// --- CMYK RGB Conversion ---`nfunction rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {`n  const r1 = r / 255, g1 = g / 255, b1 = b / 255;`n  const k = 1 - Math.max(r1, g1, b1);`n  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };`n  return {`n    c: Math.round(((1 - r1 - k) / (1 - k)) * 100),`n    m: Math.round(((1 - g1 - k) / (1 - k)) * 100),`n    y: Math.round(((1 - b1 - k) / (1 - k)) * 100),`n    k: Math.round(k * 100),`n  };`n}`n`nfunction cmykToRgb(c: number, m: number, y: number, k: number): { r: number; g: number; b: number } {`n  const c1 = c / 100, m1 = m / 100, y1 = y / 100, k1 = k / 100;`n  return {`n    r: Math.round(255 * (1 - c1) * (1 - k1)),`n    g: Math.round(255 * (1 - m1) * (1 - k1)),`n    b: Math.round(255 * (1 - y1) * (1 - k1)),`n  };`n}`n`nfunction hexToRgb(hex: string): { r: number; g: number; b: number } {`n  const h = hex.replace(`"#`", `"`");`n  return {`n    r: parseInt(h.substring(0, 2), 16) || 0,`n    g: parseInt(h.substring(2, 4), 16) || 0,`n    b: parseInt(h.substring(4, 6), 16) || 0,`n  };`n}`n`nfunction rgbToHex(r: number, g: number, b: number): string {`n  return `"#`" + [r, g, b].map(v => v.toString(16).padStart(2, `"0`")).join(`"`");`n}`n`nfunction hexToCmyk(hex: string): { c: number; m: number; y: number; k: number } {`n  const { r, g, b } = hexToRgb(hex);`n  return rgbToCmyk(r, g, b);`n}`n`nfunction cmykToHex(c: number, m: number, y: number, k: number): string {`n  const { r, g, b } = cmykToRgb(c, m, y, k);`n  return rgbToHex(r, g, b);`n}`n`nexport default function UnifiedEditor"
$content = $content.Replace($oldExport, $cmykFns)
Write-Host "STEP 1: CMYK 변환 함수 추가" -ForegroundColor Green

# STEP 2: colorMode state
$content = $content.Replace(
  '  const [selProps, setSelProps] = useState<any>(null);',
  "  const [selProps, setSelProps] = useState<any>(null);`n  const [colorMode, setColorMode] = useState<`"rgb`" | `"cmyk`">(`"rgb`");"
)
Write-Host "STEP 2: colorMode state 추가" -ForegroundColor Green

# STEP 3: getSelectedProps에 CMYK 추가
$oldRet = '      fill: obj.fill || "#000000",'
$newRet = '      fill: typeof obj.fill === "string" ? obj.fill : "#000000",'
$content = $content.Replace($oldRet, $newRet)

$oldObj = '      obj: obj,
    };'
$newObj = '      fillCmyk: hexToCmyk(typeof obj.fill === "string" ? obj.fill : "#000000"),
      strokeCmyk: hexToCmyk(obj.stroke || "#000000"),
      cmykFill: (obj as any)._cmykFill || null,
      cmykStroke: (obj as any)._cmykStroke || null,
      obj: obj,
    };'
$content = $content.Replace($oldObj, $newObj)
Write-Host "STEP 3: getSelectedProps CMYK 추가" -ForegroundColor Green

# STEP 4: updateProp CMYK 처리
$oldFill = '    else if (key === "fill") obj.set({ fill: value });
    else if (key === "stroke") obj.set({ stroke: value });'
$newFill = '    else if (key === "fill") { obj.set({ fill: value }); (obj as any)._cmykFill = hexToCmyk(value); }
    else if (key === "stroke") { obj.set({ stroke: value }); (obj as any)._cmykStroke = hexToCmyk(value); }
    else if (key === "fillCmyk") { const hex = cmykToHex(value.c, value.m, value.y, value.k); obj.set({ fill: hex }); (obj as any)._cmykFill = value; }
    else if (key === "strokeCmyk") { const hex = cmykToHex(value.c, value.m, value.y, value.k); obj.set({ stroke: hex }); (obj as any)._cmykStroke = value; }'
$content = $content.Replace($oldFill, $newFill)
Write-Host "STEP 4: updateProp CMYK 처리 추가" -ForegroundColor Green

Set-Content $file -Value $content -Encoding UTF8 -NoNewline
$v = Get-Content $file -Encoding UTF8
Write-Host "`n=== 검증 ===" -ForegroundColor Cyan
for ($i=0;$i -lt $v.Count;$i++) {
  if ($v[$i] -match '^function rgbToCmyk') { Write-Host "rgbToCmyk: line $($i+1)" }
  if ($v[$i] -match '^function cmykToHex') { Write-Host "cmykToHex: line $($i+1)" }
  if ($v[$i] -match 'colorMode.*useState') { Write-Host "colorMode: line $($i+1)" }
  if ($v[$i] -match 'fillCmyk: hexToCmyk') { Write-Host "fillCmyk: line $($i+1)" }
  if ($v[$i] -match '"fillCmyk"') { Write-Host "updateProp fillCmyk: line $($i+1)" }
}
Write-Host "Total lines: $($v.Count)"
