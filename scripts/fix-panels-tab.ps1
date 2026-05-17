$file = "src\components\editor\unified-editor.tsx"
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "backups\unified-editor_pre-panels-fix_$ts.tsx"
Write-Host "[Backup] Done" -ForegroundColor Green

$lines = Get-Content $file -Encoding UTF8

# Fix 1: Change p.nameKo to p.name (English) in Panels tab
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "p\.nameKo" -and $lines[$i] -match "Panels.*Clicked|truncate|nameKo") {
        $lines[$i] = $lines[$i].Replace("p.nameKo", "p.name")
    }
}
Write-Host "[1] nameKo -> name (English labels)" -ForegroundColor Green

# Fix 2: Replace click handler with zoom-to-panel logic
# Find the onClick handler block in Panels tab
$clickStart = -1
$clickEnd = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "Panels\] Clicked:") { $clickStart = $i; break }
}
# The click handler spans from "onClick={() => {" to the console.log line
# Find the onClick start (a few lines before)
if ($clickStart -ge 0) {
    for ($j = $clickStart; $j -ge $clickStart - 10; $j--) {
        if ($lines[$j] -match "onClick=\{") { $clickStart = $j; break }
    }
    # Find the closing }}
    for ($j = $clickStart; $j -lt $clickStart + 15; $j++) {
        if ($lines[$j] -match "^\s*\}\}" -or $lines[$j] -match "\}\}$") { $clickEnd = $j; break }
    }
}
Write-Host "[2] Click handler: lines $($clickStart+1)-$($clickEnd+1)" -ForegroundColor Cyan

# Show these lines for debugging
if ($clickStart -ge 0 -and $clickEnd -ge 0) {
    for ($k = $clickStart; $k -le $clickEnd; $k++) {
        Write-Host "  $($k+1): $($lines[$k])"
    }

    # Replace click handler with zoom logic
    $newClick = @(
        "                          onClick={() => {",
        "                            const c = fcRef.current; if (!c) return;",
        "                            const pm = panelMapData; if (!pm) return;",
        "                            // Find dieline group or calculate origin from ungrouped objects",
        "                            const dieObjs = c.getObjects().filter((o: any) => o._isDieLine);",
        "                            let dieOX = 0, dieOY = 0, pxPerMmX = scaleRef.current, pxPerMmY = scaleRef.current;",
        "                            const dieGroup = dieObjs.find((o: any) => o.name === ""__dieline_upload__"") as any;",
        "                            if (dieGroup) {",
        "                              const gW = dieGroup.width || 1, gH = dieGroup.height || 1;",
        "                              const gScX = dieGroup.scaleX || 1, gScY = dieGroup.scaleY || 1;",
        "                              dieOX = (dieGroup.left || 0) - (gW * gScX / 2);",
        "                              dieOY = (dieGroup.top || 0) - (gH * gScY / 2);",
        "                              pxPerMmX = (gW * gScX) / pm.totalWidth;",
        "                              pxPerMmY = (gH * gScY) / pm.totalHeight;",
        "                            }",
        "                            // Calculate panel position in canvas px",
        "                            const pL = dieOX + p.x * pxPerMmX;",
        "                            const pT = dieOY + p.y * pxPerMmY;",
        "                            const pW = p.width * pxPerMmX;",
        "                            const pH = p.height * pxPerMmY;",
        "                            const centerX = pL + pW / 2;",
        "                            const centerY = pT + pH / 2;",
        "                            // Scroll wrapper to center this panel",
        "                            const wrapper = wrapperRef.current;",
        "                            if (wrapper) {",
        "                              const scrollX = centerX - wrapper.clientWidth / 2;",
        "                              const scrollY = centerY - wrapper.clientHeight / 2;",
        "                              wrapper.scrollTo({ left: Math.max(0, scrollX), top: Math.max(0, scrollY), behavior: ""smooth"" });",
        "                            }",
        "                            // Brief highlight flash via temporary overlay",
        "                            console.log(""[Panels] Zoom to:"", p.name, ""("" + p.role + "")"", ""at"", Math.round(pL) + "","" + Math.round(pT), pW.toFixed(0) + ""x"" + pH.toFixed(0) + ""px"");",
        "                          }}"
    )
    $lines = $lines[0..($clickStart-1)] + $newClick + $lines[($clickEnd+1)..($lines.Count-1)]
    Write-Host "[2] Click handler replaced with zoom logic" -ForegroundColor Green
}

# Fix 3: Update bottom info text to be clearer
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "Total:.*totalWidth.*totalHeight") {
        $lines[$i] = "                      <div className=""text-[10px] text-gray-500"">Dieline Size: {panelMapData.totalWidth.toFixed(0)} x {panelMapData.totalHeight.toFixed(0)} mm (flat)</div>"
        Write-Host "[3a] Total label clarified at line $($i+1)" -ForegroundColor Green
        break
    }
}
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "Box:.*boxType.*\|.*L:") {
        $lines[$i] = "                      <div className=""text-[10px] text-gray-500"">Type: {panelMapData.boxType} | Dimensions: {panelMapData.L} x {panelMapData.W} x {panelMapData.D} mm</div>"
        Write-Host "[3b] Box info clarified at line $($i+1)" -ForegroundColor Green
        break
    }
}

$lines | Set-Content $file -Encoding UTF8
$v = Get-Content $file -Encoding UTF8
Write-Host "[Done] $($v.Count) lines" -ForegroundColor Green

# Verify
$c1 = ($v | Select-String "p\.name[^K]").Count
$c2 = ($v | Select-String "Zoom to:").Count
$c3 = ($v | Select-String "Dieline Size:").Count
$c4 = ($v | Select-String "p\.nameKo").Count
Write-Host "  p.name (English): $c1" -ForegroundColor $(if($c1 -gt 0){"Green"}else{"Red"})
Write-Host "  Zoom to handler: $c2" -ForegroundColor $(if($c2 -gt 0){"Green"}else{"Red"})
Write-Host "  Dieline Size label: $c3" -ForegroundColor $(if($c3 -gt 0){"Green"}else{"Red"})
Write-Host "  nameKo remaining: $c4 (should be 0)" -ForegroundColor $(if($c4 -eq 0){"Green"}else{"Yellow"})
