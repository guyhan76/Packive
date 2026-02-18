import { readFileSync, writeFileSync } from "fs";
const f = "src/components/editor/panel-editor.tsx";
let lines = readFileSync(f, "utf8").split("\n");
let changes = 0;

// 1. Add measureMode state after showGrid state
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const [showGrid, setShowGrid] = useState(false)")) {
    lines.splice(i + 1, 0,
      "  const [measureMode, setMeasureMode] = useState(false);",
      "  const measureStartRef = useRef<{x:number;y:number}|null>(null);",
      "  const measureLineRef = useRef<any>(null);",
      "  const measureTextRef = useRef<any>(null);"
    );
    changes++;
    console.log("1. Added measureMode state");
    break;
  }
}

// 2. Add Measure ToolButton after Delete button
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ToolButton label="Delete"')) {
    const measureBtn = [
      '          <ToolButton label={measureMode ? "📏 ON" : "📏 Measure"} icon="📏" onClick={() => {',
      '            setMeasureMode(m => {',
      '              const next = !m;',
      '              const c = fcRef.current; if (!c) return next;',
      '              if (!next) {',
      '                // Clean up measure objects',
      '                if (measureLineRef.current) { try { c.remove(measureLineRef.current); } catch {} measureLineRef.current = null; }',
      '                if (measureTextRef.current) { try { c.remove(measureTextRef.current); } catch {} measureTextRef.current = null; }',
      '                measureStartRef.current = null;',
      '                c.selection = true;',
      '                c.forEachObject((o: any) => { if (!o._isSafeZone && !o._isGuideLine && !o._isBgImage) { o.selectable = true; o.evented = true; } });',
      '                c.defaultCursor = "default";',
      '                c.requestRenderAll();',
      '              } else {',
      '                c.discardActiveObject();',
      '                c.selection = false;',
      '                c.forEachObject((o: any) => { o.selectable = false; o.evented = false; });',
      '                c.defaultCursor = "crosshair";',
      '                c.requestRenderAll();',
      '              }',
      '              return next;',
      '            });',
      '          }} />',
    ];
    lines.splice(i + 1, 0, ...measureBtn);
    changes++;
    console.log("2. Added Measure button after Delete");
    break;
  }
}

// 3. Add measure mouse handlers inside boot() after object:modified handler
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("canvas.on('object:removed'")) {
    const measureHandlers = [
      "",
      "      // Measure tool mouse handlers",
      "      canvas.on('mouse:down', (opt: any) => {",
      "        if (!measureStartRef.current && measureLineRef.current === null && measureTextRef.current === null) {",
      "          // Check if measure mode is active by checking cursor",
      "          if (canvas.defaultCursor !== 'crosshair') return;",
      "        }",
      "        if (canvas.defaultCursor !== 'crosshair') return;",
      "        const pointer = canvas.getScenePoint(opt.e);",
      "        measureStartRef.current = { x: pointer.x, y: pointer.y };",
      "        // Remove old measure objects",
      "        if (measureLineRef.current) { try { canvas.remove(measureLineRef.current); } catch {} measureLineRef.current = null; }",
      "        if (measureTextRef.current) { try { canvas.remove(measureTextRef.current); } catch {} measureTextRef.current = null; }",
      "      });",
      "",
      "      canvas.on('mouse:move', (opt: any) => {",
      "        if (canvas.defaultCursor !== 'crosshair' || !measureStartRef.current) return;",
      "        const pointer = canvas.getScenePoint(opt.e);",
      "        const { Line: FLine, FabricText: FText } = require('fabric');",
      "        // Remove old",
      "        if (measureLineRef.current) { try { canvas.remove(measureLineRef.current); } catch {} }",
      "        if (measureTextRef.current) { try { canvas.remove(measureTextRef.current); } catch {} }",
      "        const sx = measureStartRef.current.x, sy = measureStartRef.current.y;",
      "        const ex = pointer.x, ey = pointer.y;",
      "        const ml = new FLine([sx, sy, ex, ey], {",
      "          stroke: '#E91E63', strokeWidth: 2, strokeDashArray: [6, 3],",
      "          selectable: false, evented: false, excludeFromExport: true,",
      "          originX: 'left', originY: 'top',",
      "        });",
      "        (ml as any)._isMeasureLine = true;",
      "        const distPx = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);",
      "        const distMM = distPx / scaleRef.current;",
      "        const midX = (sx + ex) / 2, midY = (sy + ey) / 2;",
      "        const mt = new FText(distMM.toFixed(1) + ' mm', {",
      "          left: midX + 8, top: midY - 12,",
      "          originX: 'left', originY: 'top',",
      "          fontSize: 12, fill: '#E91E63', fontFamily: 'Arial',",
      "          backgroundColor: 'rgba(255,255,255,0.85)',",
      "          selectable: false, evented: false, excludeFromExport: true,",
      "        });",
      "        (mt as any)._isMeasureLine = true;",
      "        canvas.add(ml); canvas.add(mt);",
      "        measureLineRef.current = ml;",
      "        measureTextRef.current = mt;",
      "        canvas.requestRenderAll();",
      "      });",
      "",
      "      canvas.on('mouse:up', () => {",
      "        if (canvas.defaultCursor !== 'crosshair') return;",
      "        // Keep the measurement visible until next click or mode off",
      "        measureStartRef.current = null;",
      "      });",
    ];
    lines.splice(i + 1, 0, ...measureHandlers);
    changes++;
    console.log("3. Added measure mouse handlers");
    break;
  }
}

// 4. Add Ctrl+Arrow nudge in keyHandler (before the closing of keyHandler)
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Ctrl+D = Duplicate')) {
    const nudgeCode = [
      "        // Arrow keys = nudge (Ctrl = 1px, normal = 5px)",
      "        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {",
      "          const obj = canvas.getActiveObject();",
      "          if (!obj) return;",
      "          e.preventDefault();",
      "          const step = (e.ctrlKey || e.metaKey) ? 1 : 5;",
      "          switch (e.code) {",
      "            case 'ArrowLeft': obj.set('left', (obj.left || 0) - step); break;",
      "            case 'ArrowRight': obj.set('left', (obj.left || 0) + step); break;",
      "            case 'ArrowUp': obj.set('top', (obj.top || 0) - step); break;",
      "            case 'ArrowDown': obj.set('top', (obj.top || 0) + step); break;",
      "          }",
      "          obj.setCoords();",
      "          canvas.requestRenderAll();",
      "        }",
      "",
    ];
    lines.splice(i, 0, ...nudgeCode);
    changes++;
    console.log("4. Added Ctrl+Arrow nudge");
    break;
  }
}

writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done! " + changes + " changes applied");
