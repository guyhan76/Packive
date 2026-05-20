const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Start:', lines.length);

// === addSafeZone을 퍼센트 기반으로 완전 교체 ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const addSafeZone = useCallback')) {
    let end = i;
    for (let j = i + 1; j < i + 60; j++) {
      if (lines[j].match(/^\s*\}, \[widthMM/)) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + '// ── Safe Zone (5mm margin on all sides) ──',
      indent + 'const addSafeZone = useCallback(() => {',
      indent + '  const canvas = fcRef.current; if (!canvas) return;',
      indent + '  const fab = fabricModRef.current;',
      indent + '  if (!fab?.FabricText || !fab?.Rect) return;',
      indent + '  const { FabricText, Rect } = fab;',
      indent + '  // Remove existing safe zone objects',
      indent + '  canvas.getObjects().slice().forEach((o: any) => {',
      indent + '    if (o._isSafeZone || o._isGuideText || o._isSizeLabel) canvas.remove(o);',
      indent + '  });',
      indent + '  const cw = canvas.getWidth();',
      indent + '  const ch = canvas.getHeight();',
      indent + '  // 5mm / totalMM = percentage of each dimension',
      indent + '  // e.g. 120mm wide => 5/120 = 4.17% from left, 5/120 = 4.17% from right',
      indent + '  // e.g. 160mm tall => 5/160 = 3.125% from top, 5/160 = 3.125% from bottom',
      indent + '  const marginLeft = Math.round(cw * (5 / widthMM));',
      indent + '  const marginTop = Math.round(ch * (5 / heightMM));',
      indent + '  console.log("[SafeZone] cw:", cw, "ch:", ch, "marginLeft:", marginLeft, "marginTop:", marginTop, "widthMM:", widthMM, "heightMM:", heightMM);',
      indent + '  // Safe zone rectangle',
      indent + '  const sr = new Rect({',
      indent + '    left: marginLeft,',
      indent + '    top: marginTop,',
      indent + '    width: cw - marginLeft * 2,',
      indent + '    height: ch - marginTop * 2,',
      indent + '    fill: "transparent",',
      indent + '    stroke: "#3B82F6",',
      indent + '    strokeWidth: 1.5,',
      indent + '    strokeDashArray: [8, 5],',
      indent + '    selectable: false,',
      indent + '    evented: false,',
      indent + '    originX: "left",',
      indent + '    originY: "top",',
      indent + '  });',
      indent + '  (sr as any)._isSafeZone = true;',
      indent + '  canvas.add(sr);',
      indent + '  // Guide text (small, centered)',
      indent + '  const gt = new FabricText(guideText || "Design Area", {',
      indent + '    left: cw / 2, top: ch / 2, originX: "center", originY: "center",',
      indent + '    fontSize: 12, fill: "#D0D0D0",',
      indent + '    fontFamily: "Arial, sans-serif", selectable: false, evented: false,',
      indent + '  });',
      indent + '  (gt as any)._isGuideText = true;',
      indent + '  canvas.add(gt);',
      indent + '  // Size label (bottom-right inside safe zone)',
      indent + '  const sl = new FabricText(widthMM + " x " + heightMM + " mm", {',
      indent + '    left: cw - marginLeft - 4, top: ch - marginTop - 4,',
      indent + '    originX: "right", originY: "bottom",',
      indent + '    fontSize: 9, fill: "#C0C0C0",',
      indent + '    fontFamily: "Arial, sans-serif", selectable: false, evented: false,',
      indent + '  });',
      indent + '  (sl as any)._isSizeLabel = true;',
      indent + '  canvas.add(sl);',
      indent + '  canvas.bringObjectToFront(sr);',
      indent + '  canvas.bringObjectToFront(gt);',
      indent + '  canvas.bringObjectToFront(sl);',
      indent + '  canvas.requestRenderAll();',
      indent + '}, [widthMM, heightMM, guideText]);',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX1: addSafeZone percentage-based at line', i + 1);
    break;
  }
}

// === Eraser - 드래그로도 삭제되도록 수정 (현재 클릭만 됨) ===
// 문제: getScenePoint도 안될 수 있음 - getViewportPoint 사용
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const toggleEraser = useCallback')) {
    let end = i;
    for (let j = i + 1; j < i + 80; j++) {
      if (lines[j].match(/^\s*\}, \[eraserMode/)) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + 'const toggleEraser = useCallback(() => {',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  if (eraserMode) {',
      indent + '    c.selection = true;',
      indent + '    c.defaultCursor = "default";',
      indent + '    c.hoverCursor = "move";',
      indent + '    c.forEachObject((o: any) => {',
      indent + '      if (o._prevSelectable !== undefined) { o.selectable = o._prevSelectable; o.evented = o._prevEvented; delete o._prevSelectable; delete o._prevEvented; }',
      indent + '    });',
      indent + '    if ((c as any)._eraserDown) c.off("mouse:down", (c as any)._eraserDown);',
      indent + '    if ((c as any)._eraserMove) c.off("mouse:move", (c as any)._eraserMove);',
      indent + '    if ((c as any)._eraserUp) c.off("mouse:up", (c as any)._eraserUp);',
      indent + '    const cur = document.getElementById("eraser-cursor"); if (cur) cur.remove();',
      indent + '    const canvasEl = c.upperCanvasEl || c.getElement();',
      indent + '    if (canvasEl) canvasEl.style.cursor = "";',
      indent + '    c.renderAll();',
      indent + '    setEraserMode(false);',
      indent + '  } else {',
      indent + '    c.isDrawingMode = false;',
      indent + '    c.selection = false;',
      indent + '    c.discardActiveObject();',
      indent + '    c.forEachObject((o: any) => { o._prevSelectable = o.selectable; o._prevEvented = o.evented; o.selectable = false; o.evented = false; });',
      indent + '    c.renderAll();',
      indent + '    setDrawMode(false);',
      indent + '    let cursorEl = document.getElementById("eraser-cursor");',
      indent + '    if (!cursorEl) {',
      indent + '      cursorEl = document.createElement("div");',
      indent + '      cursorEl.id = "eraser-cursor";',
      indent + '      cursorEl.style.cssText = "position:fixed;pointer-events:none;border:2px solid #ff4444;border-radius:50%;z-index:9999;display:none;transform:translate(-50%,-50%);background:rgba(255,68,68,0.1);";',
      indent + '      document.body.appendChild(cursorEl);',
      indent + '    }',
      indent + '    cursorEl.style.width = eraserSize + "px";',
      indent + '    cursorEl.style.height = eraserSize + "px";',
      indent + '    c.defaultCursor = "none";',
      indent + '    c.hoverCursor = "none";',
      indent + '    const canvasEl = c.upperCanvasEl || c.getElement();',
      indent + '    if (canvasEl) canvasEl.style.cursor = "none";',
      indent + '    let isErasing = false;',
      indent + '    // Convert mouse event to canvas coordinates',
      indent + '    const getCanvasPoint = (e: MouseEvent) => {',
      indent + '      const el = canvasEl || c.getElement();',
      indent + '      const rect = el.getBoundingClientRect();',
      indent + '      return { x: e.clientX - rect.left, y: e.clientY - rect.top };',
      indent + '    };',
      indent + '    const eraseAt = (e: MouseEvent) => {',
      indent + '      const point = getCanvasPoint(e);',
      indent + '      const r = eraserSize / 2;',
      indent + '      const allObjs = c.getObjects().slice();',
      indent + '      let removed = false;',
      indent + '      for (const obj of allObjs) {',
      indent + '        if ((obj as any)._isSafeZone || (obj as any)._isGuideText || (obj as any)._isSizeLabel || (obj as any)._isBgImage) continue;',
      indent + '        const bound = obj.getBoundingRect();',
      indent + '        const nearX = Math.max(bound.left, Math.min(point.x, bound.left + bound.width));',
      indent + '        const nearY = Math.max(bound.top, Math.min(point.y, bound.top + bound.height));',
      indent + '        const dist = Math.sqrt((point.x - nearX) ** 2 + (point.y - nearY) ** 2);',
      indent + '        if (dist <= r) { c.remove(obj); removed = true; }',
      indent + '      }',
      indent + '      if (removed) { c.renderAll(); refreshLayers(); }',
      indent + '    };',
      indent + '    const downHandler = (opt: any) => { isErasing = true; eraseAt(opt.e as MouseEvent); };',
      indent + '    const moveHandler = (opt: any) => {',
      indent + '      const e = opt.e as MouseEvent;',
      indent + '      const cur2 = document.getElementById("eraser-cursor");',
      indent + '      if (cur2) { cur2.style.display = "block"; cur2.style.left = e.clientX + "px"; cur2.style.top = e.clientY + "px"; }',
      indent + '      if (!isErasing) return;',
      indent + '      eraseAt(e);',
      indent + '    };',
      indent + '    const upHandler = () => { isErasing = false; pushHistory(); };',
      indent + '    (c as any)._eraserDown = downHandler;',
      indent + '    (c as any)._eraserMove = moveHandler;',
      indent + '    (c as any)._eraserUp = upHandler;',
      indent + '    c.on("mouse:down", downHandler);',
      indent + '    c.on("mouse:move", moveHandler);',
      indent + '    c.on("mouse:up", upHandler);',
      indent + '    setEraserMode(true);',
      indent + '  }',
      indent + '}, [eraserMode, eraserSize, refreshLayers, pushHistory, drawMode]);',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX2: Eraser with getBoundingClientRect at line', i + 1);
    break;
  }
}

// === WRITE ===
const result = lines.join('\n');
fs.writeFileSync(file, result, 'utf8');
const ob = (result.match(/\{/g)||[]).length;
const cb = (result.match(/\}/g)||[]).length;
console.log('Done! Lines:', lines.length, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
