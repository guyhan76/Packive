$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# FIX: 캔버스 초기화 시 selProps 업데이트 이벤트도 함께 등록
$oldSelEvents = '      canvas.on("selection:created", () => refreshLayers());
      canvas.on("selection:updated", () => refreshLayers());
      canvas.on("selection:cleared", () => refreshLayers());'

$newSelEvents = '      canvas.on("selection:created", () => { refreshLayers(); setSelProps(getSelectedProps()); });
      canvas.on("selection:updated", () => { refreshLayers(); setSelProps(getSelectedProps()); });
      canvas.on("selection:cleared", () => { refreshLayers(); setSelProps(null); });
      canvas.on("object:modified", () => { setSelProps(getSelectedProps()); });
      canvas.on("object:scaling", () => { setSelProps(getSelectedProps()); });
      canvas.on("object:moving", () => { setSelProps(getSelectedProps()); });
      canvas.on("object:rotating", () => { setSelProps(getSelectedProps()); });'

$content = $content.Replace($oldSelEvents, $newSelEvents)
Write-Host "FIX: 캔버스 초기화에 selProps 이벤트 추가" -ForegroundColor Green

Set-Content $file -Value $content -Encoding UTF8 -NoNewline
$v = Get-Content $file -Encoding UTF8
Write-Host "Total lines: $($v.Count)"
for ($i = 955; $i -lt [System.Math]::Min(970, $v.Count); $i++) {
    Write-Host "$($i+1): $($v[$i].TrimStart())"
}
