$file = "src\components\editor\unified-editor.tsx"
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "backups\unified-editor_pre-overlay_$ts.tsx"
Write-Host "[Backup] Done" -ForegroundColor Green

$lines = Get-Content $file -Encoding UTF8
$out = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    # === PART A: Replace lines 1999-2010 (0-indexed: 1998-2009) ===
    if ($i -eq 1998) {
        # Insert new panel overlay block
        $out += "// ── Panel Map Overlay (Phase 5-1) ──"
        $out += "const _pmL = dimLength, _pmW = dimWidth, _pmD = dimHeight, _pmBox = selectedBoxCode;"
        $out += "if (_pmL > 0 && _pmW > 0 && _pmD > 0 && _pmBox) {"
        $out += "  // Remove existing panel overlays"
        $out += "  c.getObjects().filter((o: any) => o._isPanelOverlay).forEach((o: any) => c.remove(o));"
        $out += "  const pm = generatePanelMap(_pmBox, _pmL, _pmW, _pmD);"
        $out += "  if (pm) {"
        $out += "    const dieOriginX = gLeft - (gW * gScX / 2);"
        $out += "    const dieOriginY = gTop - (gH * gScY / 2);"
        $out += "    const diePxW = gW * gScX;"
        $out += "    const diePxH = gH * gScY;"
        $out += "    const pxPerMmX = diePxW / pm.totalWidth;"
        $out += "    const pxPerMmY = diePxH / pm.totalHeight;"
        $out += "    console.log(""[PanelOverlay] dieOrigin:"", dieOriginX.toFixed(1), dieOriginY.toFixed(1),"
        $out += "      ""diePx:"", diePxW.toFixed(1), ""x"", diePxH.toFixed(1),"
        $out += "      ""pxPerMm:"", pxPerMmX.toFixed(3), ""x"", pxPerMmY.toFixed(3));"
        $out += "    const roleColors: Record<string, string> = {"
        $out += "      front: ""rgba(59,130,246,0.12)"","
        $out += "      back: ""rgba(139,92,246,0.12)"","
        $out += "      left: ""rgba(16,185,129,0.12)"","
        $out += "      right: ""rgba(245,158,11,0.12)"","
        $out += "      flap: ""rgba(107,114,128,0.08)"","
        $out += "      glue: ""rgba(239,68,68,0.08)"","
        $out += "    };"
        $out += "    pm.panels.forEach((p) => {"
        $out += "      const panelLeft = dieOriginX + p.x * pxPerMmX;"
        $out += "      const panelTop  = dieOriginY + p.y * pxPerMmY;"
        $out += "      const panelW    = p.width * pxPerMmX;"
        $out += "      const panelH    = p.height * pxPerMmY;"
        $out += "      const rect = new F.Rect({"
        $out += "        left: panelLeft, top: panelTop, width: panelW, height: panelH,"
        $out += "        fill: roleColors[p.role] || ""rgba(100,100,100,0.08)"","
        $out += "        stroke: ""rgba(100,100,100,0.3)"", strokeWidth: 0.5,"
        $out += "        selectable: false, evented: false, originX: ""left"", originY: ""top"","
        $out += "      });"
        $out += "      (rect as any)._isPanelOverlay = true;"
        $out += "      (rect as any)._isPanelLabel = true;"
        $out += "      (rect as any)._panelId = p.id;"
        $out += "      (rect as any)._panelRole = p.role;"
        $out += "      (rect as any).name = `__panel_${p.id}__`;"
        $out += "      c.add(rect);"
        $out += "      const fontSize = Math.max(8, Math.min(14, panelW * 0.12));"
        $out += "      const label = new F.FabricText(p.nameKo, {"
        $out += "        left: panelLeft + panelW / 2, top: panelTop + panelH / 2,"
        $out += "        originX: ""center"", originY: ""center"","
        $out += "        fontSize: fontSize, fill: ""rgba(60,60,60,0.6)"", fontFamily: ""sans-serif"","
        $out += "        selectable: false, evented: false,"
        $out += "      });"
        $out += "      (label as any)._isPanelOverlay = true;"
        $out += "      (label as any)._isPanelLabel = true;"
        $out += "      (label as any).name = `__panel_label_${p.id}__`;"
        $out += "      c.add(label);"
        $out += "      console.log(`[PanelOverlay] ${p.nameKo} (${p.role}): left=${panelLeft.toFixed(1)} top=${panelTop.toFixed(1)} w=${panelW.toFixed(1)} h=${panelH.toFixed(1)}`);"
        $out += "    });"
        $out += "    console.log(""[PanelOverlay] Created"", pm.panels.length, ""panel overlays"");"
        $out += "  }"
        $out += "} else {"
        $out += "  console.log(""[PanelMap] Skipped - dimensions not set"", _pmL, _pmW, _pmD, _pmBox);"
        $out += "}"
        # Skip old lines 1999-2010 (0-indexed 1998-2009)
        $i = 2009
        continue
    }

    # === PART B: Replace Generate Dieline overlay comment (line 2659, 0-indexed 2658) ===
    if ($i -eq 2658) {
        $out += "                        // ── Panel Overlay after Generate Dieline (Phase 5-1) ──"
        $out += "                        {"
        $out += "                          const _gL = dimLength, _gW = dimWidth, _gD = dimHeight, _gBox = selectedBoxCode;"
        $out += "                          if (_gL > 0 && _gW > 0 && _gD > 0 && _gBox) {"
        $out += "                            c.getObjects().filter((o: any) => o._isPanelOverlay).forEach((o: any) => c.remove(o));"
        $out += "                            const pm = generatePanelMap(_gBox, _gL, _gW, _gD);"
        $out += "                            if (pm) {"
        $out += "                              const gW2 = group.width || 1, gH2 = group.height || 1;"
        $out += "                              const dieOX = (finalCW / 2) - (gW2 * exactScaleX / 2);"
        $out += "                              const dieOY = (finalCH / 2) - (gH2 * exactScaleY / 2);"
        $out += "                              const ppX = (gW2 * exactScaleX) / pm.totalWidth;"
        $out += "                              const ppY = (gH2 * exactScaleY) / pm.totalHeight;"
        $out += "                              const roleColors: Record<string, string> = {"
        $out += "                                front:""rgba(59,130,246,0.12)"",back:""rgba(139,92,246,0.12)"","
        $out += "                                left:""rgba(16,185,129,0.12)"",right:""rgba(245,158,11,0.12)"","
        $out += "                                flap:""rgba(107,114,128,0.08)"",glue:""rgba(239,68,68,0.08)"","
        $out += "                              };"
        $out += "                              const F2 = fabricModRef.current;"
        $out += "                              pm.panels.forEach((p) => {"
        $out += "                                const pL = dieOX + p.x * ppX, pT = dieOY + p.y * ppY;"
        $out += "                                const pW = p.width * ppX, pH = p.height * ppY;"
        $out += "                                const r = new F2.Rect({ left:pL, top:pT, width:pW, height:pH,"
        $out += "                                  fill: roleColors[p.role]||""rgba(100,100,100,0.08)"","
        $out += "                                  stroke:""rgba(100,100,100,0.3)"", strokeWidth:0.5,"
        $out += "                                  selectable:false, evented:false, originX:""left"", originY:""top"" });"
        $out += "                                (r as any)._isPanelOverlay = true; (r as any)._isPanelLabel = true;"
        $out += "                                (r as any)._panelId = p.id; (r as any).name = `__panel_${p.id}__`;"
        $out += "                                c.add(r);"
        $out += "                                const fs = Math.max(8, Math.min(14, pW * 0.12));"
        $out += "                                const lb = new F2.FabricText(p.nameKo, {"
        $out += "                                  left:pL+pW/2, top:pT+pH/2, originX:""center"", originY:""center"","
        $out += "                                  fontSize:fs, fill:""rgba(60,60,60,0.6)"", fontFamily:""sans-serif"","
        $out += "                                  selectable:false, evented:false });"
        $out += "                                (lb as any)._isPanelOverlay = true; (lb as any)._isPanelLabel = true;"
        $out += "                                (lb as any).name = `__panel_label_${p.id}__`;"
        $out += "                                c.add(lb);"
        $out += "                              });"
        $out += "                              console.log(""[PanelOverlay-Gen] Created"", pm.panels.length, ""overlays"");"
        $out += "                            }"
        $out += "                          }"
        $out += "                        }"
        continue
    }

    $out += $lines[$i]
}

# Add _isPanelOverlay to JSON_PROPS if not present
for ($i = 0; $i -lt $out.Count; $i++) {
    if ($out[$i] -match "const JSON_PROPS = \[" -and $out[$i] -notmatch "_isPanelOverlay") {
        $out[$i] = $out[$i].Replace("""_isPanelLabel""", """_isPanelLabel"",""_isPanelOverlay"",""_panelId"",""_panelRole""")
        Write-Host "[JSON_PROPS] Added _isPanelOverlay, _panelId, _panelRole" -ForegroundColor Green
    }
    # Also add to pushHistory toJSON call
    if ($out[$i] -match "c\.toJSON\(\[" -and $out[$i] -match "_isPanelLabel" -and $out[$i] -notmatch "_isPanelOverlay") {
        $out[$i] = $out[$i].Replace("""_isPanelLabel""", """_isPanelLabel"",""_isPanelOverlay"",""_panelId"",""_panelRole""")
        Write-Host "[toJSON] Added _isPanelOverlay props at line $($i+1)" -ForegroundColor Green
    }
}

$out | Set-Content $file -Encoding UTF8
Write-Host "[Done] File written: $($out.Count) lines" -ForegroundColor Green

# Verify
$v = Get-Content $file -Encoding UTF8
$checks = @("_isPanelOverlay", "dieOriginX", "PanelOverlay-Gen", "roleColors", "pxPerMmX", "generatePanelMap")
foreach ($ck in $checks) {
    $found = ($v | Select-String -Pattern $ck).Count
    $color = if ($found -gt 0) { "Green" } else { "Red" }
    Write-Host "  [Check] $ck : $found occurrences" -ForegroundColor $color
}
