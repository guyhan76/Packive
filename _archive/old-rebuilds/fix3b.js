const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Start:', lines.length);

// === FIX 1: Clear Canvas - addSafeZone() 추가 ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Clear Canvas') && i > 0) {
    // line 1615 (index 1614) has the onClick
    const btnLine = i - 1; // button line
    if (lines[btnLine].includes('onClick') && !lines[btnLine].includes('addSafeZone')) {
      lines[btnLine] = lines[btnLine].replace(
        'c.renderAll();',
        'c.renderAll(); addSafeZone();'
      );
      console.log('FIX1: addSafeZone added to Clear Canvas at line', btnLine + 1);
    }
    break;
  }
}

// === FIX 2: 안전선 상하 - 디버그 로그 추가하고 확인 ===
// 문제: mgY가 제대로 계산되는데도 상하가 안 맞음
// 원인: canvas가 zoom되어 있거나, viewportTransform이 적용된 상태
// 해결: addSafeZone에서 zoom 고려 없이 실제 canvas 픽셀 기준으로 계산
// 현재 코드는 맞아 보이므로, 실제 값을 확인하기 위해 console.log 추가
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const addSafeZone = () => {')) {
    // Find the line after mgY calculation
    for (let j = i; j < i + 20; j++) {
      if (lines[j].includes('const mgY')) {
        // Add debug log after mgY line
        lines.splice(j + 1, 0, '        console.log("[SafeZone] cw:", _cw, "ch:", _ch, "widthMM:", widthMM, "heightMM:", heightMM, "mgX:", mgX, "mgY:", mgY, "pxPerMmX:", pxPerMmX, "pxPerMmY:", pxPerMmY);');
        console.log('FIX2: Debug log added after line', j + 1);
        break;
      }
    }
    break;
  }
}

// === FIX 3: Eraser - selection 비활성화 + 오브젝트 비선택 상태로 ===
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
      indent + '    // Turn off eraser',
      indent + '    c.selection = true;',
      indent + '    c.defaultCursor = "default";',
      indent + '    c.hoverCursor = "move";',
      indent + '    c.forEachObject((o: any) => { if (o.selectable !== false) { o.selectable = true; o.evented = true; } });',
      indent + '    if ((c as any)._eraserDown) c.off("mouse:down", (c as any)._eraserDown);',
      indent + '    if ((c as any)._eraserMove) c.off("mouse:move", (c as any)._eraserMove);',
      indent + '    if ((c as any)._eraserUp) c.off("mouse:up", (c as any)._eraserUp);',
      indent + '    const cur = document.getElementById("eraser-cursor"); if (cur) cur.remove();',
      indent + '    c.renderAll();',
      indent + '    setEraserMode(false);',
      indent + '  } else {',
      indent + '    // Turn on eraser',
      indent + '    c.isDrawingMode = false;',
      indent + '    c.selection = false;',
      indent + '    c.discardActiveObject();',
      indent + '    // Make all objects non-selectable temporarily',
      indent + '    c.forEachObject((o: any) => { o._prevSelectable = o.selectable; o._prevEvented = o.evented; o.selectable = false; o.evented = false; });',
      indent + '    c.renderAll();',
      indent + '    setDrawMode(false);',
      indent + '    // Create circular cursor',
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
      indent + '    // Get canvas element for cursor hiding',
      indent + '    const canvasEl = c.upperCanvasEl || c.getElement();',
      indent + '    if (canvasEl) canvasEl.style.cursor = "none";',
      indent + '    let isErasing = false;',
      indent + '    const eraseAt = (ex: number, ey: number) => {',
      indent + '      const pointer = c.getPointer({clientX: ex, clientY: ey} as any);',
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
      indent + '      const e = opt.e as MouseEvent;',
      indent + '      eraseAt(e.clientX, e.clientY);',
      indent + '    };',
      indent + '    const moveHandler = (opt: any) => {',
      indent + '      const e = opt.e as MouseEvent;',
      indent + '      if (cursorEl) { cursorEl.style.display = "block"; cursorEl.style.left = e.clientX + "px"; cursorEl.style.top = e.clientY + "px"; }',
      indent + '      if (!isErasing) return;',
      indent + '      eraseAt(e.clientX, e.clientY);',
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
    console.log('FIX3: Eraser fully rewritten at line', i + 1);
    break;
  }
}

// === WRITE ===
const result = lines.join('\n');
fs.writeFileSync(file, result, 'utf8');
const ob = (result.match(/\{/g)||[]).length;
const cb = (result.match(/\}/g)||[]).length;
console.log('Done! Lines:', lines.length, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
