import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// 1. Update aiTab type to include 'history'
const oldTabType = `useState<'templates' | 'copy' | 'review' | 'layers'>('templates')`;
const newTabType = `useState<'templates' | 'copy' | 'review' | 'layers' | 'history'>('templates')`;
if (code.includes(oldTabType)) {
  code = code.replace(oldTabType, newTabType);
  changes++;
  console.log("1. Updated aiTab type to include history");
}

// 2. Add history tab button
const oldTabs = `{ key: 'layers', label: '📐 Layers' },
            ].map(tab =>`;
const newTabs = `{ key: 'layers', label: '📐 Layers' },
              { key: 'history', label: '⏱ History' },
            ].map(tab =>`;
if (code.includes(oldTabs)) {
  code = code.replace(oldTabs, newTabs);
  changes++;
  console.log("2. Added History tab button");
}

// 3. Add historyThumbs state
const layersListState = `const [layersList, setLayersList] = useState<{id:string;type:string;name:string;visible:boolean;locked:boolean}[]>([]);`;
if (code.includes(layersListState) && !code.includes('historyThumbs')) {
  code = code.replace(layersListState, layersListState + `
  const [historyThumbs, setHistoryThumbs] = useState<{idx:number;thumb:string;time:string}[]>([]);
  const [historyIdx, setHistoryIdx] = useState(0);`);
  changes++;
  console.log("3. Added historyThumbs state");
}

// 4. Update pushHistory to generate thumbnails
const oldPushHistory = `if (json === historyRef.current[historyIdxRef.current]) return;
          historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
          historyRef.current.push(json);
          if (historyRef.current.length > 50) historyRef.current.shift();
          historyIdxRef.current = historyRef.current.length - 1;`;

if (code.includes(oldPushHistory)) {
  const newPushHistory = `if (json === historyRef.current[historyIdxRef.current]) return;
          historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
          historyRef.current.push(json);
          if (historyRef.current.length > 50) historyRef.current.shift();
          historyIdxRef.current = historyRef.current.length - 1;
          // Generate thumbnail for history
          try {
            const thumbData = canvas.toDataURL({ format: 'png', multiplier: 0.15, quality: 0.5 });
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0') + ':' + now.getSeconds().toString().padStart(2,'0');
            setHistoryThumbs(prev => {
              const next = prev.slice(0, historyIdxRef.current);
              next.push({ idx: historyIdxRef.current, thumb: thumbData, time: timeStr });
              if (next.length > 50) next.shift();
              return next;
            });
            setHistoryIdx(historyIdxRef.current);
          } catch {}`;
  code = code.replace(oldPushHistory, newPushHistory);
  changes++;
  console.log("4. Updated pushHistory to generate thumbnails");
}

// 5. Add History tab panel before the closing of the right sidebar
// Find the layers tab content end pattern
const layersTabEnd = `{/* ── Layers Tab ── */}`;
if (code.includes(layersTabEnd) && !code.includes('History Tab')) {
  const historyTabUI = `{/* ── History Tab ── */}
            {aiTab === 'history' && (
              <div className="p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-gray-400 font-medium">History ({historyThumbs.length} states)</p>
                  <span className="text-[9px] text-blue-500 font-medium">Current: {historyIdx + 1}</span>
                </div>
                {historyThumbs.length === 0 && <p className="text-xs text-gray-400 mt-2">No history yet</p>}
                <div className="flex flex-col gap-1.5">
                  {[...historyThumbs].reverse().map((h, i) => (
                    <button key={h.idx} onClick={async () => {
                      const c = fcRef.current; if (!c) return;
                      historyIdxRef.current = h.idx;
                      loadingRef.current = true;
                      c.clear();
                      await c.loadFromJSON(JSON.parse(historyRef.current[h.idx]));
                      c.requestRenderAll();
                      setHistoryIdx(h.idx);
                      refreshLayers();
                      setTimeout(() => { loadingRef.current = false; }, 500);
                    }}
                    className={\`flex items-center gap-2 p-1.5 rounded-lg border transition \${
                      h.idx === historyIdx
                        ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }\`}>
                      <div className="w-16 h-12 rounded overflow-hidden border border-gray-100 bg-white flex-shrink-0">
                        <img src={h.thumb} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className={\`text-[10px] font-medium \${h.idx === historyIdx ? 'text-blue-600' : 'text-gray-600'}\`}>
                          State {h.idx + 1}
                        </span>
                        <span className="text-[9px] text-gray-400">{h.time}</span>
                        {h.idx === historyIdx && <span className="text-[8px] text-blue-500 mt-0.5">● Current</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            `;
  code = code.replace(layersTabEnd, historyTabUI + '\n            ' + layersTabEnd);
  changes++;
  console.log("5. Added History tab panel UI");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
