cd C:\Users\user\Desktop\dev\packive
$file = "src\components\editor\unified-editor.tsx"
$lines = [System.Collections.ArrayList]@(Get-Content $file -Encoding UTF8)
Write-Host "[Start] $($lines.Count) lines" -ForegroundColor Cyan

# ══════ All previous fixes + measure improvements in one pass ══════

# [1] Add svgMmWRef/svgMmHRef after scaleYRef
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "scaleYRef = useRef\(1\)") {
        $lines.Insert($i+1, "  const svgMmWRef = useRef(0);")
        $lines.Insert($i+2, "  const svgMmHRef = useRef(0);")
        Write-Host "[1] svgMmWRef/svgMmHRef" -ForegroundColor Green
        break
    }
}

# [2] Add upload confirm states after showUploadGuide
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "showUploadGuide.*useState.*false") {
        $lines.Insert($i+1, "  const [showSizeConfirm, setShowSizeConfirm] = useState(false);")
        $lines.Insert($i+2, "  const [uploadSizeW, setUploadSizeW] = useState(0);")
        $lines.Insert($i+3, "  const [uploadSizeH, setUploadSizeH] = useState(0);")
        $lines.Insert($i+4, '  const pendingDielineRef = useRef<{group:any; origMmW:number; origMmH:number; svgOrigW:number; svgOrigH:number} | null>(null);')
        Write-Host "[2] Upload confirm states" -ForegroundColor Green
        break
    }
}

# [3] Measure tool: find setMeasurePts callback and replace with snap version
# Find "setMeasurePts(prev => {" then find "const next = " line
$measStart = -1
$nextLine = -1
$resultLine = -1
$returnLine = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "setMeasurePts\(prev => \{" -and $measStart -eq -1) { $measStart = $i }
    if ($measStart -gt 0 -and $lines[$i] -match "const next = prev\.length >= 2") { $nextLine = $i }
    if ($measStart -gt 0 -and $lines[$i] -match "setMeasureResult\(dist\.toFixed") { $resultLine = $i }
    if ($measStart -gt 0 -and $lines[$i] -match "return next;") { $returnLine = $i; break }
}
Write-Host "[3] Measure: setMeasurePts=$($measStart+1), next=$($nextLine+1), result=$($resultLine+1), return=$($returnLine+1)" -ForegroundColor Cyan

# Replace the block from measStart to returnLine with clean snap version
if ($measStart -gt 0 -and $returnLine -gt 0) {
    # Remove old lines
    for ($k = $returnLine; $k -ge $measStart; $k--) { $lines.RemoveAt($k) }
    
    $snapBlock = @(
        '    setMeasurePts(prev => {'
        '      let snapX = mmX, snapY = mmY;'
        '      if (prev.length === 1 && opt.e?.shiftKey) {'
        '        const adx = Math.abs(mmX - prev[0].x), ady = Math.abs(mmY - prev[0].y);'
        '        if (adx > ady * 2) { snapY = prev[0].y; }'
        '        else if (ady > adx * 2) { snapX = prev[0].x; }'
        '        else { const avg = (adx + ady) / 2; snapX = prev[0].x + avg * Math.sign(mmX - prev[0].x); snapY = prev[0].y + avg * Math.sign(mmY - prev[0].y); }'
        '      }'
        '      const next = prev.length >= 2 ? [{x:snapX,y:snapY}] : [...prev, {x:snapX,y:snapY}];'
        '      if (next.length === 2) {'
        '        const dx = next[1].x - next[0].x, dy = next[1].y - next[0].y;'
        '        const dist = Math.sqrt(dx*dx + dy*dy);'
        '        setMeasureResult(dist.toFixed(4) + " mm (dx:" + dx.toFixed(2) + " dy:" + dy.toFixed(2) + ")");'
        '      } else { setMeasureResult("Click second point..."); }'
        '      return next;'
    )
    for ($k = $snapBlock.Count - 1; $k -ge 0; $k--) { $lines.Insert($measStart, $snapBlock[$k]) }
    Write-Host "[3] Measure snap + toFixed(4) applied" -ForegroundColor Green
}

# [3b] Measure canvas label toFixed(4)
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'dist\.toFixed\(2\)\+" mm"' -and $lines[$i] -match '_isMeasure') {
        $lines[$i] = $lines[$i].Replace('dist.toFixed(2)+" mm"', 'dist.toFixed(4)+" mm"')
        Write-Host "[3b] Measure label toFixed(4)" -ForegroundColor Green
        break
    }
}

# [4] Upload path: save to ref + show dialog instead of direct placement
$placementStart = -1
$placementEnd = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '\[Dieline\] SVG original:' -and $i -lt 2100) {
        $placementStart = $i + 1
        break
    }
}
for ($i = $placementStart; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "c\.add\(group\); c\.sendObjectToBack") {
        $placementEnd = $i
        break
    }
}
Write-Host "[4] Placement code: lines $($placementStart+1)-$($placementEnd+1)" -ForegroundColor Cyan

# Save placement code
$placementCode = @()
for ($k = $placementStart; $k -le $placementEnd; $k++) { $placementCode += $lines[$k] }

# Remove and insert dialog trigger
for ($k = $placementEnd; $k -ge $placementStart; $k--) { $lines.RemoveAt($k) }
$trigger = @(
    "            svgMmWRef.current = origMmW; svgMmHRef.current = origMmH;"
    "            pendingDielineRef.current = { group, origMmW, origMmH, svgOrigW, svgOrigH };"
    "            setUploadSizeW(parseFloat(origMmW.toFixed(2)));"
    "            setUploadSizeH(parseFloat(origMmH.toFixed(2)));"
    "            setShowSizeConfirm(true);"
    "            return;"
)
for ($k = $trigger.Count - 1; $k -ge 0; $k--) { $lines.Insert($placementStart, $trigger[$k]) }
Write-Host "[4] Upload dialog trigger inserted" -ForegroundColor Green

# [5] Add confirmDielineSize before addText
$addTextIdx = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "const addText = useCallback") { $addTextIdx = $i; break }
}

$handler = @(
    "  // ─── Confirm Dieline Size (Upload) ───"
    "  const confirmDielineSize = useCallback(() => {"
    "    const p = pendingDielineRef.current; if (!p) return;"
    "    const c = fcRef.current; if (!c) return;"
    "    const origMmW = uploadSizeW;"
    "    const origMmH = uploadSizeH;"
    "    const group = p.group;"
    "    svgMmWRef.current = origMmW; svgMmHRef.current = origMmH;"
    '    console.log("[Dieline] User confirmed size:", origMmW, "x", origMmH, "mm");'
    ""
)
foreach ($pl in $placementCode) {
    $trimmed = $pl.TrimStart()
    if ($trimmed.Length -gt 0) { $handler += "    $trimmed" } else { $handler += "" }
}
$handler += @(
    "    setShowSizeConfirm(false);"
    "    pendingDielineRef.current = null;"
    "  }, [uploadSizeW, uploadSizeH]);"
    ""
)
for ($k = $handler.Count - 1; $k -ge 0; $k--) { $lines.Insert($addTextIdx, $handler[$k]) }
Write-Host "[5] confirmDielineSize handler added" -ForegroundColor Green

# [6] API sizes extraction in Generate path
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "const data = await apiRes\.json\(\)" -and $i -gt 2500) {
        $lines.Insert($i+1, "          if (data.sizes) { svgMmWRef.current = data.sizes.PageW || 0; svgMmHRef.current = data.sizes.PageH || 0; }")
        Write-Host "[6] API sizes extraction" -ForegroundColor Green
        break
    }
}

# [7] Update generatePanelMap calls
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "generatePanelMap\(_pmBox, _pmL, _pmW, _pmD\)" -and $lines[$i] -notmatch "svgMmWRef") {
        $lines[$i] = $lines[$i].Replace("generatePanelMap(_pmBox, _pmL, _pmW, _pmD)", "generatePanelMap(_pmBox, _pmL, _pmW, _pmD, svgMmWRef.current, svgMmHRef.current)")
        Write-Host "[7a] Ungroup panelMap call" -ForegroundColor Green
    }
    if ($lines[$i] -match "generatePanelMap\(_gBox, dimLength, dimWidth, dimHeight\)" -and $lines[$i] -notmatch "svgMmWRef") {
        $lines[$i] = $lines[$i].Replace("generatePanelMap(_gBox, dimLength, dimWidth, dimHeight)", "generatePanelMap(_gBox, dimLength, dimWidth, dimHeight, svgMmWRef.current, svgMmHRef.current)")
        Write-Host "[7b] Generate panelMap call" -ForegroundColor Green
    }
}

# [8] Fix Generate brace bug
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'if \(pm\) setPanelMapData\(pm\); console\.log') {
        $lines[$i] = '                            if (pm) { setPanelMapData(pm); console.log("[PanelMap-Gen]", pm.panels.length, "panels"); }'
        Write-Host "[8] Brace bug fix" -ForegroundColor Green
        break
    }
}

# [9] NET display toFixed(2) with svgMmWRef
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'Net:.*totalW\.toFixed') {
        $lines[$i] = '                <span>Net: {(svgMmWRef.current > 0 ? svgMmWRef.current : totalW).toFixed(2)} x {(svgMmHRef.current > 0 ? svgMmHRef.current : totalH).toFixed(2)} mm</span>'
        Write-Host "[9] NET toFixed(2)" -ForegroundColor Green
        break
    }
}

# [10] Panels tab Dieline Size
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'Dieline Size:.*panelMapData\.totalWidth') {
        $lines[$i] = '                      <div className="text-[10px] text-gray-500">Dieline Size: {(svgMmWRef.current > 0 ? svgMmWRef.current : panelMapData.totalWidth).toFixed(2)} x {(svgMmHRef.current > 0 ? svgMmHRef.current : panelMapData.totalHeight).toFixed(2)} mm (flat)</div>'
        Write-Host "[10] Panels size toFixed(2)" -ForegroundColor Green
        break
    }
}

# [11] Dialog UI before export modal
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "showExport &&") {
        $dialog = @(
            '      {showSizeConfirm && ('
            '        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setShowSizeConfirm(false)}>'
            '          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96" onClick={e => e.stopPropagation()}>'
            '            <h3 className="text-lg font-bold text-gray-800 mb-2">Confirm Dieline Size</h3>'
            '            <p className="text-xs text-gray-500 mb-4">Verify the actual flat dimensions of the uploaded dieline (mm).</p>'
            '            <div className="flex gap-3 mb-4">'
            '              <div className="flex-1">'
            '                <label className="text-[10px] text-gray-500 mb-1 block">Width (mm)</label>'
            '                <input type="number" step="0.01" value={uploadSizeW} onChange={e => setUploadSizeW(Number(e.target.value))}'
            '                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />'
            '              </div>'
            '              <div className="flex-1">'
            '                <label className="text-[10px] text-gray-500 mb-1 block">Height (mm)</label>'
            '                <input type="number" step="0.01" value={uploadSizeH} onChange={e => setUploadSizeH(Number(e.target.value))}'
            '                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />'
            '              </div>'
            '            </div>'
            '            <div className="flex gap-2">'
            '              <button onClick={() => { setShowSizeConfirm(false); pendingDielineRef.current = null; }}'
            '                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>'
            '              <button onClick={confirmDielineSize}'
            '                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-md">Confirm</button>'
            '            </div>'
            '          </div>'
            '        </div>'
            '      )}'
        )
        for ($k = $dialog.Count - 1; $k -ge 0; $k--) { $lines.Insert($i, $dialog[$k]) }
        Write-Host "[11] Dialog UI added" -ForegroundColor Green
        break
    }
}

# ══════ SAVE ══════
$lines.ToArray() | Set-Content $file -Encoding UTF8
Write-Host "`n[Done] $($lines.Count) lines" -ForegroundColor Green

# ══════ VERIFY ══════
$v = Get-Content $file -Encoding UTF8
$checks = [ordered]@{
    "svgMmWRef" = "svgMmWRef = useRef"
    "showSizeConfirm" = "showSizeConfirm.*useState"
    "pendingDielineRef" = "pendingDielineRef = useRef"
    "confirmDielineSize" = "const confirmDielineSize"
    "Shift snap" = "opt\.e\?\.shiftKey"
    "toFixed(4) measure" = "toFixed\(4\)"
    "API sizes" = "data\.sizes\.PageW"
    "dialog UI" = "Confirm Dieline Size"
    "NET toFixed(2)" = "svgMmWRef.*toFixed\(2\)"
}
Write-Host "`n=== Verify ===" -ForegroundColor Cyan
foreach ($k in $checks.Keys) {
    $cnt = ($v | Select-String $checks[$k]).Count
    $color = if ($cnt -ge 1) { "Green" } else { "Red" }
    Write-Host "  ${k}: $cnt" -ForegroundColor $color
}
