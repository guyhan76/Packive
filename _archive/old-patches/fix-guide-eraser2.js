const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Start:', lines.length);

// === FIX 1: addSafeZone - 가이드 텍스트 크기 줄이고 guideText가 길면 줄바꿈 ===
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
      indent + '  const _sc = scaleRef.current || 1;',
      indent + '  const _cw = canvas.getWidth();',
      indent + '  const _ch = canvas.getHeight();',
      indent + '  const _mgX = Math.max(8, Math.round(5 * _sc));',
      indent + '  const _mgY = Math.max(8, Math.round(5 * (_sc * (widthMM / heightMM) / (widthMM / heightMM))));',
      indent + '  // Safe zone rectangle - 상하좌우 5mm',
      indent + '  const _sr = new Rect({',
      indent + '    left: _mgX, top: _mgX, width: _cw - _mgX * 2, height: _ch - _mgX * 2,',
      indent + '    fill: "transparent", stroke: "#3B82F6", strokeWidth: 1.5,',
      indent + '    strokeDashArray: [8, 5], selectable: false, evented: false,',
      indent + '    originX: "left", originY: "top",',
      indent + '  });',
      indent + '  (_sr as any)._isSafeZone = true;',
      indent + '  canvas.add(_sr);',
      indent + '  // Guide text - small, subtle',
      indent + '  const gtSize = Math.max(10, Math.min(13, Math.round(11 * _sc)));',
      indent + '  const _gt = new FabricText(guideText || "Design Area", {',
      indent + '    left: _cw / 2, top: _ch / 2, originX: "center", originY: "center",',
      indent + '    fontSize: gtSize, fill: "#D0D0D0",',
      indent + '    fontFamily: "Arial, sans-serif", selectable: false, evented: false,',
      indent + '  });',
      indent + '  (_gt as any)._isGuideText = true;',
      indent + '  canvas.add(_gt);',
      indent + '  // Size label',
      indent + '  const _sl = new FabricText(widthMM + " x " + heightMM + " mm", {',
      indent + '    left: _cw - _mgX - 4, top: _ch - _mgX - 4, originX: "right", originY: "bottom",',
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
    console.log('FIX1: addSafeZone rewritten at line', i + 1);
    break;
  }
}

// === FIX 2: Eraser - Figma 스타일 (브러시로 드래그하면 경로 위 오브젝트 삭제) ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const toggleEraser = useCallback')) {
    let end = i;
    for (let j = i + 1; j < i + 40; j++) {
      if (lines[j].match(/^\s*\}, \[eraserMode/)) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + 'const toggleEraser = useCallback(() => {',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  if (eraserMode) {',
      indent + '    c.isDrawingMode = false;',
      indent + '    c.defaultCursor = "default";',
      indent + '    c.hoverCursor = "move";',
      indent + '    // Remove eraser event handlers',
      indent + '    if ((c as any)._eraserDown) c.off("mouse:down", (c as any)._eraserDown);',
      indent + '    if ((c as any)._eraserMove) c.off("mouse:move", (c as any)._eraserMove);',
      indent + '    if ((c as any)._eraserUp) c.off("mouse:up", (c as any)._eraserUp);',
      indent + '    setEraserMode(false);',
      indent + '  } else {',
      indent + '    c.isDrawingMode = false;',
      indent + '    setDrawMode(false);',
      indent + '    c.selection = false;',
      indent + '    c.defaultCursor = "crosshair";',
      indent + '    c.hoverCursor = "crosshair";',
      indent + '    let isErasing = false;',
      indent + '    const radius = eraserSize / 2;',
      indent + '    const eraseAt = (pointer: {x:number,y:number}) => {',
      indent + '      c.getObjects().slice().forEach((obj: any) => {',
      indent + '        if (obj._isSafeZone || obj._isGuideText || obj._isSizeLabel || obj._isBgImage || obj.selectable === false) return;',
      indent + '        const bound = obj.getBoundingRect();',
      indent + '        const cx = bound.left + bound.width / 2;',
      indent + '        const cy = bound.top + bound.height / 2;',
      indent + '        const dist = Math.sqrt(Math.pow(pointer.x - cx, 2) + Math.pow(pointer.y - cy, 2));',
      indent + '        if (dist < radius + Math.max(bound.width, bound.height) / 2) {',
      indent + '          c.remove(obj);',
      indent + '        }',
      indent + '      });',
      indent + '    };',
      indent + '    const downHandler = (opt: any) => { isErasing = true; const p = c.getPointer(opt.e); eraseAt(p); c.renderAll(); refreshLayers(); };',
      indent + '    const moveHandler = (opt: any) => { if (!isErasing) return; const p = c.getPointer(opt.e); eraseAt(p); c.renderAll(); refreshLayers(); };',
      indent + '    const upHandler = () => { isErasing = false; pushHistory(); };',
      indent + '    (c as any)._eraserDown = downHandler;',
      indent + '    (c as any)._eraserMove = moveHandler;',
      indent + '    (c as any)._eraserUp = upHandler;',
      indent + '    c.on("mouse:down", downHandler);',
      indent + '    c.on("mouse:move", moveHandler);',
      indent + '    c.on("mouse:up", upHandler);',
      indent + '    setEraserMode(true);',
      indent + '  }',
      indent + '}, [eraserMode, eraserSize, refreshLayers, pushHistory]);',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX2: toggleEraser Figma-style at line', i + 1);
    break;
  }
}

// === FIX 3: Eraser size 슬라이더 라벨 업데이트 ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{eraserMode && (')) {
    // Find and update the label
    for (let j = i; j < i + 10; j++) {
      if (lines[j].includes('Eraser:')) {
        lines[j] = lines[j].replace('Eraser:', 'Radius:');
        console.log('FIX3: Eraser label updated at line', j + 1);
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
