$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$lines = Get-Content $file -Encoding UTF8

Write-Host "=== Fill CMYK input 현재 코드 ===" -ForegroundColor Cyan
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'fillCmyk\[ch\]') {
        Write-Host "$($i+1): $($lines[$i].TrimStart())"
    }
}

Write-Host "`n=== Stroke CMYK input 현재 코드 ===" -ForegroundColor Cyan
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match 'strokeCmyk\[ch\]') {
        Write-Host "$($i+1): $($lines[$i].TrimStart())"
    }
}

Write-Host "`nTotal lines: $($lines.Count)"
