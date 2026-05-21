const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Start:', lines.length);

// === FIX 1: Eraser - getPointer에 실제 event 전달 ===
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
      indent + '    const eraseAt = (evt: any) => {',
      indent + '      const pointer = c.getScenePoint(evt);',
      indent + '      const r = eraserSize / 2;',
      indent + '      const allObjs = c.getObjects().slice();',
      indent + '      let removed = false;',
      indent + '      for (const obj of allObjs) {',
      indent + '        if ((obj as any)._isSafeZone || (obj as any)._isGuideText || (obj as any)._isSizeLabel || (obj as any)._isBgImage) continue;',
      indent + '        const bound = obj.getBoundingRect();',
      indent + '        const nearX = Math.max(bound.left, Math.min(pointer.x, bound.left + bound.width));',
      indent + '        const nearY = Math.max(bound.top, Math.min(pointer.y, bound.top + bound.height));',
      indent + '        const dist = Math.sqrt((pointer.x - nearX) ** 2 + (pointer.y - nearY) ** 2);',
      indent + '        if (dist <= r) { c.remove(obj); removed = true; }',
      indent + '      }',
      indent + '      if (removed) { c.renderAll(); refreshLayers(); }',
      indent + '    };',
      indent + '    const downHandler = (opt: any) => {',
      indent + '      isErasing = true;',
      indent + '      eraseAt(opt.e);',
      indent + '    };',
      indent + '    const moveHandler = (opt: any) => {',
      indent + '      const e = opt.e as MouseEvent;',
      indent + '      const cur2 = document.getElementById("eraser-cursor");',
      indent + '      if (cur2) { cur2.style.display = "block"; cur2.style.left = e.clientX + "px"; cur2.style.top = e.clientY + "px"; }',
      indent + '      if (!isErasing) return;',
      indent + '      eraseAt(opt.e);',
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
    console.log('FIX1: Eraser with getScenePoint at line', i + 1);
    break;
  }
}

// === FIX 2: 캔버스 배경과 바깥 영역 색 구분 ===
// 캔버스 wrapper에 약간의 그림자/테두리 추가
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<canvas ref={canvasElRef}')) {
    if (!lines[i].includes('shadow')) {
      lines[i] = lines[i].replace(
        '<canvas ref={canvasElRef}',
        '<canvas ref={canvasElRef} style={{boxShadow:"0 2px 16px rgba(0,0,0,0.25)", border:"1px solid #e0e0e0"}}'
      );
      console.log('FIX2: Canvas shadow/border added at line', i + 1);
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
