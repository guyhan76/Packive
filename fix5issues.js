const fs = require('fs');
const file = 'src/components/editor/panel-editor.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Start lines:', lines.length);

// === FIX A: Zoom - applyZoom이 canvas.setZoom을 사용하지만 ===
// canvas.setZoom은 fabric v7에서 다르게 동작할 수 있음
// 대신 canvas의 viewportTransform을 직접 조작
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const applyZoom = useCallback')) {
    let end = i;
    for (let j = i; j < i + 20; j++) {
      if (lines[j].match(/^\s*\}, \[\]\);/)) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + 'const applyZoom = useCallback((newZoom: number) => {',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  const z = Math.max(25, Math.min(400, newZoom));',
      indent + '  const scale = z / 100;',
      indent + '  const vpt = c.viewportTransform || [1,0,0,1,0,0];',
      indent + '  vpt[0] = scale;',
      indent + '  vpt[3] = scale;',
      indent + '  c.setViewportTransform(vpt);',
      indent + '  c.requestRenderAll();',
      indent + '  setZoom(z);',
      indent + '  zoomRef.current = z;',
      indent + '  if (z >= 150) setShowMinimap(true);',
      indent + '}, []);',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX-A: applyZoom fixed at line', i+1);
    break;
  }
}

// === FIX B: Grid - change color to gray so visible on white ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('showGrid') && lines[i].includes('backgroundImage')) {
    lines[i] = lines[i]
      .replace(/opacity-30/g, 'opacity-60')
      .replace(/rgba\(255,255,255,[^)]*\)/g, 'rgba(200,200,220,0.4)')
      .replace(/white/g, 'rgba(180,180,200,0.5)');
    // If it uses a simple color, replace
    if (!lines[i].includes('rgba(')) {
      lines[i] = lines[i].replace(
        /backgroundImage:[^}]*/,
        `backgroundImage:'repeating-linear-gradient(0deg,rgba(180,190,210,0.35),rgba(180,190,210,0.35) 1px,transparent 1px,transparent 20px),repeating-linear-gradient(90deg,rgba(180,190,210,0.35),rgba(180,190,210,0.35) 1px,transparent 1px,transparent 20px)'`
      );
    }
    console.log('FIX-B: Grid color fixed at line', i+1);
    break;
  }
}

// === FIX C: Remove duplicate Draw controls (line 1433) ===
// Keep only the second one (line 1440), remove the first (1433)
let drawCount = 0;
let firstDrawStart = -1;
let firstDrawEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{drawMode && (') && !lines[i].includes('//')) {
    drawCount++;
    if (drawCount === 1) {
      firstDrawStart = i;
      // Find closing of this block
      let depth = 0;
      for (let j = i; j < i + 20; j++) {
        const opens = (lines[j].match(/\(/g)||[]).length + (lines[j].match(/\{/g)||[]).length;
        const closes = (lines[j].match(/\)/g)||[]).length + (lines[j].match(/\}/g)||[]).length;
        depth += opens - closes;
        if (j > i && lines[j].trim() === ')}') {
          firstDrawEnd = j;
          break;
        }
      }
      console.log('FIX-C: First drawMode block at lines', firstDrawStart+1, '-', firstDrawEnd+1);
    }
  }
}
if (firstDrawStart >= 0 && firstDrawEnd >= 0 && drawCount >= 2) {
  lines.splice(firstDrawStart, firstDrawEnd - firstDrawStart + 1);
  console.log('FIX-C: Removed duplicate draw controls');
}

// === FIX D: Eraser - use globalCompositeOperation instead of white color ===
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const toggleEraser = useCallback')) {
    let end = i;
    for (let j = i + 1; j < i + 30; j++) {
      if (lines[j].match(/^\s*\}, \[eraserMode/)) { end = j; break; }
    }
    const indent = '    ';
    const newFn = [
      indent + 'const toggleEraser = useCallback(() => {',
      indent + '  const c = fcRef.current; if (!c) return;',
      indent + '  const fab = fabricModRef.current;',
      indent + '  if (eraserMode) {',
      indent + '    c.isDrawingMode = false;',
      indent + '    setEraserMode(false);',
      indent + '  } else {',
      indent + '    c.isDrawingMode = true;',
      indent + '    if (fab && fab.PencilBrush) {',
      indent + '      const brush = new fab.PencilBrush(c);',
      indent + '      brush.color = "rgba(255,255,255,1)";',
      indent + '      brush.width = eraserSize;',
      indent + '      (brush as any)._isEraser = true;',
      indent + '      c.freeDrawingBrush = brush;',
      indent + '    }',
      indent + '    setEraserMode(true);',
      indent + '    setDrawMode(false);',
      indent + '  }',
      indent + '  c.renderAll();',
      indent + '}, [eraserMode, eraserSize]);',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX-D: toggleEraser fixed at line', i+1);
    break;
  }
}

// Also fix eraser path:created handler to use destination-out
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('path:created') && lines[i+1]?.includes('_isEraser')) {
    // Make sure eraser strokes use destination-out compositing
    let blockEnd = i;
    for (let j = i; j < i + 8; j++) {
      if (lines[j].includes('});')) { blockEnd = j; break; }
    }
    const indent = '      ';
    const newHandler = [
      indent + "canvas.on('path:created', (opt: any) => {",
      indent + "  const path = opt.path;",
      indent + "  if (path && fcRef.current?.freeDrawingBrush && (fcRef.current.freeDrawingBrush as any)._isEraser) {",
      indent + "    path._isEraserStroke = true;",
      indent + "    path.set({ globalCompositeOperation: 'destination-out', stroke: 'rgba(0,0,0,1)' });",
      indent + "    canvas.requestRenderAll();",
      indent + "  }",
      indent + "});",
    ];
    lines.splice(i, blockEnd - i + 1, ...newHandler);
    console.log('FIX-D2: path:created eraser handler fixed at line', i+1);
    break;
  }
}

// === FIX E: Safe zone - ensure addSafeZone runs on initial load ===
// Check if addSafeZone is called after canvas creation even without restore
// Already exists at line ~1151: if (!didRestore) { addSafeZone(); }
// The issue might be that the safe zone rect is behind the white bg
// Fix: make sure safe zone is rendered ON TOP and background is truly white
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const addSafeZone = () => {')) {
    let end = i;
    let depth = 0;
    for (let j = i; j < i + 40; j++) {
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
      indent + '  // Remove existing safe zone objects',
      indent + '  canvas.getObjects().slice().forEach((o: any) => {',
      indent + '    if (o._isSafeZone || o._isGuideText || o._isSizeLabel) canvas.remove(o);',
      indent + '  });',
      indent + '  const _sc = scaleRef.current || 1;',
      indent + '  const _cw = canvas.getWidth();',
      indent + '  const _ch = canvas.getHeight();',
      indent + '  const _mg = Math.round(5 * _sc);',
      indent + '  // Safe zone rectangle',
      indent + '  const _sr = new Rect({',
      indent + '    left: _mg, top: _mg, width: _cw - _mg * 2, height: _ch - _mg * 2,',
      indent + '    fill: "transparent", stroke: "#4A90D9", strokeWidth: 1.5,',
      indent + '    strokeDashArray: [8, 5], selectable: false, evented: false,',
      indent + '    originX: "left", originY: "top",',
      indent + '  });',
      indent + '  ((_sr as any)._isSafeZone) = true;',
      indent + '  canvas.add(_sr);',
      indent + '  // Guide text',
      indent + '  const _gt = new FabricText(guideText || "Design Area", {',
      indent + '    left: _cw / 2, top: _ch / 2, originX: "center", originY: "center",',
      indent + '    fontSize: Math.max(12, Math.round(14 * _sc)), fill: "#B0B0B0",',
      indent + '    fontFamily: "Arial, sans-serif", selectable: false, evented: false,',
      indent + '  });',
      indent + '  ((_gt as any)._isGuideText) = true;',
      indent + '  canvas.add(_gt);',
      indent + '  // Size label',
      indent + '  const _sl = new FabricText(widthMM + " x " + heightMM + " mm", {',
      indent + '    left: _cw - _mg - 4, top: _ch - _mg - 4, originX: "right", originY: "bottom",',
      indent + '    fontSize: 11, fill: "#B0B0B0", fontFamily: "Arial, sans-serif",',
      indent + '    selectable: false, evented: false,',
      indent + '  });',
      indent + '  ((_sl as any)._isSizeLabel) = true;',
      indent + '  canvas.add(_sl);',
      indent + '  // Bring safe zone objects to front so visible on white bg',
      indent + '  canvas.bringObjectToFront(_sr);',
      indent + '  canvas.bringObjectToFront(_gt);',
      indent + '  canvas.bringObjectToFront(_sl);',
      indent + '  canvas.requestRenderAll();',
      indent + '};',
    ];
    lines.splice(i, end - i + 1, ...newFn);
    console.log('FIX-E: addSafeZone rewritten at line', i+1);
    break;
  }
}

// === WRITE ===
const result = lines.join('\n');
fs.writeFileSync(file, result, 'utf8');
const ob = (result.match(/\{/g)||[]).length;
const cb = (result.match(/\}/g)||[]).length;
console.log('Done! Lines:', lines.length, '| { :', ob, '| } :', cb, '| diff:', ob - cb);
