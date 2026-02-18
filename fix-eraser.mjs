import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// 1. Add eraserMode state after drawMode state
const drawModeState = `const [drawMode, setDrawMode] = useState(false);`;
const eraserStateCode = `const [drawMode, setDrawMode] = useState(false);
  const [eraserMode, setEraserMode] = useState(false);
  const [eraserSize, setEraserSize] = useState(20);
  const eraserCursorRef = useRef<HTMLDivElement|null>(null);`;
if (!code.includes('eraserMode') && code.includes(drawModeState)) {
  code = code.replace(drawModeState, eraserStateCode);
  changes++;
  console.log("1. Added eraserMode/eraserSize state");
}

// 2. Replace old Eraser button (white paint) with real eraser mode toggle
const oldEraser = `<button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  if (c.freeDrawingBrush) c.freeDrawingBrush.color = '#FFFFFF';
                }} className="flex-1 py-0.5 text-[8px] bg-gray-100 text-gray-600 rounded hover:bg-gray-200">🧹 Eraser</button>`;
const newEraser = `<button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  c.isDrawingMode = false;
                  setEraserMode(em => !em);
                }} className={\`flex-1 py-0.5 text-[8px] rounded \${eraserMode ? 'bg-red-200 text-red-700 ring-1 ring-red-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}>🧹 Eraser</button>`;
if (code.includes(oldEraser)) {
  code = code.replace(oldEraser, newEraser);
  changes++;
  console.log("2. Replaced Eraser button with toggle");
}

// 3. Replace old Pen button to also disable eraser mode
const oldPen = `<button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  if (c.freeDrawingBrush) c.freeDrawingBrush.color = color;
                }} className="flex-1 py-0.5 text-[8px] bg-blue-50 text-blue-600 rounded hover:bg-blue-100">✏ Pen</button>`;
const newPen = `<button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  setEraserMode(false);
                  c.isDrawingMode = true;
                  if (c.freeDrawingBrush) c.freeDrawingBrush.color = color;
                }} className={\`flex-1 py-0.5 text-[8px] rounded \${!eraserMode ? 'bg-blue-200 text-blue-700 ring-1 ring-blue-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}\`}>✏ Pen</button>`;
if (code.includes(oldPen)) {
  code = code.replace(oldPen, newPen);
  changes++;
  console.log("3. Replaced Pen button with eraser-aware version");
}

// 4. Add eraser size slider and eraser cursor after the Undo Last Stroke button
const undoBtn = `}} className="w-full py-0.5 text-[8px] bg-red-50 text-red-500 rounded hover:bg-red-100 mt-1">Undo Last Stroke</button>`;
const eraserUI = `}} className="w-full py-0.5 text-[8px] bg-red-50 text-red-500 rounded hover:bg-red-100 mt-1">Undo Last Stroke</button>
              {eraserMode && (
                <div className="flex flex-col items-center gap-0.5 mt-1 bg-red-50 p-1 rounded">
                  <span className="text-[8px] text-red-400">Eraser Size</span>
                  <input type="range" min={5} max={60} value={eraserSize} onChange={e => setEraserSize(+e.target.value)} className="w-[80px] h-1 accent-red-400" />
                  <span className="text-[8px] text-red-300">{eraserSize}px</span>
                </div>
              )}`;
if (!code.includes('Eraser Size') && code.includes(undoBtn)) {
  code = code.replace(undoBtn, eraserUI);
  changes++;
  console.log("4. Added eraser size slider");
}

// 5. Add eraser cursor div and mouse event logic inside the canvas wrapper
// Find the ref={wrapperRef} div
const wrapperPattern = /ref=\{wrapperRef\}([^>]*?)>/;
const wrapperMatch = code.match(wrapperPattern);
if (wrapperMatch && !code.includes('eraserCursorRef.current')) {
  // Add onMouseMove and onMouseDown and onMouseLeave to the wrapper div
  const oldWrapper = wrapperMatch[0];
  const newWrapper = oldWrapper.replace('>', `
            onMouseMove={(ev) => {
              if (!eraserMode || !drawMode) return;
              const rect = (ev.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ev.clientX - rect.left;
              const y = ev.clientY - rect.top;
              if (eraserCursorRef.current) {
                eraserCursorRef.current.style.display = 'block';
                eraserCursorRef.current.style.left = (x - eraserSize/2) + 'px';
                eraserCursorRef.current.style.top = (y - eraserSize/2) + 'px';
                eraserCursorRef.current.style.width = eraserSize + 'px';
                eraserCursorRef.current.style.height = eraserSize + 'px';
              }
            }}
            onMouseDown={(ev) => {
              if (!eraserMode || !drawMode) return;
              const c = fcRef.current; if (!c) return;
              const rect = (ev.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ev.clientX - rect.left;
              const y = ev.clientY - rect.top;
              const pointer = c.getScenePoint(ev.nativeEvent);
              const half = eraserSize / 2;
              const paths = c.getObjects().filter((o: any) =>
                o.type === 'path' && !o._isBgImage && !o._isSafeZone && !o._isGuideLine && !o._isCropRect
              );
              const toRemove: any[] = [];
              for (const p of paths) {
                const bound = p.getBoundingRect();
                const cx = bound.left + bound.width / 2;
                const cy = bound.top + bound.height / 2;
                if (Math.abs(pointer.x - cx) < half + bound.width/2 && Math.abs(pointer.y - cy) < half + bound.height/2) {
                  toRemove.push(p);
                }
              }
              if (toRemove.length > 0) {
                toRemove.forEach(o => c.remove(o));
                c.requestRenderAll();
                refreshLayers();
              }
            }}
            onMouseLeave={() => {
              if (eraserCursorRef.current) eraserCursorRef.current.style.display = 'none';
            }}>`);
  code = code.replace(oldWrapper, newWrapper);
  changes++;
  console.log("5. Added eraser mouse events to wrapper");
  
  // Add eraser cursor div right after the wrapper opening tag
  const cursorDiv = `
              {/* Eraser cursor */}
              {eraserMode && drawMode && (
                <div ref={eraserCursorRef} className="pointer-events-none absolute rounded-full border-2 border-red-400 bg-red-100/30 z-50" style={{display:'none'}} />
              )}`;
  // Insert after the wrapper tag we just modified
  code = code.replace(newWrapper, newWrapper + cursorDiv);
  changes++;
  console.log("6. Added eraser cursor div");
}

// 7. When eraser mode is on and user drags mouse, continuously erase
// Add mousemove eraser logic - replace onMouseMove to also handle dragging
const dragEraseOld = `if (!eraserMode || !drawMode) return;
              const rect = (ev.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ev.clientX - rect.left;
              const y = ev.clientY - rect.top;
              if (eraserCursorRef.current) {`;
const dragEraseNew = `if (!eraserMode || !drawMode) return;
              const rect = (ev.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ev.clientX - rect.left;
              const y = ev.clientY - rect.top;
              // Continuous erase while mouse button held
              if (ev.buttons === 1) {
                const c = fcRef.current;
                if (c) {
                  const pointer = c.getScenePoint(ev.nativeEvent);
                  const half = eraserSize / 2;
                  const paths = c.getObjects().filter((o: any) =>
                    o.type === 'path' && !o._isBgImage && !o._isSafeZone && !o._isGuideLine && !o._isCropRect
                  );
                  const toRemove: any[] = [];
                  for (const p of paths) {
                    const bound = p.getBoundingRect();
                    const cx = bound.left + bound.width / 2;
                    const cy = bound.top + bound.height / 2;
                    if (Math.abs(pointer.x - cx) < half + bound.width/2 && Math.abs(pointer.y - cy) < half + bound.height/2) {
                      toRemove.push(p);
                    }
                  }
                  if (toRemove.length > 0) {
                    toRemove.forEach(o => c.remove(o));
                    c.requestRenderAll();
                    refreshLayers();
                  }
                }
              }
              if (eraserCursorRef.current) {`;
if (code.includes(dragEraseOld)) {
  code = code.replace(dragEraseOld, dragEraseNew);
  changes++;
  console.log("7. Added continuous drag-erase on mousemove");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes needed.");
}
