$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Fill CMYK: value → defaultValue + onBlur
$oldFill = '<input type="number" min="0" max="100" value={selProps.fillCmyk[ch]} onChange={e => { const v = Math.max(0, Math.min(100, +e.target.value)); updateProp("fillCmyk", {...selProps.fillCmyk, [ch]: v}); }} className="w-full border rounded px-0.5 py-0.5 text-[10px] text-center" />'

$newFill = '<input type="number" min="0" max="100" defaultValue={selProps.fillCmyk[ch]} key={`fc-${ch}-${selProps.fill}`} onBlur={e => { const v = Math.max(0, Math.min(100, parseInt(e.target.value) || 0)); updateProp("fillCmyk", {...selProps.fillCmyk, [ch]: v}); }} onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} className="w-full border rounded px-0.5 py-0.5 text-[10px] text-center" />'

$content = $content.Replace($oldFill, $newFill)
Write-Host "FIX 1: Fill CMYK input (defaultValue + onBlur)" -ForegroundColor Green

# Stroke CMYK: value → defaultValue + onBlur
$oldStroke = '<input type="number" min="0" max="100" value={selProps.strokeCmyk[ch]} onChange={e => { const v = Math.max(0, Math.min(100, +e.target.value)); updateProp("strokeCmyk", {...selProps.strokeCmyk, [ch]: v}); }} className="w-full border rounded px-0.5 py-0.5 text-[10px] text-center" />'

$newStroke = '<input type="number" min="0" max="100" defaultValue={selProps.strokeCmyk[ch]} key={`sc-${ch}-${selProps.stroke}`} onBlur={e => { const v = Math.max(0, Math.min(100, parseInt(e.target.value) || 0)); updateProp("strokeCmyk", {...selProps.strokeCmyk, [ch]: v}); }} onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} className="w-full border rounded px-0.5 py-0.5 text-[10px] text-center" />'

$content = $content.Replace($oldStroke, $newStroke)
Write-Host "FIX 2: Stroke CMYK input (defaultValue + onBlur)" -ForegroundColor Green

Set-Content $file -Value $content -Encoding UTF8 -NoNewline
$v = Get-Content $file -Encoding UTF8
Write-Host "Total lines: $($v.Count)"
for ($i=0;$i -lt $v.Count;$i++) {
  if ($v[$i] -match 'defaultValue=\{selProps\.(fill|stroke)Cmyk') { Write-Host "line $($i+1): $($v[$i].TrimStart().Substring(0, [Math]::Min(80, $v[$i].TrimStart().Length)))..." }
}
