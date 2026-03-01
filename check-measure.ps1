$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$lines = Get-Content $file -Encoding UTF8

Write-Host "=== Measure 관련 코드 ===" -ForegroundColor Cyan
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'Measure|measure|_isMeasure|ruler|Ruler') {
        Write-Host "$($i+1): $($lines[$i].TrimStart())"
    }
}

Write-Host "`n=== Measure 버튼 JSX ===" -ForegroundColor Cyan
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'Measure') {
        $start = [Math]::Max(0, $i - 2)
        $end = [Math]::Min($lines.Count - 1, $i + 2)
        for ($j = $start; $j -le $end; $j++) {
            Write-Host "$($j+1): $($lines[$j].TrimStart())"
        }
        Write-Host "---"
    }
}

Write-Host "`n=== Measure 기능 전체 (클릭/드래그 핸들러) ===" -ForegroundColor Cyan
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'measureMode|isMeasuring|measureStart|measureEnd|measureLine') {
        Write-Host "$($i+1): $($lines[$i].TrimStart())"
    }
}

Write-Host "`n=== 줄자 state/ref ===" -ForegroundColor Cyan
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'measureMode|measureStart|measureEnd|measureLine|measureLabel|_isMeasure') {
        Write-Host "$($i+1): $($lines[$i].TrimStart())"
    }
}

Write-Host "`nTotal lines: $($lines.Count)"
