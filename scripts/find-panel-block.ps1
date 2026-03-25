$file = "src\components\editor\unified-editor.tsx"
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item $file "backups\unified-editor_pre-overlay_$ts.tsx"
Write-Host "[Backup] Done" -ForegroundColor Green

$lines = Get-Content $file -Encoding UTF8
$total = $lines.Count
Write-Host "[Info] Total lines: $total"

$startIdx = -1; $endIdx = -1
for ($i = 0; $i -lt $total; $i++) {
    if ($lines[$i] -match 'Panel Map \(generatePanelMap\)') { $startIdx = $i }
    if ($lines[$i] -match 'PanelMap. Skipped - dimensions not set') { $endIdx = $i }
}
Write-Host "[Find] PanelMap block: start=$($startIdx+1) end=$($endIdx+1)"

$genIdx = -1
for ($i = 0; $i -lt $total; $i++) {
    if ($lines[$i] -match 'Draw panel overlay after dieline loaded') { $genIdx = $i }
}
Write-Host "[Find] Generate overlay comment: line=$($genIdx+1)"

if ($startIdx -ge 0) {
    Write-Host "=== PanelMap context ===" -ForegroundColor Cyan
    for ($i = [Math]::Max(0,$startIdx-1); $i -le [Math]::Min($total-1,$endIdx+2); $i++) {
        Write-Host ("{0,5}: {1}" -f ($i+1), $lines[$i].TrimEnd())
    }
}
