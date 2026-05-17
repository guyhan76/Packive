$file = "src\components\editor\unified-editor.tsx"
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "backups\unified-editor_pre-fix-shortcuts_$ts.tsx"
Write-Host "[Backup] Done" -ForegroundColor Green

$lines = Get-Content $file -Encoding UTF8
$out = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]

    # FIX 1: Replace canvas overlay code (lines 1999-2057) with data-only panel map
    # Line 1999 (0-indexed 1998) is "// -- Panel Map Overlay (Phase 5-1) --"
    if ($i -eq 1998 -and $line -match "Panel Map Overlay") {
        # Insert data-only panel map (no canvas objects, just console + state)
        $out += "// -- Panel Map Data (Phase 5-1) - sidebar metadata only, no canvas overlay --"
        $out += "const _pmL = dimLength, _pmW = dimWidth, _pmD = dimHeight;"
        $out += "let _pmBox = selectedBoxCode;"
        $out += "// Normalize box code: 'FEFCO 0201' -> 'FEFCO-0201'"
        $out += "if (_pmBox) _pmBox = _pmBox.replace(/^(FEFCO|ECMA)\s+/i, (m: string, p1: string) => p1 + '-');"
        $out += "if (_pmL > 0 && _pmW > 0 && _pmD > 0 && _pmBox) {"
        $out += "  const pm = generatePanelMap(_pmBox, _pmL, _pmW, _pmD);"
        $out += "  if (pm) {"
        $out += "    console.log(""[PanelMap] Generated for"", pm.boxType, ""panels:"", pm.panels.length);"
        $out += "    pm.panels.forEach((p) => {"
        $out += "      console.log(""[PanelMap]"", p.nameKo, ""("" + p.role + ""):"", p.width.toFixed(1) + ""x"" + p.height.toFixed(1) + ""mm"");"
        $out += "    });"
        $out += "  }"
        $out += "} else {"
        $out += "  console.log(""[PanelMap] Skipped - dims:"", _pmL, _pmW, _pmD, ""box:"", _pmBox);"
        $out += "}"
        # Skip old lines until we hit the line after the old block
        # Old block ends just before "c.requestRenderAll();" on line 2058
        while ($i -lt $lines.Count - 1) {
            $i++
            if ($lines[$i] -match "^c\.requestRenderAll\(\)") {
                $out += $lines[$i]
                break
            }
        }
        continue
    }

    # FIX 2: Replace Generate Dieline overlay block with data-only version
    if ($line -match "Panel Overlay after Generate Dieline \(Phase 5-1\)") {
        $out += "                        // -- Panel Map Data after Generate (Phase 5-1) --"
        $out += "                        {"
        $out += "                          let _gBox = selectedBoxCode;"
        $out += "                          if (_gBox) _gBox = _gBox.replace(/^(FEFCO|ECMA)\s+/i, (m: string, p1: string) => p1 + '-');"
        $out += "                          if (dimLength > 0 && dimWidth > 0 && dimHeight > 0 && _gBox) {"
        $out += "                            const pm = generatePanelMap(_gBox, dimLength, dimWidth, dimHeight);"
        $out += "                            if (pm) console.log(""[PanelMap-Gen] Created"", pm.panels.length, ""panel data entries"");"
        $out += "                          }"
        $out += "                        }"
        # Skip the old overlay block until closing braces
        while ($i -lt $lines.Count - 1) {
            $i++
            # The old block ends with a line containing just "}"
            if ($lines[$i].Trim() -eq "}" -and $lines[$i+1] -match "setShowDimModal") {
                break
            }
        }
        continue
    }

    $out += $line
}

$out | Set-Content $file -Encoding UTF8
Write-Host "[Done] Written $($out.Count) lines" -ForegroundColor Green

# Verify
$v = Get-Content $file -Encoding UTF8
$checks = @{
    "sidebar metadata only" = 0
    "_isPanelOverlay" = 0
    "PanelMap-Gen" = 0
    "FEFCO.*-" = 0
    "new F.Rect" = 0
    "new F.FabricText" = 0
    "handler = async" = 0
    "Ctrl\+C" = 0
}
foreach ($ck in $checks.Keys) {
    $cnt = ($v | Select-String -Pattern $ck).Count
    $checks[$ck] = $cnt
}
Write-Host ""
Write-Host "=== Verification ===" -ForegroundColor Cyan
Write-Host "  sidebar metadata only: $($checks['sidebar metadata only'])" -ForegroundColor $(if($checks["sidebar metadata only"] -gt 0){"Green"}else{"Red"})
Write-Host "  _isPanelOverlay (should be 0 or minimal): $($checks['_isPanelOverlay'])" -ForegroundColor $(if($checks["_isPanelOverlay"] -le 3){"Green"}else{"Yellow"})
Write-Host "  PanelMap-Gen: $($checks['PanelMap-Gen'])" -ForegroundColor $(if($checks["PanelMap-Gen"] -gt 0){"Green"}else{"Red"})
Write-Host "  FEFCO normalize: $($checks['FEFCO.*-'])" -ForegroundColor $(if($checks["FEFCO.*-"] -gt 0){"Green"}else{"Red"})
Write-Host "  new F.Rect in panel (should be 0): $($checks['new F.Rect'])" -ForegroundColor $(if($checks["new F.Rect"] -eq 0){"Green"}else{"Red"})
Write-Host "  new F.FabricText in panel (should be 0): $($checks['new F.FabricText'])" -ForegroundColor $(if($checks["new F.FabricText"] -eq 0){"Green"}else{"Red"})
Write-Host "  keyboard handler exists: $($checks['handler = async'])" -ForegroundColor $(if($checks["handler = async"] -gt 0){"Green"}else{"Red"})
Write-Host "  Ctrl+C handler: $($checks['Ctrl\+C'])" -ForegroundColor $(if($checks["Ctrl\+C"] -gt 0){"Green"}else{"Red"})
Write-Host ""
Write-Host "Total lines: $($v.Count)"
