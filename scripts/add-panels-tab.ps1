$file = "src\components\editor\unified-editor.tsx"
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "backups\unified-editor_pre-panels-tab_$ts.tsx"
Write-Host "[Backup] Done" -ForegroundColor Green

$lines = Get-Content $file -Encoding UTF8
Write-Host "Original: $($lines.Count) lines"

# === CHANGE 1: Update RightTab type (line 26) ===
$lines[25] = "type RightTab = ""properties"" | ""ai"" | ""layers"" | ""panels"";"
Write-Host "[1] RightTab type updated" -ForegroundColor Green

# === CHANGE 2: Add panelMapData state (after line 107) ===
# Find line with rightTab useState
$rtIdx = -1
for ($i = 100; $i -lt 120; $i++) {
    if ($lines[$i] -match "rightTab.*useState") { $rtIdx = $i; break }
}
if ($rtIdx -ge 0) {
    $stateLines = @(
        "  const [panelMapData, setPanelMapData] = useState<any>(null);"
    )
    $lines = $lines[0..$rtIdx] + $stateLines + $lines[($rtIdx+1)..($lines.Count-1)]
    Write-Host "[2] panelMapData state added after line $($rtIdx+1)" -ForegroundColor Green
} else { Write-Host "[2] WARNING: rightTab line not found" -ForegroundColor Red }

# Re-read to get updated indices
# === CHANGE 3: Add "panels" tab button ===
# Find the layers tab entry in the array
$tabIdx = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "id: ""layers"".*label: ""Layers""") { $tabIdx = $i; break }
}
if ($tabIdx -ge 0) {
    # Insert panels tab after layers
    $panelTab = "              { id: ""panels"" as RightTab, label: ""Panels"", icon: ""\u25A3"" },"
    $lines = $lines[0..$tabIdx] + @($panelTab) + $lines[($tabIdx+1)..($lines.Count-1)]
    Write-Host "[3] Panels tab button added after line $($tabIdx+1)" -ForegroundColor Green
} else { Write-Host "[3] WARNING: layers tab not found" -ForegroundColor Red }

# === CHANGE 4: Store panelMapData in Generate + Ungroup paths ===
# Find "[PanelMap-Gen]" line and add setPanelMapData
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "PanelMap-Gen.*panels") {
        $lines[$i] = $lines[$i].Replace("console.log(""[PanelMap-Gen]""", "setPanelMapData(pm); console.log(""[PanelMap-Gen]""")
        Write-Host "[4a] setPanelMapData added to Generate path at line $($i+1)" -ForegroundColor Green
        break
    }
}
# Find "[PanelMap] Generated:" in Ungroup path
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "\[PanelMap\] Generated:") {
        $lines[$i] = $lines[$i].Replace("console.log(""[PanelMap] Generated:""", "setPanelMapData(pm); console.log(""[PanelMap] Generated:""")
        Write-Host "[4b] setPanelMapData added to Ungroup path at line $($i+1)" -ForegroundColor Green
        break
    }
}

# === CHANGE 5: Add Panels tab content before Layers tab ===
# Find "{/* --- Layers Tab --- */}"
$layersIdx = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "Layers Tab") { $layersIdx = $i; break }
}
if ($layersIdx -ge 0) {
    $panelsContent = @(
        "            {/* --- Panels Tab (Phase 5-1b) --- */}",
        "            {rightTab === ""panels"" && (",
        "              <div className=""space-y-1"">",
        "                <div className=""text-xs font-semibold text-gray-700 mb-2"">Panel Map {panelMapData ? ""("" + panelMapData.panels.length + "" faces)"" : """"}</div>",
        "                {!panelMapData ? (",
        "                  <div className=""text-xs text-gray-400 text-center py-6"">",
        "                    <div className=""text-2xl mb-2"">📦</div>",
        "                    Generate or upload a dieline first",
        "                  </div>",
        "                ) : (",
        "                  <div className=""space-y-1"">",
        "                    {panelMapData.panels.map((p: any) => {",
        "                      const roleColors: Record<string,string> = { front:""border-blue-400 bg-blue-50"", back:""border-purple-400 bg-purple-50"", left:""border-green-400 bg-green-50"", right:""border-amber-400 bg-amber-50"", flap:""border-gray-300 bg-gray-50"", glue:""border-red-300 bg-red-50"" };",
        "                      const style = roleColors[p.role] || ""border-gray-300 bg-gray-50"";",
        "                      return (",
        "                        <div key={p.id}",
        "                          className={""flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer hover:shadow-sm transition-all "" + style}",
        "                          onClick={() => {",
        "                            const c = fcRef.current; if (!c) return;",
        "                            // Zoom to panel area",
        "                            const dieGroup = c.getObjects().find((o: any) => o.name === ""__dieline_upload__"" || o._isDieLine) as any;",
        "                            if (!dieGroup && !panelMapData) return;",
        "                            const pxMm = scaleRef.current || 1;",
        "                            console.log(""[Panels] Clicked:"", p.nameKo, p.role, p.width + ""x"" + p.height + ""mm"");",
        "                          }}",
        "                        >",
        "                          <div className=""w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold "" + (p.role === ""front"" ? ""bg-blue-500 text-white"" : p.role === ""back"" ? ""bg-purple-500 text-white"" : p.role === ""left"" ? ""bg-green-500 text-white"" : p.role === ""right"" ? ""bg-amber-500 text-white"" : ""bg-gray-400 text-white"")}",
        "                          >",
        "                            {p.role === ""front"" ? ""F"" : p.role === ""back"" ? ""B"" : p.role === ""left"" ? ""L"" : p.role === ""right"" ? ""R"" : p.role === ""glue"" ? ""G"" : ""P""}",
        "                          </div>",
        "                          <div className=""flex-1 min-w-0"">",
        "                            <div className=""text-xs font-medium text-gray-800 truncate"">{p.nameKo}</div>",
        "                            <div className=""text-[10px] text-gray-400"">{p.width.toFixed(0)} x {p.height.toFixed(0)} mm</div>",
        "                          </div>",
        "                          <div className=""text-[10px] text-gray-400 shrink-0"">{p.role}</div>",
        "                        </div>",
        "                      );",
        "                    })}",
        "                    <div className=""mt-3 px-2 py-2 bg-gray-50 rounded-lg"">",
        "                      <div className=""text-[10px] text-gray-500"">Total: {panelMapData.totalWidth.toFixed(0)} x {panelMapData.totalHeight.toFixed(0)} mm</div>",
        "                      <div className=""text-[10px] text-gray-500"">Box: {panelMapData.boxType} | L:{panelMapData.L} W:{panelMapData.W} D:{panelMapData.D}</div>",
        "                    </div>",
        "                  </div>",
        "                )}",
        "              </div>",
        "            )}"
    )
    $lines = $lines[0..($layersIdx-1)] + $panelsContent + $lines[$layersIdx..($lines.Count-1)]
    Write-Host "[5] Panels tab content added before Layers tab at line $layersIdx" -ForegroundColor Green
} else { Write-Host "[5] WARNING: Layers Tab marker not found" -ForegroundColor Red }

$lines | Set-Content $file -Encoding UTF8
$v = Get-Content $file -Encoding UTF8
Write-Host "[Done] $($v.Count) lines" -ForegroundColor Green

# Verify
$c1 = ($v | Select-String "panels.*RightTab").Count
$c2 = ($v | Select-String "panelMapData").Count
$c3 = ($v | Select-String "Panels Tab.*Phase 5-1b").Count
$c4 = ($v | Select-String "setPanelMapData").Count
$c5 = ($v | Select-String "handler = async").Count
Write-Host "  panels in RightTab: $c1" -ForegroundColor $(if($c1 -gt 0){"Green"}else{"Red"})
Write-Host "  panelMapData refs: $c2" -ForegroundColor $(if($c2 -gt 2){"Green"}else{"Red"})
Write-Host "  Panels Tab marker: $c3" -ForegroundColor $(if($c3 -gt 0){"Green"}else{"Red"})
Write-Host "  setPanelMapData: $c4" -ForegroundColor $(if($c4 -gt 1){"Green"}else{"Red"})
Write-Host "  keyboard handler: $c5" -ForegroundColor $(if($c5 -gt 0){"Green"}else{"Red"})
