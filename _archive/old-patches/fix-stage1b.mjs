import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// 1. Fix Lock in context menu - keep selectable true but lock movement
const oldLock = `t.set({ selectable: !t.selectable, evented: !t.evented, lockMovementX: t.selectable, lockMovementY: t.selectable });
                    c.renderAll();
                    setCtxMenu(null);
                  }}>{ctxMenu.target?.selectable === false ? '🔓 Unlock' : '🔒 Lock'}</button>`;

const newLock = `const isLocked = !!t.lockMovementX;
                    t.set({
                      lockMovementX: !isLocked,
                      lockMovementY: !isLocked,
                      lockScalingX: !isLocked,
                      lockScalingY: !isLocked,
                      lockRotation: !isLocked,
                      hasControls: isLocked,
                      selectable: true,
                      evented: true,
                    });
                    c.renderAll(); refreshLayers();
                    setCtxMenu(null);
                  }}>{ctxMenu.target?.lockMovementX ? '🔓 Unlock' : '🔒 Lock'}</button>`;

if (code.includes(oldLock)) {
  code = code.replace(oldLock, newLock);
  changes++;
  console.log("1. Fixed Lock toggle in context menu");
}

// 2. Add Text Shadow UI - find Rotation section end
const rotationEnd = `<span className="text-[8px] text-gray-300">°</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Font</span>`;

if (code.includes(rotationEnd) && !code.includes('Text Shadow')) {
  const shadowUI = `<span className="text-[8px] text-gray-300">°</span>
            </div>
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Text Shadow</span>
            <div className="flex items-center gap-1">
              <button onClick={() => {
                const c = fcRef.current; if (!c) return;
                const obj = c.getActiveObject() as any;
                if (!obj) return;
                const newOn = !textShadowOn;
                setTextShadowOn(newOn);
                if (newOn) {
                  import('fabric').then(F => {
                    obj.set('shadow', new F.Shadow({ color: shadowColor, blur: shadowBlur, offsetX: shadowOffX, offsetY: shadowOffY }));
                    c.renderAll();
                  });
                } else {
                  obj.set('shadow', null);
                  c.renderAll();
                }
              }} className={\`px-2 py-0.5 text-[8px] rounded \${textShadowOn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}\`}>
                {textShadowOn ? 'Shadow ON' : 'Shadow OFF'}
              </button>
            </div>
            {textShadowOn && (
              <div className="flex flex-col items-center gap-0.5 bg-blue-50 p-1 rounded">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] text-gray-400">Color</span>
                  <input type="color" value={shadowColor} onChange={e => {
                    const v = e.target.value; setShadowColor(v);
                    const c = fcRef.current; if (!c) return;
                    const obj = c.getActiveObject() as any;
                    if (obj?.shadow) { obj.shadow.color = v; c.renderAll(); }
                  }} className="w-5 h-3 cursor-pointer border-0" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[7px] text-gray-400">Blur</span>
                  <input type="range" min={0} max={30} value={shadowBlur} onChange={e => {
                    const v = +e.target.value; setShadowBlur(v);
                    const c = fcRef.current; if (!c) return;
                    const obj = c.getActiveObject() as any;
                    if (obj?.shadow) { obj.shadow.blur = v; c.renderAll(); }
                  }} className="w-[50px] h-1 accent-blue-400" />
                  <span className="text-[7px] text-gray-300">{shadowBlur}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[7px] text-gray-400">X</span>
                  <input type="range" min={-20} max={20} value={shadowOffX} onChange={e => {
                    const v = +e.target.value; setShadowOffX(v);
                    const c = fcRef.current; if (!c) return;
                    const obj = c.getActiveObject() as any;
                    if (obj?.shadow) { obj.shadow.offsetX = v; c.renderAll(); }
                  }} className="w-[40px] h-1 accent-blue-400" />
                  <span className="text-[7px] text-gray-400">Y</span>
                  <input type="range" min={-20} max={20} value={shadowOffY} onChange={e => {
                    const v = +e.target.value; setShadowOffY(v);
                    const c = fcRef.current; if (!c) return;
                    const obj = c.getActiveObject() as any;
                    if (obj?.shadow) { obj.shadow.offsetY = v; c.renderAll(); }
                  }} className="w-[40px] h-1 accent-blue-400" />
                </div>
              </div>
            )}
          </div>
          <hr className="w-10 border-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Font</span>`;
  code = code.replace(rotationEnd, shadowUI);
  changes++;
  console.log("2. Added Text Shadow UI");
}

// 3. Add BG Pattern dropdown - find the grid toggle button area
// Look for the showGrid toggle
const gridToggle = `<button onClick={() => setShowGrid(!showGrid)} className={\`px-1.5 h-7 text-xs rounded \${showGrid ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}\`} title="Toggle Grid">⊞</button>`;

if (code.includes(gridToggle) && !code.includes('BG Pattern')) {
  const bgPatternUI = gridToggle + `
            <div className="relative group">
              <select value={bgPattern} onChange={e => {
                const v = e.target.value as 'none'|'dots'|'lines'|'grid';
                setBgPattern(v);
                const c = fcRef.current; if (!c) return;
                c.getObjects().forEach((o: any) => { if (o._isBgPattern) c.remove(o); });
                if (v === 'none') { c.renderAll(); return; }
                import('fabric').then(F => {
                  const cw = c.getWidth();
                  const ch = c.getHeight();
                  const gap = 20;
                  if (v === 'dots') {
                    for (let x = gap; x < cw; x += gap) {
                      for (let y = gap; y < ch; y += gap) {
                        const dot = new F.Circle({ left: x, top: y, radius: 1, fill: '#d0d0d0', selectable: false, evented: false, originX: 'center', originY: 'center' });
                        (dot as any)._isBgPattern = true;
                        c.add(dot); c.sendObjectToBack(dot);
                      }
                    }
                  } else if (v === 'lines') {
                    for (let y = gap; y < ch; y += gap) {
                      const line = new F.Line([0, y, cw, y], { stroke: '#e0e0e0', strokeWidth: 0.5, selectable: false, evented: false });
                      (line as any)._isBgPattern = true;
                      c.add(line); c.sendObjectToBack(line);
                    }
                  } else if (v === 'grid') {
                    for (let x = gap; x < cw; x += gap) {
                      const vl = new F.Line([x, 0, x, ch], { stroke: '#e8e8e8', strokeWidth: 0.5, selectable: false, evented: false });
                      (vl as any)._isBgPattern = true;
                      c.add(vl); c.sendObjectToBack(vl);
                    }
                    for (let y = gap; y < ch; y += gap) {
                      const hl = new F.Line([0, y, cw, y], { stroke: '#e8e8e8', strokeWidth: 0.5, selectable: false, evented: false });
                      (hl as any)._isBgPattern = true;
                      c.add(hl); c.sendObjectToBack(hl);
                    }
                  }
                  c.renderAll();
                });
              }} className="px-1 h-7 text-[10px] border rounded text-gray-500 bg-white cursor-pointer" title="Background Pattern">
                <option value="none">BG</option>
                <option value="dots">• Dots</option>
                <option value="lines">≡ Lines</option>
                <option value="grid">▦ Grid</option>
              </select>
            </div>`;
  code = code.replace(gridToggle, bgPatternUI);
  changes++;
  console.log("3. Added BG Pattern dropdown next to Grid toggle");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
