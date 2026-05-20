import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let code = readFileSync(f, "utf8");
let changes = 0;

// 1. Fix Moon shape - use two separate arcs instead of compound path
const oldMoon = `const addMoon = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 40 0 A 50 50 0 1 0 40 100 A 35 35 0 1 1 40 0 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);`;

const newMoon = `const addMoon = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    // Crescent moon using a single non-overlapping path
    const pts: string[] = [];
    // Outer arc (full circle left side)
    for (let i = -90; i <= 270; i += 5) {
      const rad = (i * Math.PI) / 180;
      const x = 50 + 45 * Math.cos(rad);
      const y = 50 + 45 * Math.sin(rad);
      pts.push((i === -90 ? 'M' : 'L') + ' ' + x.toFixed(1) + ' ' + y.toFixed(1));
    }
    // Inner arc (cutout, reverse direction)
    for (let i = 270; i >= -90; i -= 5) {
      const rad = (i * Math.PI) / 180;
      const x = 60 + 32 * Math.cos(rad);
      const y = 50 + 40 * Math.sin(rad);
      pts.push('L ' + x.toFixed(1) + ' ' + y.toFixed(1));
    }
    pts.push('Z');
    const p = new Path(pts.join(' '), {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);`;

if (code.includes(oldMoon)) {
  code = code.replace(oldMoon, newMoon);
  changes++;
  console.log("1. Fixed Moon shape");
}

// 2. Also fix Ring (same compound path issue)
const oldRing = `const addRing = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    const p = new Path('M 50 0 A 50 50 0 1 0 50 100 A 50 50 0 1 0 50 0 Z M 50 15 A 35 35 0 1 1 50 85 A 35 35 0 1 1 50 15 Z', {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);`;

const newRing = `const addRing = useCallback(async () => {
    const c = fcRef.current; if (!c) return;
    const { Path } = await import('fabric');
    // Ring using point-based outer and inner circles
    const pts: string[] = [];
    for (let i = 0; i <= 360; i += 5) {
      const rad = (i * Math.PI) / 180;
      pts.push((i === 0 ? 'M' : 'L') + ' ' + (50 + 45 * Math.cos(rad)).toFixed(1) + ' ' + (50 + 45 * Math.sin(rad)).toFixed(1));
    }
    pts.push('Z');
    for (let i = 360; i >= 0; i -= 5) {
      const rad = (i * Math.PI) / 180;
      pts.push((i === 360 ? 'M' : 'L') + ' ' + (50 + 30 * Math.cos(rad)).toFixed(1) + ' ' + (50 + 30 * Math.sin(rad)).toFixed(1));
    }
    pts.push('Z');
    const p = new Path(pts.join(' '), {
      left: c.width/2, top: c.height/2, originX:'center', originY:'center', fill: color,
    });
    c.add(p); c.setActiveObject(p); c.renderAll(); refreshLayers();
  }, [color]);`;

if (code.includes(oldRing)) {
  code = code.replace(oldRing, newRing);
  changes++;
  console.log("2. Fixed Ring shape");
}

// 3. Add Eraser button in draw mode panel
const oldDrawPanel = `<span className="text-[8px] text-gray-400">Pen Color</span>
              <input type="color" value={color} onChange={e => {
                const newColor = e.target.value;
                setColor(newColor);
                const c = fcRef.current;
                if (c && c.freeDrawingBrush) c.freeDrawingBrush.color = newColor;
              }} className="w-8 h-4 cursor-pointer border-0" />
            </div>
          )}`;

const newDrawPanel = `<span className="text-[8px] text-gray-400">Pen Color</span>
              <input type="color" value={color} onChange={e => {
                const newColor = e.target.value;
                setColor(newColor);
                const c = fcRef.current;
                if (c && c.freeDrawingBrush) c.freeDrawingBrush.color = newColor;
              }} className="w-8 h-4 cursor-pointer border-0" />
              <div className="flex gap-1 mt-1">
                <button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  if (c.freeDrawingBrush) c.freeDrawingBrush.color = color;
                }} className="flex-1 py-0.5 text-[8px] bg-blue-50 text-blue-600 rounded hover:bg-blue-100">\u270F Pen</button>
                <button onClick={() => {
                  const c = fcRef.current; if (!c) return;
                  if (c.freeDrawingBrush) c.freeDrawingBrush.color = '#FFFFFF';
                }} className="flex-1 py-0.5 text-[8px] bg-gray-100 text-gray-600 rounded hover:bg-gray-200">\uD83E\uDDF9 Eraser</button>
              </div>
              <button onClick={() => {
                const c = fcRef.current; if (!c) return;
                const objs = c.getObjects().filter((o: any) => o.type === 'path' && !o._isBgImage && !o._isSafeZone && !o._isGuideLine && !o._isCropRect);
                if (objs.length > 0) {
                  c.remove(objs[objs.length - 1]);
                  c.requestRenderAll();
                  refreshLayers();
                }
              }} className="w-full py-0.5 text-[8px] bg-red-50 text-red-500 rounded hover:bg-red-100 mt-1">Undo Last Stroke</button>
            </div>
          )}`;

if (code.includes(oldDrawPanel)) {
  code = code.replace(oldDrawPanel, newDrawPanel);
  changes++;
  console.log("3. Added Eraser and Undo Last Stroke buttons");
}

if (changes > 0) {
  writeFileSync(f, code, "utf8");
  console.log("Done! Applied " + changes + " changes");
} else {
  console.log("No changes applied");
}
