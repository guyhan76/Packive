$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$backupDir = "C:\Users\user\Desktop\dev\packive\backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "$backupDir\unified-editor_$timestamp.tsx"
Write-Host "BACKUP: unified-editor_$timestamp.tsx"

$lines = [System.IO.File]::ReadAllLines($file)
$originalCount = $lines.Length
$newLines = New-Object System.Collections.Generic.List[string]

$fix1 = $false
$fix2 = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]

    # ── FIX 1: Replace blank mode block + normal mode block to share canvas variable ──
    if ($line -match '// Blank canvas mode: use full wrapper area' -and -not $fix1) {
        # Write new unified block
        $newLines.Add("      // Canvas creation (blank or normal mode)")
        $newLines.Add("      const isBlank = (L === 0 && W === 0 && D === 0);")
        $newLines.Add("      let canvasW: number, canvasH: number;")
        $newLines.Add("      if (isBlank) {")
        $newLines.Add("        canvasW = cw - 20;")
        $newLines.Add("        canvasH = ch - 60;")
        $newLines.Add("        scaleRef.current = 1;")
        $newLines.Add("      } else {")
        $newLines.Add("        const netW = totalW + PAD * 2;")
        $newLines.Add("        const netH = totalH + PAD * 2;")
        $newLines.Add("        const availW = cw - 20;")
        $newLines.Add("        const availH = ch - 60;")
        $newLines.Add("        const fitScale = Math.min(availW / netW, availH / netH);")
        $newLines.Add("        const pxPerMM = Math.max(fitScale, 2.0);")
        $newLines.Add("        scaleRef.current = pxPerMM;")
        $newLines.Add("        canvasW = Math.min(Math.round(netW * pxPerMM), cw - 20);")
        $newLines.Add("        canvasH = Math.min(Math.round(netH * pxPerMM), ch - 60);")
        $newLines.Add("      }")
        $newLines.Add("")
        $newLines.Add("      const el = canvasElRef.current!;")
        $newLines.Add("      el.width = canvasW; el.height = canvasH;")
        $newLines.Add("      el.style.width = canvasW + 'px'; el.style.height = canvasH + 'px';")
        $newLines.Add("")
        $newLines.Add("      if (disposed) return;")
        $newLines.Add("")
        $newLines.Add("      const canvas = new Canvas(el, {")
        $newLines.Add("        width: canvasW, height: canvasH,")
        $newLines.Add("        backgroundColor: '#FFFFFF',")
        $newLines.Add("        selection: true,")
        $newLines.Add("        perPixelTargetFind: false,")
        $newLines.Add("      });")
        $newLines.Add("")
        $newLines.Add("      fcRef.current = canvas;")
        $newLines.Add("      setCanvasReady(true);")
        $newLines.Add("      canvas.fireRightClick = true;")
        $newLines.Add("      canvas.stopContextMenu = true;")
        $newLines.Add("")
        $newLines.Add("      // Draw guide layer only for normal mode")
        $newLines.Add("      if (!isBlank) {")
        $newLines.Add("        await drawGuideLayer(canvas, scaleRef.current);")
        $newLines.Add("        canvas.getObjects().filter((o: any) => o._isGuideLayer).forEach((o: any) => {")
        $newLines.Add("          canvas.sendObjectToBack(o);")
        $newLines.Add("        });")
        $newLines.Add("      }")

        # Skip old lines until we reach "// Event handlers"
        while ($i + 1 -lt $lines.Length) {
            $i++
            if ($lines[$i] -match '// Event handlers') {
                $i--  # Let the main loop pick up this line
                break
            }
        }
        $fix1 = $true
        Write-Host "Fix 1: Unified canvas creation block"
        continue
    }

    # ── FIX 2: Add stroke override after loadSVGFromString ──
    if ($line -match 'const result = await F\.loadSVGFromString\(svgStr\)' -and -not $fix2) {
        $newLines.Add($line)
        $newLines.Add('            // Force all uploaded dieline strokes to solid dark black')
        $newLines.Add('            const forceBlack = (objs: any[]) => {')
        $newLines.Add('              if (!objs) return;')
        $newLines.Add('              objs.forEach((obj: any) => {')
        $newLines.Add('                if (obj.stroke) obj.set({ stroke: "#111111" });')
        $newLines.Add('                if (obj.strokeDashArray) obj.set({ strokeDashArray: null });')
        $newLines.Add('                if (obj._objects) forceBlack(obj._objects);')
        $newLines.Add('              });')
        $newLines.Add('            };')
        $newLines.Add('            forceBlack(result.objects);')
        $fix2 = $true
        Write-Host "Fix 2: Added recursive black stroke override after loadSVGFromString"
        continue
    }

    $newLines.Add($line)
}

[System.IO.File]::WriteAllLines($file, $newLines.ToArray())

$written = [System.IO.File]::ReadAllLines($file)
$safe = $true
@("export default function", "fcRef", "useEffect", "return (") | ForEach-Object {
    $found = $false; foreach ($wl in $written) { if ($wl -match [regex]::Escape($_)) { $found = $true; break } }
    if (-not $found) { Write-Host "MISSING: $_"; $safe = $false }
}
if ($written.Length -lt $originalCount * 0.5) { Write-Host "LINE COUNT TOO LOW"; $safe = $false }

if (-not $safe) {
    Copy-Item "$backupDir\unified-editor_$timestamp.tsx" $file
    Write-Host "RESTORED from backup!"
} else {
    Write-Host "SAFE: $($written.Length) lines (was $originalCount)"
}

Write-Host "`n=== Verify canvas block (L370-420) ==="
for ($i2 = 369; $i2 -lt [Math]::Min(420, $written.Length); $i2++) {
    Write-Host "L$($i2+1): $($written[$i2])"
}

Write-Host "`n=== Verify stroke override ==="
for ($i2 = 0; $i2 -lt $written.Length; $i2++) {
    if ($written[$i2] -match 'forceBlack') {
        Write-Host "L$($i2+1): $($written[$i2].TrimStart().Substring(0, [Math]::Min(120, $written[$i2].TrimStart().Length)))"
    }
}