$file = "src\components\editor\unified-editor.tsx"
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "backups\unified-editor_pre-safe-fix_$ts.tsx"
Write-Host "[Backup] Done" -ForegroundColor Green

$lines = Get-Content $file -Encoding UTF8
Write-Host "Original: $($lines.Count) lines"

# PART A: Replace lines 1999-2057 (0-indexed 1998-2056) with data-only block
# Keep line 2058 (0-indexed 2057) as is
$partA = @(
  "// -- Panel Map Data (Phase 5-1) - data only, no canvas overlay --",
  "let _pmBox = selectedBoxCode;",
  "if (_pmBox) _pmBox = _pmBox.replace(/^(FEFCO|ECMA)\s+/i, (m: string, p1: string) => p1 + String.fromCharCode(45));",
  "const _pmL = dimLength, _pmW = dimWidth, _pmD = dimHeight;",
  "if (_pmL > 0 && _pmW > 0 && _pmD > 0 && _pmBox) {",
  "  const pm = generatePanelMap(_pmBox, _pmL, _pmW, _pmD);",
  "  if (pm) {",
  "    console.log(""[PanelMap] Generated:"", pm.boxType, pm.panels.length, ""panels"");",
  "  } else {",
  "    console.log(""[PanelMap] Unknown box type:"", _pmBox);",
  "  }",
  "} else {",
  "  console.log(""[PanelMap] Skipped - dims:"", _pmL, _pmW, _pmD, ""box:"", _pmBox);",
  "}"
)

# PART B: Replace lines 2706-2746 (0-indexed 2705-2745) with data-only block
$partB = @(
  "                        // -- Panel Map Data after Generate (Phase 5-1) --",
  "                        {",
  "                          let _gBox = selectedBoxCode;",
  "                          if (_gBox) _gBox = _gBox.replace(/^(FEFCO|ECMA)\s+/i, (m: string, p1: string) => p1 + String.fromCharCode(45));",
  "                          if (dimLength > 0 && dimWidth > 0 && dimHeight > 0 && _gBox) {",
  "                            const pm = generatePanelMap(_gBox, dimLength, dimWidth, dimHeight);",
  "                            if (pm) console.log(""[PanelMap-Gen]"", pm.panels.length, ""panels"");",
  "                          }",
  "                        }"
)

# Build output: before A + A + between + B + after
$before = $lines[0..1997]
$between = $lines[2057..2704]
$after = $lines[2745..($lines.Count-1)]

$out = @()
$out += $before
$out += $partA
$out += $between
$out += $partB
$out += $after

$out | Set-Content $file -Encoding UTF8
$v = Get-Content $file -Encoding UTF8
Write-Host "[Done] $($v.Count) lines (was $($lines.Count))" -ForegroundColor Green

# Quick checks
$hasDataOnly = ($v | Select-String "data only, no canvas overlay").Count
$hasGenData = ($v | Select-String "PanelMap-Gen").Count
$hasRect = ($v | Select-String "new F.Rect\(" | Where-Object { $_.Line -match "_isPanelOverlay" }).Count
$hasRect2 = ($v | Select-String "new F2.Rect\(" | Where-Object { $_.Line -match "roleColors" }).Count
$hasHandler = ($v | Select-String "handler = async").Count
$hasCtrlC = ($v | Select-String "key===.c.").Count
Write-Host "  data-only marker: $hasDataOnly" -ForegroundColor $(if($hasDataOnly -gt 0){"Green"}else{"Red"})
Write-Host "  PanelMap-Gen: $hasGenData" -ForegroundColor $(if($hasGenData -gt 0){"Green"}else{"Red"})
Write-Host "  overlay Rect removed: $hasRect" -ForegroundColor $(if($hasRect -eq 0){"Green"}else{"Red"})
Write-Host "  overlay Rect2 removed: $hasRect2" -ForegroundColor $(if($hasRect2 -eq 0){"Green"}else{"Red"})
Write-Host "  keyboard handler: $hasHandler" -ForegroundColor $(if($hasHandler -gt 0){"Green"}else{"Red"})
Write-Host "  Ctrl+C: $hasCtrlC" -ForegroundColor $(if($hasCtrlC -gt 0){"Green"}else{"Red"})
