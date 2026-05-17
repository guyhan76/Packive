$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$backupDir = "C:\Users\user\Desktop\dev\packive\backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "$backupDir\unified-editor_$timestamp.tsx"
Write-Host "BACKUP: unified-editor_$timestamp.tsx"

$lines = [System.IO.File]::ReadAllLines($file)
$originalCount = $lines.Length
$newLines = New-Object System.Collections.Generic.List[string]

# Add eyedropper state after drawMode state
$addedEyedropper = $false
$replacedToolbar = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]

    # Add eyedropper state after drawMode
    if ($line -match 'const \[drawMode, setDrawMode\]' -and -not $addedEyedropper) {
        $newLines.Add($line)
        $newLines.Add('  const [eyedropperMode, setEyedropperMode] = useState(false);')
        $newLines.Add('  const [eyedropperResult, setEyedropperResult] = useState<{hex:string;cmyk:[number,number,number,number];spot?:string}|null>(null);')
        $addedEyedropper = $true
        Write-Host "Added eyedropper states after L$($i+1)"
        continue
    }

    # Replace left toolbar section
    if ($line -match 'w-16 bg-white border-r.*flex flex-col items-center' -and $line -match 'shrink-0' -and -not $replacedToolbar) {
        $newLines.Add('        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 shrink-0 overflow-y-auto">')
        $newLines.Add('          {/* ── DESIGN ── */}')
        $newLines.Add('          <span className="text-[8px] font-bold text-gray-400 tracking-wider mb-1">DESIGN</span>')
        $newLines.Add('          {[')
        $newLines.Add('            { icon: "↖", label: "Select", action: () => { const c = fcRef.current; if(c){ c.isDrawingMode = false; setDrawMode(false); setEyedropperMode(false); } } },')
        $newLines.Add('            { icon: "T", label: "Text", action: () => setShowTextPanel(p => !p) },')
        $newLines.Add('            { icon: "\uD83D\uDDBC", label: "Image", action: addImage },')
        $newLines.Add('            { icon: "\u25C6", label: "Shapes", action: () => setShowShapePanel(p => !p) },')
        $newLines.Add('          ].map(btn => (')
        $newLines.Add('            <button key={btn.label} onClick={btn.action} title={btn.label}')
        $newLines.Add('              className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-colors hover:bg-gray-100 text-gray-600">')
        $newLines.Add('              <span className="text-base leading-none">{btn.icon}</span>')
        $newLines.Add('              <span className="text-[9px] mt-0.5">{btn.label}</span>')
        $newLines.Add('            </button>')
        $newLines.Add('          ))}')
        $newLines.Add('')
        $newLines.Add('          {/* ── PACKAGE ── */}')
        $newLines.Add('          <div className="w-8 h-px bg-gray-200 my-2" />')
        $newLines.Add('          <span className="text-[8px] font-bold text-gray-400 tracking-wider mb-1">PACKAGE</span>')
        $newLines.Add('          {[')
        $newLines.Add('            { icon: "\u229E", label: "Table", action: () => setShowTablePanel(p => !p) },')
        $newLines.Add('            { icon: "\u25AE\u25AF", label: "Barcode", action: () => setShowBarcodePanel(p => !p) },')
        $newLines.Add('            { icon: "\u25CE", label: "Marks", action: () => setShowMarkPanel(p => !p) },')
        $newLines.Add('          ].map(btn => (')
        $newLines.Add('            <button key={btn.label} onClick={btn.action} title={btn.label}')
        $newLines.Add('              className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-colors hover:bg-gray-100 text-gray-600">')
        $newLines.Add('              <span className="text-base leading-none">{btn.icon}</span>')
        $newLines.Add('              <span className="text-[9px] mt-0.5">{btn.label}</span>')
        $newLines.Add('            </button>')
        $newLines.Add('          ))}')
        $newLines.Add('')
        $newLines.Add('          {/* ── UTILS ── */}')
        $newLines.Add('          <div className="w-8 h-px bg-gray-200 my-2" />')
        $newLines.Add('          <span className="text-[8px] font-bold text-gray-400 tracking-wider mb-1">UTILS</span>')
        $newLines.Add('          <button onClick={() => {')
        $newLines.Add('            const c = fcRef.current; if (!c) return;')
        $newLines.Add('            const newMode = !eyedropperMode;')
        $newLines.Add('            setEyedropperMode(newMode);')
        $newLines.Add('            if (newMode) {')
        $newLines.Add('              c.isDrawingMode = false; setDrawMode(false);')
        $newLines.Add('              c.defaultCursor = "crosshair";')
        $newLines.Add('              c.hoverCursor = "crosshair";')
        $newLines.Add('              const handler = (opt: any) => {')
        $newLines.Add('                const target = opt.target;')
        $newLines.Add('                if (!target) return;')
        $newLines.Add('                const fill = target.fill || "#000000";')
        $newLines.Add('                const hex = typeof fill === "string" && fill.match(/^#[0-9a-fA-F]{6}$/) ? fill : "#000000";')
        $newLines.Add('                const cmyk = hexToCmyk(hex);')
        $newLines.Add('                const spotName = target._spotColorName || undefined;')
        $newLines.Add('                setEyedropperResult({ hex, cmyk, spot: spotName });')
        $newLines.Add('                setEyedropperMode(false);')
        $newLines.Add('                c.defaultCursor = "default";')
        $newLines.Add('                c.hoverCursor = "move";')
        $newLines.Add('                c.off("mouse:down", handler);')
        $newLines.Add('              };')
        $newLines.Add('              c.on("mouse:down", handler);')
        $newLines.Add('            } else {')
        $newLines.Add('              c.defaultCursor = "default";')
        $newLines.Add('              c.hoverCursor = "move";')
        $newLines.Add('            }')
        $newLines.Add('          }} title="Eyedropper - Pick color (CMYK/Spot)"')
        $newLines.Add('            className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs transition-colors ${eyedropperMode ? "bg-blue-100 text-blue-700 border border-blue-300" : "hover:bg-gray-100 text-gray-600"}`}>')
        $newLines.Add('            <span className="text-base leading-none">{eyedropperMode ? "\uD83D\uDCA7" : "\uD83D\uDCA7"}</span>')
        $newLines.Add('            <span className="text-[9px] mt-0.5">Picker</span>')
        $newLines.Add('          </button>')
        $newLines.Add('          {eyedropperResult && (')
        $newLines.Add('            <div className="w-14 mt-1 p-1 bg-gray-50 rounded border text-[8px] text-center">')
        $newLines.Add('              <div className="w-6 h-6 mx-auto rounded border mb-0.5" style={{ backgroundColor: eyedropperResult.hex }} />')
        $newLines.Add('              <div className="text-gray-500">{eyedropperResult.hex}</div>')
        $newLines.Add('              <div className="text-gray-400">C{eyedropperResult.cmyk[0]} M{eyedropperResult.cmyk[1]}</div>')
        $newLines.Add('              <div className="text-gray-400">Y{eyedropperResult.cmyk[2]} K{eyedropperResult.cmyk[3]}</div>')
        $newLines.Add('              {eyedropperResult.spot && <div className="text-orange-500 font-bold">{eyedropperResult.spot}</div>}')
        $newLines.Add('            </div>')
        $newLines.Add('          )}')

        # Skip old toolbar content until we reach the closing </div> + separator + Delete button area
        # Find the end of old toolbar
        $depth = 1
        while ($i + 1 -lt $lines.Length) {
            $i++
            # Look for Delete button
            if ($lines[$i] -match 'title="Delete"') {
                # Include Delete button
                $newLines.Add('          <button onClick={() => { const c=fcRef.current; if(!c)return; const a=c.getActiveObjects(); a.filter((o:any)=>o.selectable!==false).forEach((o:any)=>c.remove(o)); c.discardActiveObject(); c.requestRenderAll(); pushHistory(); refreshLayers(); }}')
                $newLines.Add('            title="Delete" className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs hover:bg-red-50 text-gray-600 hover:text-red-600">')
                $newLines.Add('            <span className="text-base leading-none">{"\uD83D\uDDD1"}</span>')
                $newLines.Add('            <span className="text-[9px] mt-0.5">Delete</span>')
                $newLines.Add('          </button>')
                # Skip old delete button lines
                while ($i + 1 -lt $lines.Length) {
                    $i++
                    if ($lines[$i] -match 'title="Shortcuts') {
                        $newLines.Add('          <button onClick={() => setShowShortcuts(true)} title="Shortcuts (F1)"')
                        $newLines.Add('            className="w-12 h-12 flex flex-col items-center justify-center rounded-lg text-xs hover:bg-gray-100 text-gray-600">')
                        $newLines.Add('            <span className="text-base leading-none">{"\u2328"}</span>')
                        $newLines.Add('            <span className="text-[9px] mt-0.5">Keys</span>')
                        $newLines.Add('          </button>')
                        # Skip to closing </div>
                        while ($i + 1 -lt $lines.Length) {
                            $i++
                            if ($lines[$i] -match '^\s*</div>' -and $lines[$i+1] -match 'Tool Popups|relative flex-1') {
                                $newLines.Add('        </div>')
                                break
                            }
                        }
                        break
                    }
                }
                break
            }
        }
        $replacedToolbar = $true
        Write-Host "Replaced left toolbar with sectioned layout + eyedropper"
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
if ($written.Length -lt 700) { $safe = $false }

if (-not $safe) {
    Copy-Item "$backupDir\unified-editor_$timestamp.tsx" $file
    Write-Host "RESTORED from backup!"
} else {
    Write-Host "SAFE: $($written.Length) lines (was $originalCount)"
}

Write-Host "`n=== Verify eyedropper state ==="
for ($i = 0; $i -lt $written.Length; $i++) {
    if ($written[$i] -match 'eyedropper') { Write-Host "L$($i+1): $($written[$i].TrimStart().Substring(0, [Math]::Min(100, $written[$i].TrimStart().Length)))" }
}

Write-Host "`n=== Verify section headers ==="
for ($i = 0; $i -lt $written.Length; $i++) {
    if ($written[$i] -match 'DESIGN|PACKAGE|UTILS') { Write-Host "L$($i+1): $($written[$i].TrimStart().Substring(0, [Math]::Min(80, $written[$i].TrimStart().Length)))" }
}