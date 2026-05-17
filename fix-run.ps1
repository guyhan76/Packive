$f = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$lines = Get-Content $f -Encoding UTF8
$startReplace = 1692
$endReplace = 1889

$newBlockText = Get-Content "C:\Users\user\Desktop\dev\packive\fix-block.txt" -Encoding UTF8

$newLines = $lines[0..($startReplace-1)] + $newBlockText + $lines[($endReplace)..($lines.Length-1)]
[System.IO.File]::WriteAllLines($f, $newLines, [System.Text.Encoding]::UTF8)

$ch = Get-Content $f -Encoding UTF8
Write-Host "Lines: $($ch.Length)"
Write-Host "DONE - npm run dev"