import { readFileSync, writeFileSync } from "fs";
const file = "src/components/editor/panel-editor.tsx";
let code = readFileSync(file, "utf8");
let changes = 0;

// ===== 1. Add context menu state after eraserSize state =====
const eraserSizeState = `const [eraserSize, setEraserSize] = useState(20);`;
const ctxMenuState = `const [eraserSize, setEraserSize] = useState(20);
  const [ctxMenu, setCtxMenu] = useState<{x:number;y:number;target:any}|null>(null);
  const [textShadowOn, setTextShadowOn] = useState(false);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(5);
  const [shadowOffX, setShadowOffX] = useState(3);
  const [shadowOffY, setShadowOffY] = useState(3);
  const [bgPattern, setBgPattern] = useState<'none'|'dots'|'lines'|'grid'>('none');`;

if (code.includes(eraserSizeState) && !code.includes('ctxMenu')) {
  code = code.replace(eraserSizeState, ctxMenuState);
  changes++;
  console.log("1. Added context menu + shadow + bgPattern state");
}

// ===== 2. Add context menu handler on canvas after path:created handler =====
const pathCreatedEnd = `canvas.requestRenderAll();
        }
      });`;
// Find the FIRST occurrence (the path:created one)
const idx = code.indexOf(pathCreatedEnd);
if (idx > -1 && !code.includes('contextmenu')) {
  const ctxHandler = `

      // Right-click context menu
      canvas.on('mouse:down', (opt: any) => {
        if (opt.e && opt.e.button === 2) {
          opt.e.preventDefault();
          opt.e.stopPropagation();
          const target = canvas.findTarget(opt.e);
          if (target && target.selectable !== false) {
            canvas.setActiveObject(target);
            canvas.requestRenderAll();
            const wrapperEl = wrapperRef.current;
            if (wrapperEl) {
              const rect = wrapperEl.getBoundingClientRect();
              setCtxMenu({ x: opt.e.clientX - rect.left, y: opt.e.clientY - rect.top, target });
            }
          }
        } else {
          setCtxMenu(null);
        }
      });`;
  code = code.slice(0, idx + pathCreatedEnd.length) + ctxHandler + code.slice(idx + pathCreatedEnd.length);
  changes++;
  console.log("2. Added right-click context menu handler on canvas");
}

// ===== 3. Add onContextMenu={e=>e.preventDefault()} to wrapper div =====
const wrapperOnPaste = `onPaste={async (e: React.ClipboardEvent) => {`;
if (code.includes(wrapperOnPaste) && !code.includes('onContextMenu')) {
  code = code.replace(wrapperOnPaste, `onContextMenu={e => e.preventDefault()}
            onPaste={async (e: React.ClipboardEvent) => {`);
  changes++;
  console.log("3. Added onContextMenu to wrapper div");
}

// ===== 4. Add context menu UI + text shadow UI + bg pattern after the eraser cursor div =====
const eraserCursorDiv = `{/* Eraser cursor */}
              {eraserMode && drawMode && (
                <div ref={eraserCursorRef} className="pointer-events-none absolute rounded-full border-2 border-red-400 bg-red-100/30 z-50" style={{display:'none'}} />
              )}`;

const ctxMenuUI = `{/* Eraser cursor */}
              {eraserMode && drawMode && (
                <div ref={eraserCursorRef} className="pointer-events-none absolute rounded-full border-2 border-red-400 bg-red-100/30 z-50" style={{display:'none'}} />
              )}
              {/* Context Menu */}
              {ctxMenu && (
                <div className="absolute z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px] text-xs"
                  style={{ left: ctxMenu.x, top: ctxMenu.y }}
                  onMouseLeave={() => setCtxMenu(null)}>
                  <button className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2" onClick={() => {
                    const c = fcRef.current; if (!c || !ctxMenu.target) return;
                    ctxMenu.target.clone().then((cl: any) => { cl.set({left:(cl.left||0)+20,top:(cl.top||0)+20}); c.add(cl); c.setActiveObject(cl); c.renderAll(); refreshLayers(); });
                    setCtxMenu(null);
                  }}>📋 Duplicate</button>
                  <button className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2" onClick={() => {
                    const c = fcRef.current; if (!c || !ctxMenu.target) return;
                    c.remove(ctxMenu.target); c.discardActiveObject(); c.renderAll(); refreshLayers();
                    setCtxMenu(null);
                  }}>🗑 Delete</button>
                  <hr className="my-1 border-gray-100" />
                  <button className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2" onClick={() => {
                    const c = fcRef.current; if (!c || !ctxMenu.target) return;
                    const t = ctxMenu.target;
                    t.set({ selectable: !t.selectable, evented: !t.evented, lockMovementX: t.selectable, lockMovementY: t.selectable });
                    c.renderAll();
                    setCtxMenu(null);
                  }}>{ctxMenu.target?.selectable === false ? '🔓 Unlock' : '🔒 Lock'}</button>
                  <hr className="my-1 border-gray-100" />
                  <button className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2" onClick={() => {
                    const c = fcRef.current; if (!c || !ctxMenu.target) return;
                    const objs = c.getObjects().filter((o:any) => !o._isBgImage && !o._isSafeZone && !o._isGuideLine);
                    const idx = objs.indexOf(ctxMenu.target);
                    if (idx < objs.length - 1) { c.bringObjectForward(ctxMenu.target); c.renderAll(); refreshLayers(); }
                    setCtxMenu(null);
                  }}>⬆ Bring Forward</button>
                  <button className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2" onClick={() => {
                    const c = fcRef.current; if (!c || !ctxMenu.target) return;
                    c.bringObjectToFront(ctxMenu.target); c.renderAll(); refreshLayers();
                    setCtxMenu(null);
                  }}>⏫ Bring to Front</button>
                  <button className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2" onClick={() => {
                    const c = fcRef.current; if (!c || !ctxMenu.target) return;
                    c.sendObjectBackwards(ctxMenu.target); c.renderAll(); refreshLayers();
                    setCtxMenu(null);
                  }}>⬇ Send Backward</button>
                  <button className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2" onClick={() => {
                    const c = fcRef.current; if (!c || !ctxMenu.target) return;
                    c.sendObjectToBack(ctxMenu.target); c.renderAll(); refreshLayers();
                    setCtxMenu(null);
                  }}>⏬ Send to Back</button>
                  <hr className="my-1 border-gray-100" />
                  <button className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2" onClick={() => {
                    const c = fcRef.current; if (!c || !ctxMenu.target) return;
                    ctxMenu.target.set({ flipX: !ctxMenu.target.flipX }); c.renderAll();
                    setCtxMenu(null);
                  }}>↔ Flip Horizontal</button>
                  <button className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2" onClick={() => {
                    const c = fcRef.current; if (!c || !ctxMenu.target) return;
                    ctxMenu.target.set({ flipY: !ctxMenu.target.flipY }); c.renderAll();
                    setCtxMenu(null);
                  }}>↕ Flip Vertical</button>
                </div>
              )}`;

if (code.includes(eraserCursorDiv) && !code.includes('Context Menu')) {
  code = code.replace(eraserCursorDiv, ctxMenuUI);
  changes++;
  console.log("4. Added context menu UI");
}

// ===== 5. Add Text Shadow controls after Rotation section =====
const rotationEnd = `<span className="text-[8px] text-gray-300">°</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400">Font</span>`;

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
                {textShadowOn ? 'ON' : 'OFF'}
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

if (code.includes(rotationEnd) && !code.includes('Text Shadow')) {
  code = code.replace(rotationEnd, shadowUI);
  changes++;
  console.log("5. Added Text Shadow UI");
}

// ===== 6. Add BG Pattern controls after the Grid toggle or zoom section =====
// Find the grid toggle button
const gridBtn = `<ToolButton label={showGrid ? "Grid ON" : "Grid"} icon="▦"`;
if (code.includes(gridBtn) && !code.includes('bgPattern')) {
  // Find the end of the grid button
  const gridBtnIdx = code.indexOf(gridBtn);
  const afterGrid = code.indexOf('}} />', gridBtnIdx);
  if (afterGrid > -1) {
    const bgPatternUI = `
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-gray-400">BG Pattern</span>
            <select value={bgPattern} onChange={e => {
              const v = e.target.value as 'none'|'dots'|'lines'|'grid';
              setBgPattern(v);
              const c = fcRef.current; if (!c) return;
              // Remove old pattern objects
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
                      c.add(dot);
                      c.sendObjectToBack(dot);
                    }
                  }
                } else if (v === 'lines') {
                  for (let y = gap; y < ch; y += gap) {
                    const line = new F.Line([0, y, cw, y], { stroke: '#e0e0e0', strokeWidth: 0.5, selectable: false, evented: false });
                    (line as any)._isBgPattern = true;
                    c.add(line);
                    c.sendObjectToBack(line);
                  }
                } else if (v === 'grid') {
                  for (let x = gap; x < cw; x += gap) {
                    const vl = new F.Line([x, 0, x, ch], { stroke: '#e8e8e8', strokeWidth: 0.5, selectable: false, evented: false });
                    (vl as any)._isBgPattern = true;
                    c.add(vl);
                    c.sendObjectToBack(vl);
                  }
                  for (let y = gap; y < ch; y += gap) {
                    const hl = new F.Line([0, y, cw, y], { stroke: '#e8e8e8', strokeWidth: 0.5, selectable: false, evented: false });
                    (hl as any)._isBgPattern = true;
                    c.add(hl);
                    c.sendObjectToBack(hl);
                  }
                }
                c.renderAll();
              });
            }} className="w-16 text-[8px] border rounded px-0.5 py-0.5">
              <option value="none">None</option>
              <option value="dots">• Dots</option>
              <option value="lines">≡ Lines</option>
              <option value="grid">▦ Grid</option>
            </select>
          </div>`;
    code = code.slice(0, afterGrid + 5) + bgPatternUI + code.slice(afterGrid + 5);
    changes++;
    console.log("6. Added BG Pattern controls");
  }
}

// ===== 7. Add Curved Text button after Text button =====
const textBtn = `<ToolButton label="Text" icon="T" onClick={addText} />`;
if (code.includes(textBtn) && !code.includes('Curved Text')) {
  const curvedTextBtn = `<ToolButton label="Text" icon="T" onClick={addText} />
          <ToolButton label="Curved" icon="⌒" onClick={async () => {
            const c = fcRef.current; if (!c) return;
            const text = prompt('Enter curved text:', 'CURVED TEXT') || 'CURVED TEXT';
            const radius = +(prompt('Radius (50-300):', '120') || '120');
            const { Group, FabricText } = await import('fabric');
            const chars: any[] = [];
            const totalAngle = text.length * 12;
            const startAngle = -90 - totalAngle / 2;
            for (let i = 0; i < text.length; i++) {
              const angle = startAngle + i * 12;
              const rad = (angle * Math.PI) / 180;
              const x = radius * Math.cos(rad);
              const y = radius * Math.sin(rad);
              const ch = new FabricText(text[i], {
                left: x, top: y,
                fontSize: fSize,
                fill: color,
                fontFamily: selectedFont,
                originX: 'center',
                originY: 'center',
                angle: angle + 90,
              });
              chars.push(ch);
            }
            const grp = new Group(chars, {
              left: c.width / 2,
              top: c.height / 2,
              originX: 'center',
              originY: 'center',
            });
            c.add(grp);
            c.setActiveObject(grp);
            c.renderAll();
            refreshLayers();
          }} />`;
  code = code.replace(textBtn, curvedTextBtn);
  changes++;
  console.log("7. Added Curved Text button");
}

if (changes > 0) {
  writeFileSync(file, code, "utf8");
  console.log(`\nDone! ${changes} changes applied.`);
} else {
  console.log("No changes made.");
}
