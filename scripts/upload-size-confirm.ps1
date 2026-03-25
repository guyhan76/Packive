cd C:\Users\user\Desktop\dev\packive
$file = "src\components\editor\unified-editor.tsx"
$lines = [System.Collections.ArrayList]@(Get-Content $file -Encoding UTF8)
$origCount = $lines.Count
Write-Host "[Start] $origCount lines" -ForegroundColor Cyan

# ══════ STEP 1: Add refs and states after showUploadGuide (line ~353) ══════
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "showUploadGuide.*useState.*false") {
        $lines.Insert($i+1, "  const [showSizeConfirm, setShowSizeConfirm] = useState(false);")
        $lines.Insert($i+2, "  const [uploadSizeW, setUploadSizeW] = useState(0);")
        $lines.Insert($i+3, "  const [uploadSizeH, setUploadSizeH] = useState(0);")
        $lines.Insert($i+4, "  const pendingDielineRef = useRef<{group:any; origMmW:number; origMmH:number; svgOrigW:number; svgOrigH:number} | null>(null);")
        Write-Host "[1] Added states after line $($i+1)" -ForegroundColor Green
        break
    }
}

# ══════ STEP 2: Add svgMmWRef/svgMmHRef after scaleYRef ══════
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "scaleYRef = useRef\(1\)") {
        $lines.Insert($i+1, "  const svgMmWRef = useRef(0);")
        $lines.Insert($i+2, "  const svgMmHRef = useRef(0);")
        Write-Host "[2] Added svgMmWRef/svgMmHRef after line $($i+1)" -ForegroundColor Green
        break
    }
}

# ══════ STEP 3: Save placement code from upload handler ══════
# Find origMmW log line in upload path (before line 2100)
$placementStart = -1
$placementEnd = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '\[Dieline\] SVG original:' -and $i -lt 2100) {
        $placementStart = $i + 1  # line after the log = group.width log
        break
    }
}
for ($i = $placementStart; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "c\.add\(group\); c\.sendObjectToBack") {
        $placementEnd = $i
        break
    }
}

Write-Host "[3] Placement code: lines $($placementStart+1) to $($placementEnd+1)" -ForegroundColor Cyan
$placementCode = @()
for ($k = $placementStart; $k -le $placementEnd; $k++) {
    $placementCode += $lines[$k]
}

# ══════ STEP 4: Replace placement code with dialog trigger ══════
# Remove lines from placementStart to placementEnd
for ($k = $placementEnd; $k -ge $placementStart; $k--) {
    $lines.RemoveAt($k)
}
# Insert dialog trigger at placementStart
$trigger = @(
    "            svgMmWRef.current = origMmW; svgMmHRef.current = origMmH;"
    "            pendingDielineRef.current = { group, origMmW, origMmH, svgOrigW, svgOrigH };"
    "            setUploadSizeW(Math.round(origMmW));"
    "            setUploadSizeH(Math.round(origMmH));"
    "            setShowSizeConfirm(true);"
    "            return;"
)
for ($k = 0; $k -lt $trigger.Count; $k++) {
    $lines.Insert($placementStart + $k, $trigger[$k])
}
Write-Host "[4] Replaced placement with dialog trigger" -ForegroundColor Green

# ══════ STEP 5: Add confirmDielineSize function ══════
# Find "const addText = useCallback" as anchor
$addTextIdx = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "const addText = useCallback") {
        $addTextIdx = $i
        break
    }
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
    "    console.log('[Dieline] User confirmed size:', origMmW, 'x', origMmH, 'mm');"
    ""
)

# Add saved placement code (trimmed and indented)
foreach ($pl in $placementCode) {
    $trimmed = $pl.TrimStart()
    if ($trimmed.Length -gt 0) {
        $handler += "    $trimmed"
    } else {
        $handler += ""
    }
}

$handler += @(
    "    setShowSizeConfirm(false);"
    "    pendingDielineRef.current = null;"
    "  }, [uploadSizeW, uploadSizeH]);"
    ""
)

for ($k = $handler.Count - 1; $k -ge 0; $k--) {
    $lines.Insert($addTextIdx, $handler[$k])
}
Write-Host "[5] Added confirmDielineSize before addText (line $($addTextIdx+1))" -ForegroundColor Green

# ══════ STEP 6: Add data.sizes extraction in Generate path ══════
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "const data = await apiRes\.json\(\)" -and $i -gt 2500) {
        $lines.Insert($i+1, "          if (data.sizes) { svgMmWRef.current = data.sizes.PageW || 0; svgMmHRef.current = data.sizes.PageH || 0; }")
        Write-Host "[6] Added API sizes extraction after line $($i+1)" -ForegroundColor Green
        break
    }
}

# ══════ STEP 7: Update generatePanelMap calls ══════
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "generatePanelMap\(_pmBox, _pmL, _pmW, _pmD\)" -and $lines[$i] -notmatch "svgMmWRef") {
        $lines[$i] = $lines[$i].Replace("generatePanelMap(_pmBox, _pmL, _pmW, _pmD)", "generatePanelMap(_pmBox, _pmL, _pmW, _pmD, svgMmWRef.current, svgMmHRef.current)")
        Write-Host "[7a] Updated Ungroup call" -ForegroundColor Green
    }
    if ($lines[$i] -match "generatePanelMap\(_gBox, dimLength, dimWidth, dimHeight\)" -and $lines[$i] -notmatch "svgMmWRef") {
        $lines[$i] = $lines[$i].Replace("generatePanelMap(_gBox, dimLength, dimWidth, dimHeight)", "generatePanelMap(_gBox, dimLength, dimWidth, dimHeight, svgMmWRef.current, svgMmHRef.current)")
        Write-Host "[7b] Updated Generate call" -ForegroundColor Green
    }
}

# ══════ STEP 8: Fix Generate path brace bug ══════
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'if \(pm\) setPanelMapData\(pm\); console\.log') {
        $lines[$i] = '                            if (pm) { setPanelMapData(pm); console.log("[PanelMap-Gen]", pm.panels.length, "panels"); }'
        Write-Host "[8] Fixed brace bug" -ForegroundColor Green
        break
    }
}

# ══════ STEP 9: Update NET display ══════
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'Net:.*totalW\.toFixed.*totalH\.toFixed') {
        $lines[$i] = '                <span>Net: {(svgMmWRef.current > 0 ? svgMmWRef.current : totalW).toFixed(1)} x {(svgMmHRef.current > 0 ? svgMmHRef.current : totalH).toFixed(1)} mm</span>'
        Write-Host "[9] Updated NET display" -ForegroundColor Green
        break
    }
}

# ══════ STEP 10: Update Panels tab Dieline Size ══════
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'Dieline Size:.*panelMapData\.totalWidth') {
        $lines[$i] = '                      <div className="text-[10px] text-gray-500">Dieline Size: {(svgMmWRef.current > 0 ? svgMmWRef.current : panelMapData.totalWidth).toFixed(0)} x {(svgMmHRef.current > 0 ? svgMmHRef.current : panelMapData.totalHeight).toFixed(0)} mm (flat)</div>'
        Write-Host "[10] Updated Panels size" -ForegroundColor Green
        break
    }
}

# ══════ STEP 11: Add dialog UI before export modal ══════
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
            '                <input type="number" value={uploadSizeW} onChange={e => setUploadSizeW(Number(e.target.value))}'
            '                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />'
            '              </div>'
            '              <div className="flex-1">'
            '                <label className="text-[10px] text-gray-500 mb-1 block">Height (mm)</label>'
            '                <input type="number" value={uploadSizeH} onChange={e => setUploadSizeH(Number(e.target.value))}'
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
        for ($k = $dialog.Count - 1; $k -ge 0; $k--) {
            $lines.Insert($i, $dialog[$k])
        }
        Write-Host "[11] Added size confirm dialog UI" -ForegroundColor Green
        break
    }
}

# ══════ SAVE ══════
$lines | Set-Content $file -Encoding UTF8
Write-Host "`n[Done] $($lines.Count) lines (was $origCount)" -ForegroundColor Green

# ══════ VERIFY ══════
$v = Get-Content $file -Encoding UTF8
$checks = [ordered]@{
    "showSizeConfirm useState" = "showSizeConfirm.*useState"
    "pendingDielineRef" = "pendingDielineRef = useRef"
    "svgMmWRef useRef" = "svgMmWRef = useRef"
    "confirmDielineSize function" = "const confirmDielineSize = useCallback"
    "setShowSizeConfirm(true)" = "setShowSizeConfirm\(true\)"
    "dialog UI" = "Confirm Dieline Size"
    "API sizes" = "data\.sizes\.PageW"
    "svgMmWRef in panelMap" = "svgMmWRef\.current.*svgMmHRef\.current"
}
Write-Host "`n=== Verification ===" -ForegroundColor Cyan
foreach ($k in $checks.Keys) {
    $cnt = ($v | Select-String $checks[$k]).Count
    $color = if ($cnt -ge 1) { "Green" } else { "Red" }
    Write-Host "  ${k}: $cnt" -ForegroundColor $color
}
