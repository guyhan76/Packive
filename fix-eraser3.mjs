import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// 1. Change Eraser button: instead of disabling drawingMode, keep it on with a special brush
const oldEraserBtn = `<button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  c.isDrawingMode = false;
                  setEraserMode(em => !em);
                }} className={\`flex-1 py-0.5 text-[8px] rounded \${eraserMode ? 'bg-red-200 text-red-700 ring-1 ring-red-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}>🧹 Eraser</button>`;

const newEraserBtn = `<button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  const newEM = !eraserMode;
                  setEraserMode(newEM);
                  if (newEM) {
                    c.isDrawingMode = true;
                    import('fabric').then(F => {
                      const brush = new F.PencilBrush(c);
                      brush.color = 'rgba(0,0,0,1)';
                      brush.width = eraserSize;
                      c.freeDrawingBrush = brush;
                    });
                  } else {
                    c.isDrawingMode = true;
                    import('fabric').then(F => {
                      const brush = new F.PencilBrush(c);
                      brush.color = color;
                      brush.width = brushSize;
                      c.freeDrawingBrush = brush;
                    });
                  }
                }} className={\`flex-1 py-0.5 text-[8px] rounded \${eraserMode ? 'bg-red-200 text-red-700 ring-1 ring-red-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}>🧹 Eraser</button>`;

if (code.includes(oldEraserBtn)) {
  code = code.replace(oldEraserBtn, newEraserBtn);
  changes++;
  console.log("1. Updated Eraser button to use drawing mode");
}

// 2. Change Pen button to properly restore pen mode
const oldPenBtn = `<button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  setEraserMode(false);
                  c.isDrawingMode = true;
                  if (c.freeDrawingBrush) c.freeDrawingBrush.color = color;
                }} className={\`flex-1 py-0.5 text-[8px] rounded \${!eraserMode ? 'bg-blue-200 text-blue-700 ring-1 ring-blue-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}\`}>✏ Pen</button>`;

const newPenBtn = `<button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  setEraserMode(false);
                  c.isDrawingMode = true;
                  import('fabric').then(F => {
                    const brush = new F.PencilBrush(c);
                    brush.color = color;
                    brush.width = brushSize;
                    c.freeDrawingBrush = brush;
                  });
                }} className={\`flex-1 py-0.5 text-[8px] rounded \${!eraserMode ? 'bg-blue-200 text-blue-700 ring-1 ring-blue-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}\`}>✏ Pen</button>`;

if (code.includes(oldPenBtn)) {
  code = code.replace(oldPenBtn, newPenBtn);
  changes++;
  console.log("2. Updated Pen button");
}

// 3. Add path:created event handler to convert eraser strokes into actual erasure
// Find the boot() function where canvas events are set up - after "fcRef.current = canvas;"
// We need to add a 'path:created' listener that checks if eraserMode is on,
// and if so, removes the drawn path and instead erases intersecting paths

const pathCreatedHandler = `
      // Eraser: on path:created, if eraser mode, remove drawn eraser path and clip intersecting paths
      canvas.on('path:created', (opt: any) => {
        const eraserOn = document.querySelector('[data-eraser-active]');
        if (!eraserOn) return;
        const eraserPath = opt.path;
        if (!eraserPath || !eraserPath._isEraserStroke) return;
        
        canvas.remove(eraserPath);
        
        // Get eraser path bounding box
        const eraserBound = eraserPath.getBoundingRect();
        const eLeft = eraserBound.left;
        const eTop = eraserBound.top;
        const eRight = eLeft + eraserBound.width;
        const eBottom = eTop + eraserBound.height;
        const eraserW = eraserPath.strokeWidth || 20;
        
        // Find all drawn paths that intersect with eraser
        const allPaths = canvas.getObjects().filter((o: any) => 
          o.type === 'path' && !o._isBgImage && !o._isSafeZone && !o._isGuideLine && !o._isCropRect && !o._isEraserStroke
        );
        
        const toRemove: any[] = [];
        for (const p of allPaths) {
          const pBound = p.getBoundingRect();
          const pLeft = pBound.left;
          const pTop = pBound.top;
          const pRight = pLeft + pBound.width;
          const pBottom = pTop + pBound.height;
          
          // Check bounding box overlap
          if (eLeft < pRight && eRight > pLeft && eTop < pBottom && eBottom > pTop) {
            toRemove.push(p);
          }
        }
        
        if (toRemove.length > 0) {
          toRemove.forEach(o => canvas.remove(o));
          canvas.requestRenderAll();
        }
      });`;

// Actually, a better approach: use globalCompositeOperation on the eraser strokes
// But Fabric.js doesn't natively support per-object composite operations well.
// 
// Best practical approach: eraser draws invisible strokes, and on path:created,
// we split/remove parts of existing paths that overlap.
// 
// However, the SIMPLEST effective approach is:
// When eraser mode is active, instead of free drawing, we track mouse movement
// and continuously check which path SEGMENTS are under the cursor, removing just
// those segments by splitting the path.
//
// For now, let's use the approach where eraser strokes are drawn with 
// destination-out on a temporary overlay canvas, then the result is flattened.
//
// Actually the most practical approach for Fabric.js:
// Use clipPath on each drawn path to "cut out" the eraser area.

// Let's go with a simpler but effective approach:
// The eraser draws with the BACKGROUND COLOR and we mark eraser strokes specially.
// Then the wrapper mouse events handle the visual cursor.

// REVISED APPROACH: Remove wrapper mouse events for eraser (they cause the "delete whole path" problem)
// Instead, let the eraser just draw with background color matching canvas background.

// 4. Remove the wrapper onMouseMove/onMouseDown eraser logic that deletes whole paths
const oldWrapperMouseMove = `onMouseMove={(ev) => {
              if (!eraserMode || !drawMode) return;
              const rect = (ev.currentTarget as HTMLDivElement).getBoundingClientRect();
              const x = ev.clientX - rect.left;
              const y = ev.clientY - rect.top;
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
            }}`;

const newWrapperMouse = `onMouseMove={(ev) => {
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
            onMouseLeave={() => {
              if (eraserCursorRef.current) eraserCursorRef.current.style.display = 'none';
            }}`;

if (code.includes(oldWrapperMouseMove)) {
  code = code.replace(oldWrapperMouseMove, newWrapperMouse);
  changes++;
  console.log("3. Removed whole-path-delete logic from wrapper, kept cursor only");
}

// 4. Update eraser size slider to also update brush width
const oldEraserSlider = `<input type="range" min={5} max={60} value={eraserSize} onChange={e => setEraserSize(+e.target.value)} className="w-[80px] h-1 accent-red-400" />`;
const newEraserSlider = `<input type="range" min={5} max={60} value={eraserSize} onChange={e => {
                    const s = +e.target.value;
                    setEraserSize(s);
                    const c = fcRef.current;
                    if (c && c.freeDrawingBrush && eraserMode) c.freeDrawingBrush.width = s;
                  }} className="w-[80px] h-1 accent-red-400" />`;

if (code.includes(oldEraserSlider)) {
  code = code.replace(oldEraserSlider, newEraserSlider);
  changes++;
  console.log("4. Updated eraser size slider to sync with brush width");
}

// 5. Make eraser brush use canvas background color (white) so it looks like erasing
// The eraser button already sets brush.color = 'rgba(0,0,0,1)' - change to white
const oldEraserColor = `brush.color = 'rgba(0,0,0,1)';
                      brush.width = eraserSize;`;
const newEraserColor = `brush.color = '#FFFFFF';
                      brush.width = eraserSize;
                      (brush as any)._isEraser = true;`;

if (code.includes(oldEraserColor)) {
  code = code.replace(oldEraserColor, newEraserColor);
  changes++;
  console.log("5. Changed eraser brush to white color");
}

// 6. Mark eraser strokes so they can be identified and excluded from export if needed
// Add path:created handler after canvas is created
const canvasCreated = `fcRef.current = canvas;`;
const canvasCreatedWithEraser = `fcRef.current = canvas;

      // Mark eraser-drawn paths
      canvas.on('path:created', (opt: any) => {
        if (opt.path && fcRef.current?.freeDrawingBrush && (fcRef.current.freeDrawingBrush as any)._isEraser) {
          opt.path._isEraserStroke = true;
          opt.path.set({ globalCompositeOperation: 'destination-out' });
          canvas.requestRenderAll();
        }
      });`;

if (!code.includes('_isEraserStroke') && code.includes(canvasCreated)) {
  code = code.replace(canvasCreated, canvasCreatedWithEraser);
  changes++;
  console.log("6. Added path:created handler to apply destination-out to eraser strokes");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
