$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$backupDir = "C:\Users\user\Desktop\dev\packive\backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "$backupDir\unified-editor_$timestamp.tsx"
Write-Host "BACKUP: unified-editor_$timestamp.tsx"

$lines = [System.IO.File]::ReadAllLines($file)
$originalCount = $lines.Length
$newLines = New-Object System.Collections.Generic.List[string]

for ($i = 0; $i -lt $lines.Length; $i++) {
  $line = $lines[$i]

  # Fix 1: dielineFileRef onChange - SVG 로드 기능 추가
  if ($line -match 'dielineFileRef.*type="file"') {
    $newLines.Add('        <input ref={dielineFileRef} type="file" accept=".eps,.ai,.pdf,.svg" className="hidden" onChange={(e) => {')
    $newLines.Add('          const f = e.target.files?.[0]; if (!f) return;')
    $newLines.Add('          setDielineFileName(f.name);')
    $newLines.Add('          const reader = new FileReader();')
    $newLines.Add('          reader.onload = () => {')
    $newLines.Add('            const svgStr = reader.result as string;')
    $newLines.Add('            const c = fcRef.current; if (!c) return;')
    $newLines.Add('            const F = fabricModRef.current; if (!F) return;')
    $newLines.Add('            F.loadSVGFromString(svgStr).then((result: any) => {')
    $newLines.Add('              const group = F.util.groupSVGElements(result.objects, result.options);')
    $newLines.Add('              group.set({ _isDieLine: true, _isGuideLayer: true, selectable: !dielineLocked, evented: !dielineLocked, name: "__dieline_upload__" });')
    $newLines.Add('              const cw = c.getWidth(), ch2 = c.getHeight();')
    $newLines.Add('              const sw = cw * 0.9 / (group.width || 1), sh = ch2 * 0.9 / (group.height || 1);')
    $newLines.Add('              const sc = Math.min(sw, sh);')
    $newLines.Add('              group.set({ scaleX: sc, scaleY: sc, left: cw / 2, top: ch2 / 2, originX: "center", originY: "center" });')
    $newLines.Add('              c.add(group); c.requestRenderAll();')
    $newLines.Add('            });')
    $newLines.Add('          };')
    $newLines.Add('          reader.readAsText(f);')
    $newLines.Add('          e.target.value = "";')
    $newLines.Add('        }} />')
    Write-Host "Fix 1: SVG upload handler added at L$($i+1)"
    continue
  }

  # Fix 2: Upload Dieline 버튼 텍스트 + 파란색
  if ($line -match 'Upload Dieline</button>') {
    $line = $line.Replace('text-gray-700 hover:bg-gray-50 hover:border-gray-400', 'text-blue-600 hover:bg-blue-50 hover:border-blue-400')
    $line = $line.Replace('Upload Dieline</button>', 'Upload Dieline (EPS/AI/PDF/SVG)</button>')
    Write-Host "Fix 2: Upload button text + blue color"
  }

  # Fix 3: Hide Lines 버튼 스타일 (회색 배경, 누르면 흰색)
  if ($line -match 'Hide Lines.*Show Lines') {
    $line = $line.Replace(
      'dielineVisible ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-gray-200 border-gray-300 text-gray-500"',
      'dielineVisible ? "bg-gray-200 border-gray-300 text-gray-600 hover:bg-gray-300" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"'
    )
    Write-Host "Fix 3: Hide Lines button style (gray when visible, white when hidden)"
  }

  $newLines.Add($line)
}

[System.IO.File]::WriteAllLines($file, $newLines.ToArray(), [System.Text.Encoding]::UTF8)
$newCount = $newLines.Count

$content = [System.IO.File]::ReadAllText($file)
$ok = $true
foreach ($kw in @("export default function", "fcRef", "useEffect", "return (")) {
  if (!$content.Contains($kw)) { Write-Host "MISSING: $kw"; $ok = $false }
}
if ($newCount -lt ($originalCount * 0.5)) { Write-Host "TOO FEW: $newCount"; $ok = $false }
if (!$ok) {
  Copy-Item "$backupDir\unified-editor_$timestamp.tsx" $file
  Write-Host "RESTORED!"
} else {
  Write-Host "SAFE: $newCount lines (was $originalCount)"
}