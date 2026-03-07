$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$backupDir = "C:\Users\user\Desktop\dev\packive\backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "$backupDir\unified-editor_$timestamp.tsx"
Write-Host "BACKUP: unified-editor_$timestamp.tsx"

$lines = [System.IO.File]::ReadAllLines($file)
$originalCount = $lines.Length
$newLines = New-Object System.Collections.Generic.List[string]
$fix1 = $false; $fix2 = $false; $fix3 = $false; $fix4 = $false; $fix5 = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]

    # FIX 1: Replace selectedFont state
    if ($line -match "selectedFont.*useState" -and $line -match "Arial" -and -not $fix1) {
        $newLines.Add('  const [selectedFont, setSelectedFont] = useState("Inter");')
        $newLines.Add('  const [googleFonts, setGoogleFonts] = useState<string[]>(["Inter", "Noto Sans KR", "Noto Sans JP", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins"]);')
        $newLines.Add('  const [fontsLoaded, setFontsLoaded] = useState<Set<string>>(new Set());')
        $newLines.Add('')
        $newLines.Add('  useEffect(() => {')
        $newLines.Add('    fetch("https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAx3bN9fSS61y6FKewBaDZ4azs6W4XFnPk&sort=popularity")')
        $newLines.Add('      .then(r => r.json())')
        $newLines.Add('      .then(data => {')
        $newLines.Add('        if (data.items) {')
        $newLines.Add('          const names = data.items.slice(0, 200).map((f: any) => f.family);')
        $newLines.Add('          const priority = ["Inter", "Noto Sans KR", "Noto Sans JP", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins"];')
        $newLines.Add('          const sorted = [...priority, ...names.filter((n: string) => !priority.includes(n))];')
        $newLines.Add('          setGoogleFonts([...new Set(sorted)]);')
        $newLines.Add('        }')
        $newLines.Add('      }).catch(() => {});')
        $newLines.Add('  }, []);')
        $newLines.Add('')
        $newLines.Add('  const loadGoogleFont = useCallback((family: string) => {')
        $newLines.Add('    if (fontsLoaded.has(family)) return;')
        $newLines.Add('    const link = document.createElement("link");')
        $newLines.Add('    link.rel = "stylesheet";')
        $newLines.Add('    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700&display=swap`;')
        $newLines.Add('    document.head.appendChild(link);')
        $newLines.Add('    setFontsLoaded(prev => new Set([...prev, family]));')
        $newLines.Add('  }, [fontsLoaded]);')
        $newLines.Add('')
        $newLines.Add('  const detectFontForText = useCallback((text: string): string => {')
        $newLines.Add('    const koRegex = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;')
        $newLines.Add('    const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;')
        $newLines.Add('    if (koRegex.test(text)) return "Noto Sans KR";')
        $newLines.Add('    if (jpRegex.test(text)) return "Noto Sans JP";')
        $newLines.Add('    return "Inter";')
        $newLines.Add('  }, []);')
        $fix1 = $true
        Write-Host "Fix 1: Font state + Google Fonts + auto-detect"
        continue
    }

    # FIX 2: Replace addText
    if ($line -match "const addText = useCallback" -and -not $fix2) {
        $newLines.Add('  const addText = useCallback(async () => {')
        $newLines.Add('    const c = fcRef.current; if (!c) return;')
        $newLines.Add('    const F = fabricModRef.current; if (!F) return;')
        $newLines.Add('    const cx = c.getWidth() / 2, cy = c.getHeight() / 2;')
        $newLines.Add('    loadGoogleFont(selectedFont);')
        $newLines.Add('    const t = new F.IText("Text", {')
        $newLines.Add('      left: cx, top: cy, originX: "center", originY: "center",')
        $newLines.Add('      fontSize: Math.round(24 * scaleRef.current), fill: color, fontFamily: selectedFont,')
        $newLines.Add('    });')
        $newLines.Add('    t.on("changed", () => {')
        $newLines.Add('      const newFont = detectFontForText(t.text || "");')
        $newLines.Add('      if (newFont !== t.fontFamily) {')
        $newLines.Add('        loadGoogleFont(newFont);')
        $newLines.Add('        t.set({ fontFamily: newFont });')
        $newLines.Add('        setSelectedFont(newFont);')
        $newLines.Add('        c.requestRenderAll();')
        $newLines.Add('      }')
        $newLines.Add('    });')
        $newLines.Add('    c.add(t); c.setActiveObject(t); c.renderAll(); refreshLayers(); pushHistory();')
        # Skip old addText lines
        while ($i + 1 -lt $lines.Length) {
            $i++
            if ($lines[$i] -match "^\s*\}, \[color") {
                $newLines.Add('  }, [color, selectedFont, loadGoogleFont, detectFontForText, refreshLayers, pushHistory]);')
                break
            }
        }
        $fix2 = $true
        Write-Host "Fix 2: addText direct 24pt + auto-detect"
        continue
    }

    # FIX 3: Remove text popup
    if ($line -match "Text Popup" -and $line -match "{\*" -and -not $fix3) {
        while ($i + 1 -lt $lines.Length) {
            $i++
            if ($lines[$i] -match "Shape Popup") { $i--; break }
        }
        $fix3 = $true
        Write-Host "Fix 3: Removed text popup"
        continue
    }

    # FIX 4: Text toolbar button direct
    if ($line -match "label: .Text., action: .* setShowTextPanel" -and -not $fix4) {
        $newLines.Add('            { icon: "T", label: "Text", action: addText },')
        $fix4 = $true
        Write-Host "Fix 4: Text button calls addText directly"
        continue
    }

    # FIX 5: Font selector Google Fonts
    if ($line -match "selProps.fontFamily" -and $line -match "<select" -and -not $fix5) {
        $newLines.Add('                <select value={selProps.fontFamily} onChange={e => { const f = e.target.value; loadGoogleFont(f); updateProp("fontFamily", f); setSelectedFont(f); }} className="w-full border rounded px-1 py-0.5 text-xs">')
        $newLines.Add('                  {googleFonts.map(f => <option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}')
        $newLines.Add('                </select>')
        # Skip old select
        if ($line -match "</select>") {
            # single line - already consumed
        } else {
            while ($i + 1 -lt $lines.Length) {
                $i++
                if ($lines[$i] -match "</select>") { break }
            }
        }
        $fix5 = $true
        Write-Host "Fix 5: Google Fonts selector"
        continue
    }

    $newLines.Add($line)
}

[System.IO.File]::WriteAllLines($file, $newLines.ToArray())
$written = [System.IO.File]::ReadAllLines($file)
$safe = $true
foreach ($kw in @("export default function", "fcRef", "useEffect", "return (")) {
    $found = $false; foreach ($wl in $written) { if ($wl.Contains($kw)) { $found = $true; break } }
    if (-not $found) { Write-Host "MISSING: $kw"; $safe = $false }
}
if ($written.Length -lt $originalCount * 0.5) { $safe = $false }
if (-not $safe) { Copy-Item "$backupDir\unified-editor_$timestamp.tsx" $file; Write-Host "RESTORED!" }
else { Write-Host "SAFE: $($written.Length) lines (was $originalCount)" }

Write-Host "`n=== Verify ==="
for ($v = 0; $v -lt $written.Length; $v++) {
    if ($written[$v] -match "detectFontForText|loadGoogleFont|googleFonts.*useState|googleapis.*webfonts") {
        Write-Host "L$($v+1): $($written[$v].TrimStart().Substring(0, [Math]::Min(100, $written[$v].TrimStart().Length)))"
    }
}
