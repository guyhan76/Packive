import { readFileSync, writeFileSync } from 'fs';
let lines = readFileSync('src/components/editor/panel-editor.tsx', 'utf8').split('\n');

// 1. Add Layers tab button after review tab (line 1839)
let tabInserted = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("key: 'review', label: '✅ Review'")) {
    lines.splice(i + 1, 0, "              { key: 'layers', label: '📐 Layers' },");
    tabInserted = true;
    console.log('1. Layers tab button inserted at line ' + (i + 2));
    break;
  }
}

// 2. Find the closing of the last tab content (review tab) and insert Layers tab content before </div></aside>
// Look for the pattern: review tab closing )} then </div> then </aside>
let contentInserted = false;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === '</aside>' && i > 0 && lines[i-1].trim() === '</div>') {
    // Find the review tab closing )} above
    const layersContent = [
      '',
      '            {/* ── Layers Tab ── */}',
      "            {aiTab === 'layers' && (",
      '              <div className="space-y-2">',
      '                <div className="flex gap-1 mb-2">',
      "                  <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.bringObjectForward(o); c.renderAll(); refreshLayers(); } }}",
      '                    className="flex-1 py-1.5 text-[10px] bg-gray-100 hover:bg-gray-200 rounded font-medium" title="Bring Forward">▲ Forward</button>',
      "                  <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.sendObjectBackwards(o); c.renderAll(); refreshLayers(); } }}",
      '                    className="flex-1 py-1.5 text-[10px] bg-gray-100 hover:bg-gray-200 rounded font-medium" title="Send Backward">▼ Backward</button>',
      '                </div>',
      '                <div className="flex gap-1 mb-3">',
      "                  <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.bringObjectToFront(o); c.renderAll(); refreshLayers(); } }}",
      '                    className="flex-1 py-1.5 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-medium" title="Bring to Front">⬆ Top</button>',
      "                  <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.sendObjectToBack(o); c.renderAll(); refreshLayers(); } }}",
      '                    className="flex-1 py-1.5 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-medium" title="Send to Back">⬇ Bottom</button>',
      '                </div>',
      '                <hr className="border-gray-200" />',
      '                <p className="text-[10px] text-gray-400 font-medium mt-1">Objects ({layersList.length})</p>',
      '                {layersList.length === 0 && <p className="text-xs text-gray-400 mt-2">No objects on canvas</p>}',
      '                {layersList.map((layer, idx) => (',
      "                  <div key={layer.id + '_' + idx}",
      '                    onClick={() => {',
      '                      const c = fcRef.current; if (!c) return;',
      "                      const objs = c.getObjects().filter((o:any) => o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine);",
      '                      const realIdx = objs.length - 1 - idx;',
      '                      if (objs[realIdx]) { c.setActiveObject(objs[realIdx]); c.renderAll(); }',
      '                    }}',
      '                    className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-200 transition">',
      "                    <span className=\"text-xs\">{layer.type === 'i-text' || layer.type === 'textbox' ? '📝' : layer.type === 'image' ? '🖼' : '🔷'}</span>",
      '                    <span className="flex-1 text-[11px] text-gray-700 truncate">{layer.name}</span>',
      '                    <button onClick={(e) => {',
      '                      e.stopPropagation();',
      '                      const c = fcRef.current; if (!c) return;',
      "                      const objs = c.getObjects().filter((o:any) => o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine);",
      '                      const realIdx = objs.length - 1 - idx;',
      "                      if (objs[realIdx]) { objs[realIdx].visible = !objs[realIdx].visible; c.renderAll(); refreshLayers(); }",
      '                    }} className="text-[10px] text-gray-400 hover:text-gray-700" title="Toggle visibility">',
      "                      {layer.visible ? '👁' : '🚫'}",
      '                    </button>',
      '                  </div>',
      '                ))}',
      '              </div>',
      '            )}',
    ];
    // Insert before </div></aside>
    lines.splice(i - 1, 0, ...layersContent);
    contentInserted = true;
    console.log('2. Layers tab content inserted before line ' + i);
    break;
  }
}

// 3. Also add refreshLayers to object:modified if missing
let code = lines.join('\n');
if (code.includes("canvas.on('object:modified', () => { if (!loadingRef.current) pushHistory(); });")) {
  code = code.replace(
    "canvas.on('object:modified', () => { if (!loadingRef.current) pushHistory(); });",
    "canvas.on('object:modified', () => { if (!loadingRef.current) pushHistory(); refreshLayers(); });"
  );
  console.log('3. Added refreshLayers to object:modified');
}

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! tabInserted=' + tabInserted + ' contentInserted=' + contentInserted);
