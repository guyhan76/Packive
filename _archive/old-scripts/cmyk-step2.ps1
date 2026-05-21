$file = "C:\Users\user\Desktop\dev\packive\src\components\editor\unified-editor.tsx"
$content = Get-Content $file -Raw -Encoding UTF8

# Fill/Stroke UI 교체 (line 1952-1957 영역)
$oldColorUI = '                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 flex items-center gap-2">Fill <input type="color" value={typeof selProps.fill === "string" ? selProps.fill : "#000000"} onChange={e => updateProp("fill", e.target.value)} className="w-6 h-6 border rounded cursor-pointer" /></label>
                      <label className="text-[10px] text-gray-500 flex items-center gap-2">Stroke <input type="color" value={selProps.stroke || "#000000"} onChange={e => updateProp("stroke", e.target.value)} className="w-6 h-6 border rounded cursor-pointer" />
                        <input type="number" value={selProps.strokeWidth} onChange={e => updateProp("strokeWidth", e.target.value)} className="w-12 border rounded px-1 py-0.5 text-xs" min="0" />
                      </label>
                    </div>'

$newColorUI = '                    <div className="space-y-2">
                      {/* Color Mode Toggle */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500 mr-1">Color</span>
                        <button onClick={() => setColorMode("rgb")} className={`px-2 py-0.5 text-[10px] font-medium rounded ${colorMode === "rgb" ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:bg-gray-100"}`}>RGB</button>
                        <button onClick={() => setColorMode("cmyk")} className={`px-2 py-0.5 text-[10px] font-medium rounded ${colorMode === "cmyk" ? "bg-orange-100 text-orange-700" : "text-gray-400 hover:bg-gray-100"}`}>CMYK</button>
                      </div>

                      {/* Fill */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-8">Fill</span>
                          <input type="color" value={typeof selProps.fill === "string" ? selProps.fill : "#000000"} onChange={e => updateProp("fill", e.target.value)} className="w-6 h-6 border rounded cursor-pointer" />
                          <span className="text-[9px] text-gray-400 font-mono">{selProps.fill}</span>
                        </div>
                        {colorMode === "cmyk" && selProps.fillCmyk && (
                          <div className="grid grid-cols-4 gap-1 pl-9">
                            {(["c","m","y","k"] as const).map(ch => (
                              <label key={ch} className="text-center">
                                <span className="text-[9px] font-bold" style={{color: ch==="c"?"#00bcd4":ch==="m"?"#e91e63":ch==="y"?"#ffc107":"#333"}}>{ch.toUpperCase()}</span>
                                <input type="number" min="0" max="100" value={selProps.fillCmyk[ch]} onChange={e => { const v = Math.max(0, Math.min(100, +e.target.value)); updateProp("fillCmyk", {...selProps.fillCmyk, [ch]: v}); }} className="w-full border rounded px-0.5 py-0.5 text-[10px] text-center" />
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stroke */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-8">Stroke</span>
                          <input type="color" value={selProps.stroke || "#000000"} onChange={e => updateProp("stroke", e.target.value)} className="w-6 h-6 border rounded cursor-pointer" />
                          <input type="number" value={selProps.strokeWidth} onChange={e => updateProp("strokeWidth", e.target.value)} className="w-10 border rounded px-1 py-0.5 text-[10px]" min="0" />
                        </div>
                        {colorMode === "cmyk" && selProps.strokeCmyk && (
                          <div className="grid grid-cols-4 gap-1 pl-9">
                            {(["c","m","y","k"] as const).map(ch => (
                              <label key={ch} className="text-center">
                                <span className="text-[9px] font-bold" style={{color: ch==="c"?"#00bcd4":ch==="m"?"#e91e63":ch==="y"?"#ffc107":"#333"}}>{ch.toUpperCase()}</span>
                                <input type="number" min="0" max="100" value={selProps.strokeCmyk[ch]} onChange={e => { const v = Math.max(0, Math.min(100, +e.target.value)); updateProp("strokeCmyk", {...selProps.strokeCmyk, [ch]: v}); }} className="w-full border rounded px-0.5 py-0.5 text-[10px] text-center" />
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>'

$content = $content.Replace($oldColorUI, $newColorUI)
Write-Host "UI 교체 완료" -ForegroundColor Green

Set-Content $file -Value $content -Encoding UTF8 -NoNewline
$v = Get-Content $file -Encoding UTF8
Write-Host "Total lines: $($v.Count)"
for ($i=0;$i -lt $v.Count;$i++) {
  if ($v[$i] -match 'Color Mode Toggle') { Write-Host "Color Mode Toggle: line $($i+1)" }
  if ($v[$i] -match 'setColorMode') { Write-Host "setColorMode: line $($i+1)" }
  if ($v[$i] -match 'fillCmyk\[ch\]') { Write-Host "CMYK Fill slider: line $($i+1)" }
  if ($v[$i] -match 'strokeCmyk\[ch\]') { Write-Host "CMYK Stroke slider: line $($i+1)" }
}
