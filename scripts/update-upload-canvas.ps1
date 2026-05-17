$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$backupDir = "C:\Users\user\Desktop\dev\packive\backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\unified-editor_$timestamp.tsx"

Copy-Item $file $backupFile
Write-Host "BACKUP: unified-editor_$timestamp.tsx"

$lines = [System.IO.File]::ReadAllLines($file)
$originalCount = $lines.Length
Write-Host "Original: $originalCount lines"

$newLines = New-Object System.Collections.Generic.List[string]
$fixCount = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]

    # ── FIX 1: Blank mode canvas size (L367-380 area) ──
    # After "const ch = wrapperRef.current!.clientHeight;" add blank mode handling
    if ($line -match 'const ch = wrapperRef\.current!\.clientHeight;' -and $fixCount -eq 0) {
        $newLines.Add($line)
        $newLines.Add("")
        $newLines.Add("      // Blank canvas mode: use full wrapper area")
        $newLines.Add("      const isBlank = (L === 0 && W === 0 && D === 0);")
        $newLines.Add("      if (isBlank) {")
        $newLines.Add("        const blankW = cw - 20;")
        $newLines.Add("        const blankH = ch - 60;")
        $newLines.Add("        const el = canvasElRef.current!;")
        $newLines.Add("        el.width = blankW; el.height = blankH;")
        $newLines.Add("        el.style.width = blankW + 'px'; el.style.height = blankH + 'px';")
        $newLines.Add("        if (disposed) return;")
        $newLines.Add("        const canvas = new Canvas(el, { width: blankW, height: blankH, backgroundColor: '#FFFFFF', selection: true, perPixelTargetFind: false });")
        $newLines.Add("        fcRef.current = canvas; setCanvasReady(true);")
        $newLines.Add("        canvas.fireRightClick = true; canvas.stopContextMenu = true;")
        $newLines.Add("        scaleRef.current = 1;")
        # Copy event handlers reference - skip to after guide layer setup
        $newLines.Add("        // Event handlers will be set below")
        $newLines.Add("        // Skip guide layer for blank mode")
        $newLines.Add("      }")
        $fixCount++
        Write-Host "Fix 1: Added blank mode canvas block after L$($i+1)"
        continue
    }

    # ── FIX 1b: Wrap existing canvas init in else block ──
    if ($line -match 'const netW = totalW \+ PAD \* 2;' -and $fixCount -eq 1) {
        $newLines.Add("      if (!isBlank) {  // Normal mode with dimensions")
        $newLines.Add($line)
        $fixCount++
        Write-Host "Fix 1b: Wrapped normal canvas init in else at L$($i+1)"
        continue
    }

    # ── FIX 1c: Close the else block after guide layer setup ──
    if ($line -match 'canvas\.sendObjectToBack\(o\)' -and $fixCount -eq 2) {
        $newLines.Add($line)
        # Find the closing }); of the forEach
        if ($i + 1 -lt $lines.Length -and $lines[$i+1] -match '^\s*\}\);') {
            $i++
            $newLines.Add($lines[$i])
            $newLines.Add("      } // end if (!isBlank)")
            $fixCount++
            Write-Host "Fix 1c: Closed else block after L$($i+1)"
        }
        continue
    }

    # ── FIX 2: Upload handler - remove old dielines + support EPS/AI/PDF ──
    if ($line -match '<input ref=\{dielineFileRef\}' -and $line -match 'onChange') {
        # Replace entire upload handler (L858 through L878)
        $newLines.Add('        <input ref={dielineFileRef} type="file" accept=".eps,.ai,.pdf,.svg" className="hidden" onChange={async (e) => {')
        $newLines.Add('          const f = e.target.files?.[0]; if (!f) return;')
        $newLines.Add('          const c = fcRef.current; if (!c) return;')
        $newLines.Add('          const F = fabricModRef.current; if (!F) return;')
        $newLines.Add('          setDielineFileName(f.name);')
        $newLines.Add('          // Remove existing dielines first')
        $newLines.Add('          const oldDielines = c.getObjects().filter((o: any) => o._isDieLine || o._isGuideLayer || o._isFoldLine || o._isPanelLabel);')
        $newLines.Add('          oldDielines.forEach((o: any) => c.remove(o));')
        $newLines.Add('          ')
        $newLines.Add('          const ext = f.name.split(".").pop()?.toLowerCase() || "";')
        $newLines.Add('          let svgStr = "";')
        $newLines.Add('          ')
        $newLines.Add('          if (ext === "svg") {')
        $newLines.Add('            svgStr = await f.text();')
        $newLines.Add('          } else if (ext === "eps") {')
        $newLines.Add('            // Try convert-eps API first (CorelDRAW parser)')
        $newLines.Add('            try {')
        $newLines.Add('              const fd = new FormData(); fd.append("file", f);')
        $newLines.Add('              const res = await fetch("/api/convert-eps", { method: "POST", body: fd });')
        $newLines.Add('              const data = await res.json();')
        $newLines.Add('              if (data.svg) { svgStr = data.svg; }')
        $newLines.Add('              else {')
        $newLines.Add('                // Fallback to convert-file (Ghostscript + Inkscape)')
        $newLines.Add('                const fd2 = new FormData(); fd2.append("file", f);')
        $newLines.Add('                const res2 = await fetch("/api/convert-file", { method: "POST", body: fd2 });')
        $newLines.Add('                const data2 = await res2.json();')
        $newLines.Add('                if (data2.svg) svgStr = data2.svg;')
        $newLines.Add('                else { alert("EPS conversion failed: " + (data2.error || "Unknown")); return; }')
        $newLines.Add('              }')
        $newLines.Add('            } catch (err: any) { alert("EPS upload failed: " + err.message); return; }')
        $newLines.Add('          } else if (ext === "ai" || ext === "pdf") {')
        $newLines.Add('            // Use convert-file API (Ghostscript + Inkscape pipeline)')
        $newLines.Add('            try {')
        $newLines.Add('              const fd = new FormData(); fd.append("file", f);')
        $newLines.Add('              const res = await fetch("/api/convert-file", { method: "POST", body: fd });')
        $newLines.Add('              const data = await res.json();')
        $newLines.Add('              if (data.svg) svgStr = data.svg;')
        $newLines.Add('              else { alert(ext.toUpperCase() + " conversion failed: " + (data.error || "Unknown")); return; }')
        $newLines.Add('            } catch (err: any) { alert(ext.toUpperCase() + " upload failed: " + err.message); return; }')
        $newLines.Add('          } else {')
        $newLines.Add('            alert("Unsupported format: " + ext); return;')
        $newLines.Add('          }')
        $newLines.Add('          ')
        $newLines.Add('          if (!svgStr) { alert("No SVG data received"); return; }')
        $newLines.Add('          ')
        $newLines.Add('          try {')
        $newLines.Add('            const result = await F.loadSVGFromString(svgStr);')
        $newLines.Add('            const group = F.util.groupSVGElements(result.objects, result.options);')
        $newLines.Add('            group.set({ _isDieLine: true, _isGuideLayer: true, selectable: !dielineLocked, evented: !dielineLocked, name: "__dieline_upload__" });')
        $newLines.Add('            const cw2 = c.getWidth(), ch2 = c.getHeight();')
        $newLines.Add('            const sw = cw2 * 0.9 / (group.width || 1), sh = ch2 * 0.9 / (group.height || 1);')
        $newLines.Add('            const sc = Math.min(sw, sh);')
        $newLines.Add('            group.set({ scaleX: sc, scaleY: sc, left: cw2 / 2, top: ch2 / 2, originX: "center", originY: "center" });')
        $newLines.Add('            c.add(group); c.sendObjectToBack(group); c.requestRenderAll();')
        $newLines.Add('          } catch (err: any) { alert("Failed to load dieline: " + err.message); }')
        $newLines.Add('          e.target.value = "";')
        $newLines.Add('        }} />')

        # Skip old upload handler lines until we find the closing /> or }} />
        while ($i + 1 -lt $lines.Length) {
            $i++
            if ($lines[$i] -match '\}\}\s*/>' -or ($lines[$i] -match '/>' -and $lines[$i-1] -match 'readAsText')) {
                break
            }
            if ($lines[$i] -match '^\s*<button.*dielineFileRef') {
                $i--
                break
            }
        }
        $fixCount++
        Write-Host "Fix 2: Replaced upload handler with multi-format support"
        continue
    }

    $newLines.Add($line)
}

# Write file
[System.IO.File]::WriteAllLines($file, $newLines.ToArray())

# Safety checks
$written = [System.IO.File]::ReadAllLines($file)
$safe = $true
@("export default function", "fcRef", "useEffect", "return (") | ForEach-Object {
    $found = $false
    foreach ($wl in $written) { if ($wl -match [regex]::Escape($_)) { $found = $true; break } }
    if (-not $found) { Write-Host "MISSING: $_"; $safe = $false }
}
if ($written.Length -lt $originalCount * 0.5) { Write-Host "LINE COUNT TOO LOW: $($written.Length)"; $safe = $false }

if (-not $safe) {
    Copy-Item $backupFile $file
    Write-Host "RESTORED from backup!"
} else {
    Write-Host "SAFE: $($written.Length) lines (was $originalCount)"
}

Write-Host "`n=== Verify blank mode ==="
for ($i = 0; $i -lt $written.Length; $i++) {
    if ($written[$i] -match 'isBlank') { Write-Host "L$($i+1): $($written[$i].TrimStart().Substring(0, [Math]::Min(100, $written[$i].TrimStart().Length)))" }
}

Write-Host "`n=== Verify upload handler ==="
for ($i = 0; $i -lt $written.Length; $i++) {
    if ($written[$i] -match 'convert-eps|convert-file|oldDielines') { Write-Host "L$($i+1): $($written[$i].TrimStart().Substring(0, [Math]::Min(100, $written[$i].TrimStart().Length)))" }
}