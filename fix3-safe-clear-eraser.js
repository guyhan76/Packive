const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Start:', lines.length);

// === FIX 1: 안전선 상하 5mm - scaleY 별도 계산 ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const addSafeZone = () => {')) {
    let end = i;
    let depth = 0;
    for (let j = i; j < i + 50; j++) {
      depth += (lines[j].match(/\{/g)||[]).length - (lines[j].match(/\}/g)||[]).length;
      if (depth === 0 && j > i) { end = j; break; }
    }
    const indent = '      ';
    const newFn = [
      indent + 'const addSafeZone = () => {',
      indent + '  const canvas = fcRef.current; if (!canvas) return;',
      indent + '  const FabricText = fabricModRef.current?.FabricText;',
      indent + '  const Rect = fabricModRef.current?.Rect;',
      indent + '  if (!FabricText || !Rect) return;',
      indent + '  canvas.getObjects().slice().forEach((o: any) => {',
      indent + '    if (o._isSafeZone || o._isGuideText || o._isSizeLabel) canvas.remove(o);',
      indent + '  });',
      indent + '  const _cw = canvas.getWidth();',
      indent + '  const _ch = canvas.getHeight();',
      indent + '  // 5mm margin: calculate px per mm for X and Y separately',
      indent + '  const pxPerMmX = _cw / widthMM;',
      indent + '  const pxPerMmY = _ch / heightMM;',
      indent + '  const mgX = Math.max(6, Math.round(5 * pxPerMmX));',
      indent + '  const mgY = Math.max(6, Math.round(5 * pxPerMmY));',
      indent + '  const _sr = new Rect({',
      indent + '    left: mgX, top: mgY, width: _cw - mgX * 2, height: _ch - mgY * 2,',
      indent + '    fill: "transparent", stroke: "#3B82F6", strokeWidth: 1.5,',
      indent + '    strokeDashArray: [8, 5], selectable: false, evented: false,',
      indent + '    originX: "left", originY: "top",',
      indent + '  });',
      indent + '  (_sr as any)._isSafeZone = true;',
      indent + '  canvas.add(_sr);',
      indent + '  const gtSize = Math.max(10, Math.min(13, Math.round(11 * pxPerMmX)));',
      indent + '  const _gt = new FabricText(guideText || "Design Area", {',
      indent + '    left: _cw / 2, top: _ch / 2, originX: "center", originY: "center",',
      indent + '    fontSize: gtSize, fill: "#D0D0D0",',
      indent + '    fontFamily: "Arial, sans-serif", selectable: false, evented: false,',
      indent + '  });',
      indent + '  (_gt as any)._isGuideText = true;',
      indent + '  canvas.add(_gt);',
      indent + '  const _sl = new FabricText(widthMM + " x " + heightMM + " mm", {',
      indent + '    left: _cw - mgX - 4, top: _ch - mgY - 4, originX: "right", originY: "bottom",',
      indent + '    fontSize: 9, fill: "#C0C0C0", fontFamily: "Arial, sans-serif",',
      indent + '    selectable: false, evented: false,',
      indent + '  });',
      indent + '  (_sl as any)._isSizeLabel = true;',
      indent + '  canvas.add(_sl);',
      indent + '  canvas.bringObjectToFront(_sr);',
      indent + '  canvas.bringObjectToFront(_gt);',
      indent + '  canvas.bringObjectToFront(_sl);',
      indent + '  canvas.requestRenderAll();',
      indent + '};',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX1: addSafeZone with separate X/Y margins at line', i + 1);
    break;
  }
}

// === FIX 2: Clear Canvas - addSafeZone 다시 호출하도록 수정 ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Clear Canvas') && lines[i-3]?.includes('onClick')) {
    // Find the onClick line
    for (let j = i - 5; j <= i; j++) {
      if (lines[j].includes('onClick') && lines[j].includes('c.getObjects')) {
        lines[j] = lines[j].replace(
          /onClick=\{[^}]*\}/,
          `onClick={() => { const c=fcRef.current; if(!c) return; c.getObjects().slice().forEach(o=>c.remove(o)); c.backgroundColor="#FFFFFF"; c.renderAll(); addSafeZone(); pushHistory(); }}`
        );
        console.log('FIX2: Clear Canvas fixed at line', j + 1);
        break;
      }
    }
    break;
  }
}
// Also search for the inline version
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Clear Canvas')) {
    // Check if addSafeZone is already in the onClick
    let blockStart = i;
    for (let j = i; j >= Math.max(0, i - 5); j--) {
      if (lines[j].includes('<button') && lines[j].includes('onClick')) {
        blockStart = j;
        break;
      }
    }
    if (!lines[blockStart].includes('addSafeZone')) {
      lines[blockStart] = lines[blockStart].replace(
        /pushHistory\(\);?\s*\}\}/,
        'addSafeZone(); pushHistory(); }}'
      );
      console.log('FIX2b: addSafeZone added to Clear Canvas at line', blockStart + 1);
    }
    break;
  }
}

// === FIX 3: Eraser - 커서를 동그라미로 + 오브젝트 삭제 수정 ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const toggleEraser = useCallback')) {
    let end = i;
    for (let j = i + 1; j < i + 50; j++) {
      if (lines[j].match(/^\s*\}, \[eraserMode/)) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + 'const toggleEraser = useCallback(() => {',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  const wrapper = wrapperRef.current;',
      indent + '  if (eraserMode) {',
      indent + '    c.isDrawingMode = false;',
      indent + '    c.selection = true;',
      indent + '    c.defaultCursor = "default";',
      indent + '    c.hoverCursor = "move";',
      indent + '    if ((c as any)._eraserDown) c.off("mouse:down", (c as any)._eraserDown);',
      indent + '    if ((c as any)._eraserMove) c.off("mouse:move", (c as any)._eraserMove);',
      indent + '    if ((c as any)._eraserUp) c.off("mouse:up", (c as any)._eraserUp);',
      indent + '    // Remove cursor overlay',
      indent + '    const oldCursor = document.getElementById("eraser-cursor");',
      indent + '    if (oldCursor) oldCursor.remove();',
      indent + '    setEraserMode(false);',
      indent + '  } else {',
      indent + '    c.isDrawingMode = false;',
      indent + '    c.selection = false;',
      indent + '    c.discardActiveObject();',
      indent + '    c.renderAll();',
      indent + '    setDrawMode(false);',
      indent + '    // Create circular cursor element',
      indent + '    let cursorEl = document.getElementById("eraser-cursor");',
      indent + '    if (!cursorEl) {',
      indent + '      cursorEl = document.createElement("div");',
      indent + '      cursorEl.id = "eraser-cursor";',
      indent + '      cursorEl.style.cssText = "position:fixed;pointer-events:none;border:2px solid #ff4444;border-radius:50%;z-index:9999;display:none;transform:translate(-50%,-50%);";',
      indent + '      document.body.appendChild(cursorEl);',
      indent + '    }',
      indent + '    const sz = eraserSize;',
      indent + '    cursorEl.style.width = sz + "px";',
      indent + '    cursorEl.style.height = sz + "px";',
      indent + '    c.defaultCursor = "none";',
      indent + '    c.hoverCursor = "none";',
      indent + '    // Show cursor on canvas mouse move',
      indent + '    let isErasing = false;',
      indent + '    const radius = sz / 2;',
      indent + '    const eraseAt = (pointer: {x:number, y:number}) => {',
      indent + '      const objs = c.getObjects().slice();',
      indent + '      for (const obj of objs) {',
      indent + '        if ((obj as any)._isSafeZone || (obj as any)._isGuideText || (obj as any)._isSizeLabel || (obj as any)._isBgImage || obj.selectable === false) continue;',
      indent + '        const bound = obj.getBoundingRect(true);',
      indent + '        // Check if eraser circle overlaps object bounding box',
      indent + '        const nearestX = Math.max(bound.left, Math.min(pointer.x, bound.left + bound.width));',
      indent + '        const nearestY = Math.max(bound.top, Math.min(pointer.y, bound.top + bound.height));',
      indent + '        const dist = Math.sqrt(Math.pow(pointer.x - nearestX, 2) + Math.pow(pointer.y - nearestY, 2));',
      indent + '        if (dist <= radius) {',
      indent + '          c.remove(obj);',
      indent + '        }',
      indent + '      }',
      indent + '    };',
      indent + '    const downHandler = (opt: any) => {',
      indent + '      isErasing = true;',
      indent + '      const p = c.getPointer(opt.e);',
      indent + '      eraseAt(p);',
      indent + '      c.renderAll();',
      indent + '      refreshLayers();',
      indent + '    };',
      indent + '    const moveHandler = (opt: any) => {',
      indent + '      const e = opt.e as MouseEvent;',
      indent + '      if (cursorEl) { cursorEl.style.display = "block"; cursorEl.style.left = e.clientX + "px"; cursorEl.style.top = e.clientY + "px"; }',
      indent + '      if (!isErasing) return;',
      indent + '      const p = c.getPointer(opt.e);',
      indent + '      eraseAt(p);',
      indent + '      c.renderAll();',
      indent + '    };',
      indent + '    const upHandler = () => { isErasing = false; pushHistory(); refreshLayers(); };',
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
    console.log('FIX3: Eraser with circle cursor at line', i + 1);
    break;
  }
}

// === FIX 4: Eraser size 슬라이더 변경 시 커서 크기도 업데이트 ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('eraserMode && (') && lines[i+1]?.includes('Radius')) {
    // Find the onChange handler for eraser slider
    for (let j = i; j < i + 10; j++) {
      if (lines[j].includes('setEraserSize') && lines[j].includes('range')) {
        lines[j] = lines[j].replace(
          /onChange=\{e => \{[^}]*\}\}/,
          `onChange={e => { const s=Number(e.target.value); setEraserSize(s); const c=fcRef.current; if(c?.freeDrawingBrush) c.freeDrawingBrush.width=s; const cur=document.getElementById("eraser-cursor"); if(cur){cur.style.width=s+"px";cur.style.height=s+"px";} }}`
        );
        console.log('FIX4: Eraser slider updates cursor at line', j + 1);
        break;
      }
    }
    break;
  }
}

// === WRITE ===
const result = lines.join('\n');
fs.writeFileSync(file, result, 'utf8');
const ob = (result.match(/\{/g)||[]).length;
const cb = (result.match(/\}/g)||[]).length;
console.log('Done! Lines:', lines.length, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
