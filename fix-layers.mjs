import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/editor/panel-editor.tsx', 'utf8');
let count = 0;

// 1. Add 'layers' to aiTab type — find the tab buttons array and add Layers tab
const oldTabs = `{ key: 'review', label: '✅ Review' },
            ].map(tab =>`;
const newTabs = `{ key: 'review', label: '✅ Review' },
              { key: 'layers', label: '📐 Layers' },
            ].map(tab =>`;
if (code.includes(oldTabs)) {
  code = code.replace(oldTabs, newTabs);
  count++;
  console.log('1. Added Layers tab button');
}

// 2. Add layers state for tracking canvas objects
const stateAnchor = `const [aiTab, setAiTab] = useState`;
if (code.includes(stateAnchor)) {
  const idx = code.indexOf(stateAnchor);
  const lineEnd = code.indexOf('\n', idx);
  const afterLine = code.substring(lineEnd);
  // Check if layersList already exists
  if (!code.includes('layersList')) {
    code = code.substring(0, lineEnd) + '\n  const [layersList, setLayersList] = useState<{id:string;type:string;name:string;visible:boolean}[]>([]);' + afterLine;
    count++;
    console.log('2. Added layersList state');
  }
}

// 3. Add refreshLayers function after layersList state
const refreshAnchor = 'const [layersList, setLayersList]';
if (code.includes(refreshAnchor)) {
  const idx = code.indexOf(refreshAnchor);
  const lineEnd = code.indexOf('\n', idx);
  if (!code.includes('refreshLayers')) {
    const fn = `
  const refreshLayers = useCallback(() => {
    const c = fcRef.current; if (!c) return;
    const objs = c.getObjects().filter((o:any) => o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine);
    const list = objs.map((o:any, i:number) => ({
      id: o.__id || ('obj_' + i),
      type: o.type || 'object',
      name: o.text ? (o.text.substring(0, 20) + (o.text.length > 20 ? '...' : '')) : (o.type === 'image' ? 'Image' : o.type || 'Shape'),
      visible: o.visible !== false,
    })).reverse();
    setLayersList(list);
  }, []);`;
    code = code.substring(0, lineEnd + 1) + fn + code.substring(lineEnd + 1);
    count++;
    console.log('3. Added refreshLayers function');
  }
}

// 4. Add layer refresh calls to canvas events — find 'object:modified', pushHistory
// We'll add refreshLayers calls after pushHistory in the event handlers
const modifiedAnchor = "canvas.on('object:modified'";
if (code.includes(modifiedAnchor) && code.includes('refreshLayers')) {
  // Add after each canvas event listener
  code = code.replace(
    "canvas.on('object:modified', () => { if (!loadingRef.current) pushHistory(); });",
    "canvas.on('object:modified', () => { if (!loadingRef.current) pushHistory(); refreshLayers(); });"
  );
  code = code.replace(
    "canvas.on('object:added', () => { if (!loadingRef.current) pushHistory(); });",
    "canvas.on('object:added', () => { if (!loadingRef.current) pushHistory(); refreshLayers(); });"
  );
  code = code.replace(
    "canvas.on('object:removed', () => { if (!loadingRef.current) pushHistory(); });",
    "canvas.on('object:removed', () => { if (!loadingRef.current) pushHistory(); refreshLayers(); });"
  );
  count++;
  console.log('4. Added refreshLayers to canvas events');
}

// 5. Add Layers tab content — find the review tab closing and add before </div> of tab content
const layersTabContent = `
            {/* ── Layers Tab ── */}
            {aiTab === 'layers' && (
              <div className="space-y-2">
                <div className="flex gap-1 mb-2">
                  <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.bringObjectForward(o); c.renderAll(); refreshLayers(); } }}
                    className="flex-1 py-1.5 text-[10px] bg-gray-100 hover:bg-gray-200 rounded font-medium" title="Bring Forward">▲ Forward</button>
                  <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.sendObjectBackwards(o); c.renderAll(); refreshLayers(); } }}
                    className="flex-1 py-1.5 text-[10px] bg-gray-100 hover:bg-gray-200 rounded font-medium" title="Send Backward">▼ Backward</button>
                </div>
                <div className="flex gap-1 mb-3">
                  <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.bringObjectToFront(o); c.renderAll(); refreshLayers(); } }}
                    className="flex-1 py-1.5 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-medium" title="Bring to Front">⬆ Top</button>
                  <button onClick={() => { const c = fcRef.current; if (!c) return; const o = c.getActiveObject(); if (o) { c.sendObjectToBack(o); c.renderAll(); refreshLayers(); } }}
                    className="flex-1 py-1.5 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-medium" title="Send to Back">⬇ Bottom</button>
                </div>
                <hr className="border-gray-200" />
                <p className="text-[10px] text-gray-400 font-medium mt-1">Objects ({layersList.length})</p>
                {layersList.length === 0 && <p className="text-xs text-gray-400 mt-2">No objects on canvas</p>}
                {layersList.map((layer, idx) => (
                  <div key={layer.id + idx}
                    onClick={() => {
                      const c = fcRef.current; if (!c) return;
                      const objs = c.getObjects().filter((o:any) => o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine);
                      const realIdx = objs.length - 1 - idx;
                      if (objs[realIdx]) { c.setActiveObject(objs[realIdx]); c.renderAll(); }
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-blue-50 border border-transparent hover:border-blue-200 transition">
                    <span className="text-xs">{layer.type === 'i-text' || layer.type === 'textbox' ? '📝' : layer.type === 'image' ? '🖼' : '🔷'}</span>
                    <span className="flex-1 text-[11px] text-gray-700 truncate">{layer.name}</span>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      const c = fcRef.current; if (!c) return;
                      const objs = c.getObjects().filter((o:any) => o.selectable !== false && !o._isBgRect && !o._isSafeZone && !o._isGuideLine);
                      const realIdx = objs.length - 1 - idx;
                      if (objs[realIdx]) { objs[realIdx].visible = !objs[realIdx].visible; c.renderAll(); refreshLayers(); }
                    }} className="text-[10px] text-gray-400 hover:text-gray-700" title="Toggle visibility">
                      {layer.visible ? '👁' : '🚫'}
                    </button>
                  </div>
                ))}
              </div>
            )}`;

// Insert before the closing of tab content div — find the last tab's closing
const reviewClose = `            )}
          </div>
        </aside>`;
if (code.includes(reviewClose)) {
  code = code.replace(reviewClose, `            )}
${layersTabContent}
          </div>
        </aside>`);
  count++;
  console.log('5. Added Layers tab content');
}

// 6. Add initial refreshLayers call after canvas setup
if (code.includes('refreshLayers') && !code.includes('// Initial layer refresh')) {
  const bootEnd = "canvas.on('object:removed'";
  const bootEndIdx = code.indexOf(bootEnd);
  if (bootEndIdx > -1) {
    const lineEnd = code.indexOf('\n', bootEndIdx);
    code = code.substring(0, lineEnd + 1) + '      // Initial layer refresh\n      setTimeout(() => refreshLayers(), 500);\n' + code.substring(lineEnd + 1);
    count++;
    console.log('6. Added initial refreshLayers call');
  }
}

writeFileSync('src/components/editor/panel-editor.tsx', code, 'utf8');
console.log('Done! Total changes: ' + count);
